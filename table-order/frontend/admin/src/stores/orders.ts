import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminApi } from '@/services/admin-api';
import { createAdminSSE, SSEService } from '@/services/sse';
import type { Table, Order, OrderStatus, ConnectionStatus, SSEEvent } from '@/types';

export const useOrdersStore = defineStore('orders', () => {
  const tables = ref<Map<string, Table>>(new Map());
  const selectedTableId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const connectionStatus = ref<ConnectionStatus>('disconnected');

  let sseService: SSEService | null = null;

  // Getters
  const sortedTables = computed<Table[]>(() => {
    const tableList = Array.from(tables.value.values());
    return tableList.sort((a, b) => {
      if (!a.lastOrderAt && !b.lastOrderAt) return a.tableNumber - b.tableNumber;
      if (!a.lastOrderAt) return 1;
      if (!b.lastOrderAt) return -1;
      return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
    });
  });

  const selectedTable = computed<Table | null>(() => {
    if (!selectedTableId.value) return null;
    return tables.value.get(selectedTableId.value) || null;
  });

  const highlightedTables = computed<Table[]>(() => {
    return Array.from(tables.value.values()).filter((t) => t.isHighlighted);
  });

  // Actions
  async function fetchOrders(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await adminApi.getOrders();
      groupOrdersByTable(response.orders);
    } catch (e) {
      error.value = '주문 데이터를 불러올 수 없습니다.';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const table = findTableByOrderId(orderId);
    if (!table) return;

    const order = table.currentOrders.find((o) => o.id === orderId);
    if (!order) return;

    const previousStatus = order.status;
    order.status = newStatus; // Optimistic update

    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
    } catch {
      order.status = previousStatus; // Rollback
      throw new Error('주문 상태 변경에 실패했습니다.');
    }
  }

  async function deleteOrder(orderId: string): Promise<void> {
    const table = findTableByOrderId(orderId);
    if (!table) return;

    try {
      await adminApi.deleteOrder(orderId);
      table.currentOrders = table.currentOrders.filter((o) => o.id !== orderId);
      table.totalAmount = table.currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    } catch {
      throw new Error('주문 삭제에 실패했습니다.');
    }
  }

  async function completeTable(tableId: string): Promise<void> {
    try {
      await adminApi.completeTable(tableId);
      const table = tables.value.get(tableId);
      if (table) {
        table.currentOrders = [];
        table.totalAmount = 0;
        table.sessionId = null;
        table.isHighlighted = false;
        table.lastOrderAt = null;
      }
    } catch {
      throw new Error('테이블 이용 완료 처리에 실패했습니다.');
    }
  }

  function acknowledgeTable(tableId: string): void {
    const table = tables.value.get(tableId);
    if (table) {
      table.isHighlighted = false;
    }
  }

  // SSE
  function connectSSE(): void {
    sseService = createAdminSSE();
    sseService.onEvent(handleSSEEvent);
    sseService.onStatusChange((status) => {
      connectionStatus.value = status;
      if (status === 'connected') {
        fetchOrders(); // Sync on reconnect
      }
    });
    sseService.connect();
  }

  function disconnectSSE(): void {
    sseService?.disconnect();
    sseService = null;
    connectionStatus.value = 'disconnected';
  }

  function handleSSEEvent(event: SSEEvent): void {
    switch (event.type) {
      case 'new_order':
        handleNewOrder(event.data);
        break;
      case 'order_status_changed':
        handleOrderStatusChanged(event.data);
        break;
      case 'order_deleted':
        handleOrderDeleted(event.data);
        break;
      case 'table_completed':
        handleTableCompleted(event.data);
        break;
    }
  }

  function handleNewOrder(order: Order): void {
    let table = tables.value.get(order.tableId);
    if (!table) {
      table = {
        id: order.tableId,
        tableNumber: order.tableNumber,
        sessionId: order.sessionId,
        currentOrders: [],
        totalAmount: 0,
        lastOrderAt: null,
        isHighlighted: false,
      };
      tables.value.set(order.tableId, table);
    }
    table.currentOrders.unshift(order);
    table.totalAmount += order.totalAmount;
    table.lastOrderAt = order.createdAt;
    table.isHighlighted = true;
  }

  function handleOrderStatusChanged(data: { orderId: string; tableId: string; newStatus: OrderStatus }): void {
    const table = tables.value.get(data.tableId);
    if (!table) return;
    const order = table.currentOrders.find((o) => o.id === data.orderId);
    if (order) {
      order.status = data.newStatus;
    }
  }

  function handleOrderDeleted(data: { orderId: string; tableId: string; newTotalAmount: number }): void {
    const table = tables.value.get(data.tableId);
    if (!table) return;
    table.currentOrders = table.currentOrders.filter((o) => o.id !== data.orderId);
    table.totalAmount = data.newTotalAmount;
  }

  function handleTableCompleted(data: { tableId: string }): void {
    const table = tables.value.get(data.tableId);
    if (table) {
      table.currentOrders = [];
      table.totalAmount = 0;
      table.sessionId = null;
      table.isHighlighted = false;
      table.lastOrderAt = null;
    }
  }

  // Helpers
  function groupOrdersByTable(orders: Order[]): void {
    const grouped = new Map<string, Table>();
    for (const order of orders) {
      let table = grouped.get(order.tableId);
      if (!table) {
        table = {
          id: order.tableId,
          tableNumber: order.tableNumber,
          sessionId: order.sessionId,
          currentOrders: [],
          totalAmount: 0,
          lastOrderAt: null,
          isHighlighted: false,
        };
        grouped.set(order.tableId, table);
      }
      table.currentOrders.push(order);
      table.totalAmount += order.totalAmount;
      if (!table.lastOrderAt || order.createdAt > table.lastOrderAt) {
        table.lastOrderAt = order.createdAt;
      }
    }
    tables.value = grouped;
  }

  function findTableByOrderId(orderId: string): Table | undefined {
    for (const table of tables.value.values()) {
      if (table.currentOrders.some((o) => o.id === orderId)) {
        return table;
      }
    }
    return undefined;
  }

  return {
    tables,
    selectedTableId,
    isLoading,
    error,
    connectionStatus,
    sortedTables,
    selectedTable,
    highlightedTables,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    completeTable,
    acknowledgeTable,
    connectSSE,
    disconnectSSE,
    handleSSEEvent,
  };
});
