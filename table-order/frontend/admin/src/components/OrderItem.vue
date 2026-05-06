<script setup lang="ts">
import { computed } from 'vue';
import type { Order, OrderStatus } from '@/types';

interface Props {
  order: Order;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'status-change', orderId: string, status: OrderStatus): void;
  (e: 'delete', orderId: string): void;
}>();

const statusLabel = computed(() => {
  switch (props.order.status) {
    case 'PENDING': return '대기중';
    case 'PREPARING': return '준비중';
    case 'COMPLETED': return '완료';
  }
});

const statusClass = computed(() => `status-${props.order.status.toLowerCase()}`);

const canAdvance = computed(() => props.order.status !== 'COMPLETED');

const nextStatus = computed<OrderStatus | null>(() => {
  switch (props.order.status) {
    case 'PENDING': return 'PREPARING';
    case 'PREPARING': return 'COMPLETED';
    default: return null;
  }
});

const nextStatusLabel = computed(() => {
  switch (nextStatus.value) {
    case 'PREPARING': return '준비중';
    case 'COMPLETED': return '완료';
    default: return '';
  }
});

function handleAdvance(): void {
  if (nextStatus.value) {
    emit('status-change', props.order.id, nextStatus.value);
  }
}
</script>

<template>
  <div class="order-item" :data-testid="`order-item-${order.orderNumber}`">
    <div class="order-header">
      <span class="order-number">#{{ order.orderNumber }}</span>
      <span class="order-status" :class="statusClass">{{ statusLabel }}</span>
    </div>
    <div class="order-items">
      <div v-for="item in order.items" :key="item.menuId" class="menu-item">
        <span>{{ item.menuName }} × {{ item.quantity }}</span>
        <span>{{ item.subtotal.toLocaleString() }}원</span>
      </div>
    </div>
    <div class="order-footer">
      <span class="order-total">{{ order.totalAmount.toLocaleString() }}원</span>
      <div class="order-actions">
        <button
          v-if="canAdvance"
          class="btn btn-sm btn-primary"
          :data-testid="`order-advance-${order.orderNumber}`"
          @click="handleAdvance"
        >
          → {{ nextStatusLabel }}
        </button>
        <button
          class="btn btn-sm btn-danger"
          :data-testid="`order-delete-${order.orderNumber}`"
          @click="emit('delete', order.id)"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-item { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.order-number { font-weight: 600; }
.order-status { font-size: 12px; padding: 2px 8px; border-radius: 12px; }
.status-pending { background: #fff3e0; color: #e65100; }
.status-preparing { background: #e3f2fd; color: #1565c0; }
.status-completed { background: #e8f5e9; color: #2e7d32; }
.order-items { margin-bottom: 8px; }
.menu-item { display: flex; justify-content: space-between; font-size: 13px; padding: 2px 0; }
.order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 8px; }
.order-total { font-weight: 700; }
.order-actions { display: flex; gap: 8px; }
.btn-sm { padding: 4px 10px; font-size: 12px; }
</style>
