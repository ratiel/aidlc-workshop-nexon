<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useOrdersStore } from '@/stores/orders';
import AppHeader from '@/components/common/AppHeader.vue';
import TableGrid from '@/components/TableGrid.vue';
import TableFilter from '@/components/TableFilter.vue';
import TableDetailModal from '@/components/TableDetailModal.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorMessage from '@/components/common/ErrorMessage.vue';

const ordersStore = useOrdersStore();
const filterTableId = ref<string | null>(null);

onMounted(async () => {
  await ordersStore.fetchOrders();
  ordersStore.connectSSE();
});

onUnmounted(() => {
  ordersStore.disconnectSSE();
});

function handleTableSelect(tableId: string): void {
  ordersStore.selectedTableId = tableId;
  ordersStore.acknowledgeTable(tableId);
}

function handleCloseDetail(): void {
  ordersStore.selectedTableId = null;
}

function handleFilterChange(tableId: string | null): void {
  filterTableId.value = tableId;
}
</script>

<template>
  <div class="dashboard" data-testid="dashboard-view">
    <AppHeader />
    <main class="dashboard-content">
      <TableFilter
        :tables="ordersStore.sortedTables"
        :selected-table-id="filterTableId"
        @select="handleFilterChange"
      />
      <LoadingSpinner v-if="ordersStore.isLoading" />
      <ErrorMessage
        v-else-if="ordersStore.error"
        :message="ordersStore.error"
        :retryable="true"
        @retry="ordersStore.fetchOrders()"
      />
      <TableGrid
        v-else
        :tables="ordersStore.sortedTables"
        :filter-table-id="filterTableId"
        @select-table="handleTableSelect"
      />
    </main>
    <TableDetailModal
      v-if="ordersStore.selectedTable"
      :table="ordersStore.selectedTable"
      :is-open="!!ordersStore.selectedTableId"
      @close="handleCloseDetail"
    />
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #f5f5f5; }
.dashboard-content { padding: 24px; }
</style>
