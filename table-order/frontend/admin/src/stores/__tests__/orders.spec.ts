import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOrdersStore } from '../orders';
import { adminApi } from '@/services/admin-api';
import type { Order } from '@/types';

vi.mock('@/services/admin-api', () => ({
  adminApi: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    completeTable: vi.fn(),
  },
}));

vi.mock('@/services/sse', () => ({
  createAdminSSE: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onEvent: vi.fn(),
    onStatusChange: vi.fn(),
  })),
  SSEService: vi.fn(),
}));

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: '001',
    tableId: 'table-1',
    tableNumber: 1,
    sessionId: 'session-1',
    items: [{ menuId: 'm1', menuName: '김치찌개', quantity: 1, unitPrice: 9000, subtotal: 9000 }],
    totalAmount: 9000,
    status: 'PENDING',
    createdAt: '2026-05-06T12:00:00Z',
    ...overrides,
  };
}

describe('useOrdersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchOrders', () => {
    it('should group orders by table', async () => {
      const orders = [
        createMockOrder({ id: 'o1', tableId: 't1', tableNumber: 1, totalAmount: 9000 }),
        createMockOrder({ id: 'o2', tableId: 't1', tableNumber: 1, totalAmount: 12000 }),
        createMockOrder({ id: 'o3', tableId: 't2', tableNumber: 2, totalAmount: 8000 }),
      ];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });

      const store = useOrdersStore();
      await store.fetchOrders();

      expect(store.tables.size).toBe(2);
      expect(store.tables.get('t1')!.currentOrders).toHaveLength(2);
      expect(store.tables.get('t1')!.totalAmount).toBe(21000);
      expect(store.tables.get('t2')!.currentOrders).toHaveLength(1);
    });

    it('should set error on failure', async () => {
      vi.mocked(adminApi.getOrders).mockRejectedValue(new Error('Network error'));

      const store = useOrdersStore();
      await expect(store.fetchOrders()).rejects.toThrow();
      expect(store.error).toBe('주문 데이터를 불러올 수 없습니다.');
    });
  });

  describe('sortedTables', () => {
    it('should sort tables by latest order time descending', async () => {
      const orders = [
        createMockOrder({ tableId: 't1', tableNumber: 1, createdAt: '2026-05-06T10:00:00Z' }),
        createMockOrder({ tableId: 't2', tableNumber: 2, createdAt: '2026-05-06T12:00:00Z' }),
        createMockOrder({ tableId: 't3', tableNumber: 3, createdAt: '2026-05-06T11:00:00Z' }),
      ];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });

      const store = useOrdersStore();
      await store.fetchOrders();

      const sorted = store.sortedTables;
      expect(sorted[0].tableNumber).toBe(2); // most recent
      expect(sorted[1].tableNumber).toBe(3);
      expect(sorted[2].tableNumber).toBe(1); // oldest
    });
  });

  describe('updateOrderStatus', () => {
    it('should optimistically update and rollback on failure', async () => {
      const orders = [createMockOrder({ id: 'o1', tableId: 't1', status: 'PENDING' })];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });
      vi.mocked(adminApi.updateOrderStatus).mockRejectedValue(new Error('fail'));

      const store = useOrdersStore();
      await store.fetchOrders();

      await expect(store.updateOrderStatus('o1', 'PREPARING')).rejects.toThrow();

      const table = store.tables.get('t1')!;
      expect(table.currentOrders[0].status).toBe('PENDING'); // rolled back
    });
  });

  describe('deleteOrder', () => {
    it('should remove order and recalculate total', async () => {
      const orders = [
        createMockOrder({ id: 'o1', tableId: 't1', totalAmount: 9000 }),
        createMockOrder({ id: 'o2', tableId: 't1', totalAmount: 12000 }),
      ];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });
      vi.mocked(adminApi.deleteOrder).mockResolvedValue(undefined);

      const store = useOrdersStore();
      await store.fetchOrders();
      await store.deleteOrder('o1');

      const table = store.tables.get('t1')!;
      expect(table.currentOrders).toHaveLength(1);
      expect(table.totalAmount).toBe(12000);
    });
  });

  describe('completeTable', () => {
    it('should reset table state', async () => {
      const orders = [createMockOrder({ tableId: 't1' })];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });
      vi.mocked(adminApi.completeTable).mockResolvedValue(undefined);

      const store = useOrdersStore();
      await store.fetchOrders();
      await store.completeTable('t1');

      const table = store.tables.get('t1')!;
      expect(table.currentOrders).toHaveLength(0);
      expect(table.totalAmount).toBe(0);
      expect(table.sessionId).toBeNull();
    });
  });

  describe('SSE event handlers', () => {
    it('should handle new_order event', async () => {
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders: [] });

      const store = useOrdersStore();
      await store.fetchOrders();

      const newOrder = createMockOrder({ id: 'new-1', tableId: 't5', tableNumber: 5 });
      store.handleSSEEvent({ type: 'new_order', data: newOrder });

      expect(store.tables.has('t5')).toBe(true);
      expect(store.tables.get('t5')!.isHighlighted).toBe(true);
      expect(store.tables.get('t5')!.currentOrders).toHaveLength(1);
    });

    it('should handle order_status_changed event', async () => {
      const orders = [createMockOrder({ id: 'o1', tableId: 't1', status: 'PENDING' })];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });

      const store = useOrdersStore();
      await store.fetchOrders();

      store.handleSSEEvent({
        type: 'order_status_changed',
        data: { orderId: 'o1', tableId: 't1', newStatus: 'PREPARING' },
      });

      expect(store.tables.get('t1')!.currentOrders[0].status).toBe('PREPARING');
    });

    it('should handle table_completed event', async () => {
      const orders = [createMockOrder({ tableId: 't1' })];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });

      const store = useOrdersStore();
      await store.fetchOrders();

      store.handleSSEEvent({ type: 'table_completed', data: { tableId: 't1' } });

      expect(store.tables.get('t1')!.currentOrders).toHaveLength(0);
      expect(store.tables.get('t1')!.totalAmount).toBe(0);
    });
  });

  describe('acknowledgeTable', () => {
    it('should remove highlight from table', async () => {
      const orders = [createMockOrder({ tableId: 't1' })];
      vi.mocked(adminApi.getOrders).mockResolvedValue({ orders });

      const store = useOrdersStore();
      await store.fetchOrders();

      // Simulate new order highlight
      store.handleSSEEvent({ type: 'new_order', data: createMockOrder({ tableId: 't1', id: 'o2' }) });
      expect(store.tables.get('t1')!.isHighlighted).toBe(true);

      store.acknowledgeTable('t1');
      expect(store.tables.get('t1')!.isHighlighted).toBe(false);
    });
  });
});
