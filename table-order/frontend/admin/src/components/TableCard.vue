<script setup lang="ts">
import { computed } from 'vue';
import type { Table, Order } from '@/types';

interface Props {
  table: Table;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'click'): void }>();

const latestOrders = computed<Order[]>(() => {
  return props.table.currentOrders.slice(0, 3);
});

const formattedAmount = computed(() => {
  return props.table.totalAmount.toLocaleString('ko-KR') + '원';
});

function orderSummary(order: Order): string {
  const firstName = order.items[0]?.menuName || '';
  const extraCount = order.items.length - 1;
  return extraCount > 0 ? `${firstName} 외 ${extraCount}건` : firstName;
}
</script>

<template>
  <div
    class="table-card"
    :class="{ highlighted: props.table.isHighlighted }"
    :data-testid="`table-card-${props.table.tableNumber}`"
    @click="emit('click')"
  >
    <div class="card-header">
      <span class="table-number">{{ props.table.tableNumber }}번 테이블</span>
      <span class="total-amount">{{ formattedAmount }}</span>
    </div>
    <div class="card-body">
      <div v-if="latestOrders.length === 0" class="no-orders">주문 없음</div>
      <div v-else class="order-previews">
        <div
          v-for="order in latestOrders"
          :key="order.id"
          class="order-preview"
        >
          <span class="order-number">#{{ order.orderNumber }}</span>
          <span class="order-summary">{{ orderSummary(order) }}</span>
          <span class="order-amount">{{ order.totalAmount.toLocaleString() }}원</span>
        </div>
        <div v-if="props.table.currentOrders.length > 3" class="more-orders">
          ... 외 {{ props.table.currentOrders.length - 3 }}건
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.table-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.table-card.highlighted {
  border-color: #ff9800;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 152, 0, 0); }
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.table-number { font-weight: 600; font-size: 16px; }
.total-amount { font-weight: 700; color: #1976d2; }
.no-orders { color: #999; font-size: 14px; }
.order-previews { display: flex; flex-direction: column; gap: 6px; }
.order-preview { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.order-number { color: #666; min-width: 50px; }
.order-summary { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-amount { color: #333; font-weight: 500; }
.more-orders { font-size: 12px; color: #999; text-align: center; margin-top: 4px; }
</style>
