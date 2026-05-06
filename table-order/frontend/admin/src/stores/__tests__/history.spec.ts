import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHistoryStore } from '../history';
import { adminApi } from '@/services/admin-api';

vi.mock('@/services/admin-api', () => ({
  adminApi: {
    getTableHistory: vi.fn(),
  },
}));

describe('useHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchHistory', () => {
    it('should load history for a table', async () => {
      const mockHistory = [
        { id: 'h1', orderNumber: '001', tableNumber: 1, sessionId: 's1', items: [], totalAmount: 15000, createdAt: '2026-05-06T10:00:00Z', completedAt: '2026-05-06T12:00:00Z' },
      ];
      vi.mocked(adminApi.getTableHistory).mockResolvedValue({ history: mockHistory, total: 1 });

      const store = useHistoryStore();
      await store.fetchHistory('table-1');

      expect(store.history).toHaveLength(1);
      expect(store.history[0].orderNumber).toBe('001');
      expect(store.isLoading).toBe(false);
    });

    it('should pass date filters to API', async () => {
      vi.mocked(adminApi.getTableHistory).mockResolvedValue({ history: [], total: 0 });

      const store = useHistoryStore();
      store.setDateFilter('2026-05-01', '2026-05-06');
      await store.fetchHistory('table-1');

      expect(adminApi.getTableHistory).toHaveBeenCalledWith('table-1', {
        startDate: '2026-05-01',
        endDate: '2026-05-06',
      });
    });

    it('should set error on failure', async () => {
      vi.mocked(adminApi.getTableHistory).mockRejectedValue(new Error('fail'));

      const store = useHistoryStore();
      await store.fetchHistory('table-1');

      expect(store.error).toBe('과거 주문 내역을 불러올 수 없습니다.');
    });
  });

  describe('filters', () => {
    it('should set and clear date filters', () => {
      const store = useHistoryStore();

      store.setDateFilter('2026-05-01', '2026-05-06');
      expect(store.filters.startDate).toBe('2026-05-01');
      expect(store.filters.endDate).toBe('2026-05-06');

      store.clearFilters();
      expect(store.filters.startDate).toBeNull();
      expect(store.filters.endDate).toBeNull();
    });
  });
});
