<script setup lang="ts">
import type { Table } from '@/types';

interface Props {
  tables: Table[];
  selectedTableId: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ (e: 'select', tableId: string | null): void }>();
</script>

<template>
  <div class="table-filter" data-testid="table-filter">
    <button
      class="filter-btn"
      :class="{ active: !selectedTableId }"
      data-testid="table-filter-all"
      @click="emit('select', null)"
    >
      전체
    </button>
    <button
      v-for="table in tables"
      :key="table.id"
      class="filter-btn"
      :class="{ active: selectedTableId === table.id }"
      :data-testid="`table-filter-${table.tableNumber}`"
      @click="emit('select', table.id)"
    >
      {{ table.tableNumber }}번
    </button>
  </div>
</template>

<style scoped>
.table-filter { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}
.filter-btn.active { background: #1976d2; color: white; border-color: #1976d2; }
</style>
