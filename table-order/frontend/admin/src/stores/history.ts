import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminApi } from '@/services/admin-api';
import type { OrderHistory } from '@/types';

export const useHistoryStore = defineStore('history', () => {
  const history = ref<OrderHistory[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });

  async function fetchHistory(tableId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const query: { startDate?: string; endDate?: string } = {};
      if (filters.value.startDate) query.startDate = filters.value.startDate;
      if (filters.value.endDate) query.endDate = filters.value.endDate;

      const response = await adminApi.getTableHistory(tableId, query);
      history.value = response.history;
    } catch {
      error.value = '과거 주문 내역을 불러올 수 없습니다.';
    } finally {
      isLoading.value = false;
    }
  }

  function setDateFilter(startDate: string | null, endDate: string | null): void {
    filters.value.startDate = startDate;
    filters.value.endDate = endDate;
  }

  function clearFilters(): void {
    filters.value.startDate = null;
    filters.value.endDate = null;
  }

  return {
    history,
    isLoading,
    error,
    filters,
    fetchHistory,
    setDateFilter,
    clearFilters,
  };
});
