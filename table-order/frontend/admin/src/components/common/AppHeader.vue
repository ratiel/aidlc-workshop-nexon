<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useOrdersStore } from '@/stores/orders';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const router = useRouter();

const statusIcon = computed(() => {
  switch (ordersStore.connectionStatus) {
    case 'connected': return '🟢';
    case 'reconnecting': return '🟡';
    case 'disconnected': return '🔴';
  }
});

const statusText = computed(() => {
  switch (ordersStore.connectionStatus) {
    case 'connected': return '연결됨';
    case 'reconnecting': return '재연결 중';
    case 'disconnected': return '연결 끊김';
  }
});

function handleLogout(): void {
  ordersStore.disconnectSSE();
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <header class="app-header" data-testid="app-header">
    <h1 class="app-title">테이블오더 관리자</h1>
    <div class="header-actions">
      <span class="connection-status" data-testid="connection-status">
        {{ statusIcon }} {{ statusText }}
      </span>
      <button
        class="btn btn-logout"
        data-testid="logout-button"
        @click="handleLogout"
      >
        로그아웃
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #1976d2;
  color: white;
}
.app-title { font-size: 18px; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 16px; }
.connection-status { font-size: 13px; }
.btn-logout {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-logout:hover { background: rgba(255,255,255,0.3); }
</style>
