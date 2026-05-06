<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  startDate: string | null;
  endDate: string | null;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'filter', startDate: string | null, endDate: string | null): void;
  (e: 'clear'): void;
}>();

const localStart = ref('');
const localEnd = ref('');

function handleFilter(): void {
  emit('filter', localStart.value || null, localEnd.value || null);
}
</script>

<template>
  <div class="date-filter" data-testid="date-filter">
    <input
      v-model="localStart"
      type="date"
      data-testid="date-filter-start"
    />
    <span>~</span>
    <input
      v-model="localEnd"
      type="date"
      data-testid="date-filter-end"
    />
    <button class="btn btn-primary btn-sm" data-testid="date-filter-apply" @click="handleFilter">
      적용
    </button>
    <button class="btn btn-secondary btn-sm" data-testid="date-filter-clear" @click="emit('clear')">
      초기화
    </button>
  </div>
</template>

<style scoped>
.date-filter { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.date-filter input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
</style>
