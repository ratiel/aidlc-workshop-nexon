<script setup lang="ts">
import { computed } from 'vue';
import type { Table } from '@/types';
import TableCard from './TableCard.vue';

interface Props {
  tables: Table[];
  filterTableId: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'select-table', tableId: string): void }>();

const filteredTables = computed(() => {
  if (!props.filterTableId) return props.tables;
  return props.tables.filter((t) => t.id === props.filterTableId);
});
</script>

<template>
  <div class="table-grid" data-testid="table-grid">
    <TableCard
      v-for="table in filteredTables"
      :key="table.id"
      :table="table"
      @click="emit('select-table', table.id)"
    />
    <p v-if="filteredTables.length === 0" class="empty-text">
      표시할 테이블이 없습니다.
    </p>
  </div>
</template>

<style scoped>
.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.empty-text { text-align: center; color: #999; grid-column: 1 / -1; }
@media (max-width: 1023px) { .table-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) { .table-grid { grid-template-columns: 1fr; } }
</style>
