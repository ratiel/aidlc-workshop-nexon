<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '@/stores/orders';
import type { Table, OrderStatus } from '@/types';
import OrderItem from './OrderItem.vue';
import ConfirmModal from './common/ConfirmModal.vue';

interface Props {
  table: Table;
  isOpen: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const ordersStore = useOrdersStore();
const router = useRouter();

const confirmAction = ref<{ type: string; orderId?: string } | null>(null);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmVariant = ref<'default' | 'danger'>('default');
const toastMessage = ref('');

function handleStatusChange(orderId: string, newStatus: OrderStatus): void {
  if (newStatus === 'COMPLETED') {
    confirmAction.value = { type: 'status', orderId };
    confirmTitle.value = '주문 완료';
    confirmMessage.value = '주문을 완료 처리하시겠습니까?';
    confirmVariant.value = 'default';
  } else {
    executeStatusChange(orderId, newStatus);
  }
}

function handleDeleteOrder(orderId: string): void {
  confirmAction.value = { type: 'delete', orderId };
  confirmTitle.value = '주문 삭제';
  confirmMessage.value = '이 주문을 삭제하시겠습니까?';
  confirmVariant.value = 'danger';
}

function handleCompleteTable(): void {
  confirmAction.value = { type: 'complete' };
  confirmTitle.value = '이용 완료';
  confirmMessage.value = '테이블 이용을 완료하시겠습니까? 현재 주문 내역이 과거 이력으로 이동합니다.';
  confirmVariant.value = 'default';
}

async function handleConfirm(): Promise<void> {
  if (!confirmAction.value) return;
  try {
    switch (confirmAction.value.type) {
      case 'status':
        await executeStatusChange(confirmAction.value.orderId!, 'COMPLETED');
        break;
      case 'delete':
        await ordersStore.deleteOrder(confirmAction.value.orderId!);
        toastMessage.value = '주문이 삭제되었습니다.';
        break;
      case 'complete':
        await ordersStore.completeTable(ordersStore.selectedTableId!);
        toastMessage.value = '테이블 이용이 완료되었습니다.';
        emit('close');
        break;
    }
  } catch (e) {
    toastMessage.value = (e as Error).message;
  }
  confirmAction.value = null;
}

async function executeStatusChange(orderId: string, status: OrderStatus): Promise<void> {
  try {
    await ordersStore.updateOrderStatus(orderId, status);
  } catch (e) {
    toastMessage.value = (e as Error).message;
  }
}

function handleViewHistory(): void {
  router.push(`/tables/${ordersStore.selectedTableId}/history`);
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" data-testid="table-detail-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ table.tableNumber }}번 테이블</h2>
        <button class="btn-close" data-testid="table-detail-close" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="order-list">
          <OrderItem
            v-for="order in table.currentOrders"
            :key="order.id"
            :order="order"
            @status-change="handleStatusChange"
            @delete="handleDeleteOrder"
          />
          <p v-if="table.currentOrders.length === 0" class="empty">주문이 없습니다.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-testid="view-history-button" @click="handleViewHistory">
          과거 내역
        </button>
        <button class="btn btn-primary" data-testid="complete-table-button" @click="handleCompleteTable">
          이용 완료
        </button>
      </div>
    </div>
    <ConfirmModal
      :is-open="!!confirmAction"
      :title="confirmTitle"
      :message="confirmMessage"
      :variant="confirmVariant"
      @confirm="handleConfirm"
      @cancel="confirmAction = null"
    />
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 900; }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #eee; }
.modal-header h2 { margin: 0; }
.btn-close { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px 8px; }
.modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
.modal-footer { display: flex; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #eee; }
.empty { text-align: center; color: #999; }
</style>
