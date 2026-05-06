import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminApi } from '@/services/admin-api';
import type { AdminCredentials } from '@/types';

const TOKEN_KEY = 'admin_token';
const STORE_ID_KEY = 'admin_store_id';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const storeId = ref<string | null>(localStorage.getItem(STORE_ID_KEY));

  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      if (Date.now() >= expiresAt) {
        logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  async function login(credentials: AdminCredentials): Promise<void> {
    const response = await adminApi.login(credentials);
    token.value = response.token;
    storeId.value = credentials.storeId;
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(STORE_ID_KEY, credentials.storeId);
  }

  function logout(): void {
    token.value = null;
    storeId.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORE_ID_KEY);
  }

  function checkAuth(): boolean {
    return isAuthenticated.value;
  }

  function getAuthHeader(): Record<string, string> {
    if (token.value) {
      return { Authorization: `Bearer ${token.value}` };
    }
    return {};
  }

  return {
    token,
    storeId,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    getAuthHeader,
  };
});
