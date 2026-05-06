<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHistoryStore } from '@/stores/history';
import AppHeader from '@/components/common/AppHeader.vue';
import DateFilter from '@/components/DateFilter.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorMessage from '@/components/common/ErrorMessage.vue';

const route = useRoute();
const router = useRouter();
const historyStore = useHistoryStore();

const tableId = route.params.id as string;

onMounted(() => {
  historyStore.fetchHistory(tableId);
});

function handleFilter(startDate: string | null, endDate: string | null): void {
  historyStore.setDateFilter(startDate, endDate);
  historyStore.fetchHistory(tableId);
}

function handleClear(): void {
  historyStore.clearFilters();
  historyStore.fetchHistory(tableId);
}

function goBack(): void {
  router.push('/');
}
</script>

<template>
  <div class="history-page" data-testid="table-history-view">
    <AppHeader />
    <main class="history-content">
      <div class="history-header">
        <h2>과거 주문 내역</h2>
        <button class="btn btn-secondary" data-testid="history-back-button" @click="goBack">
          닫기
        </button>
      </div>
      <DateFilter
        :start-date="historyStore.filters.startDate"
        :end-date="historyStore.filters.endDate"
        @filter="handleFilter"
        @clear="handleClear"
      />
      <LoadingSpinner v-if="historyStore.isLoading" />
      <ErrorMessage
        v-else-if="historyStore.error"
        :message="historyStore.error"
        :retryable="true"
        @retry="historyStore.fetchHistory(tableId)"
      />
      <div v-else class="history-list">
        <div
          v-for="item in historyStore.history"
          :key="item.id"
          class="history-item"
          :data-testid="`history-item-${item.orderNumber}`"
        >
          <div class="history-item-header">
            <span class="order-number">#{{ item.orderNumber }}</span>
            <span class="order-time">{{ new Date(item.createdAt).toLocaleString('ko-KR') }}</span>
          </div>
          <div class="history-item-menus">
            <span v-for="menu in item.items" :key="menu.menuId">
              {{ menu.menuName }} × {{ menu.quantity }}
            </span>
          </div>
          <div class="history-item-footer">
            <span class="total">{{ item.totalAmount.toLocaleString() }}원</span>
            <span class="completed-at">완료: {{ new Date(item.completedAt).toLocaleString('ko-KR') }}</span>
          </div>
        </div>
        <p v-if="historyStore.history.length === 0" class="empty">과거 주문 내역이 없습니다.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.history-page { min-height: 100vh; background: #f5f5f5; }
.history-content { padding: 24px; max-width: 800px; margin: 0 auto; }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.history-header h2 { margin: 0; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { background: white; border-radius: 8px; padding: 16px; }
.history-item-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.order-number { font-weight: 600; }
.order-time { font-size: 13px; color: #666; }
.history-item-menus { font-size: 13px; color: #555; margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 8px; }
.history-item-footer { display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #f0f0f0; padding-top: 8px; }
.total { font-weight: 700; }
.completed-at { color: #999; }
.empty { text-align: center; color: #999; }
</style>
