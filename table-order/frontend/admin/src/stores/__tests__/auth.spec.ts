import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import { adminApi } from '@/services/admin-api';

vi.mock('@/services/admin-api', () => ({
  adminApi: {
    login: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should be unauthenticated when no token', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
      expect(store.token).toBeNull();
    });

    it('should restore token from localStorage', () => {
      // Create a valid JWT with future expiration
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const fakeToken = `header.${payload}.signature`;
      localStorage.setItem('admin_token', fakeToken);

      setActivePinia(createPinia());
      const store = useAuthStore();
      expect(store.token).toBe(fakeToken);
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should store token on successful login', async () => {
      vi.mocked(adminApi.login).mockResolvedValue({
        token: 'new-jwt-token',
        expiresAt: '2026-05-07T00:00:00Z',
      });

      const store = useAuthStore();
      await store.login({ storeId: 'store1', username: 'admin', password: 'pass' });

      expect(store.token).toBe('new-jwt-token');
      expect(localStorage.getItem('admin_token')).toBe('new-jwt-token');
      expect(localStorage.getItem('admin_store_id')).toBe('store1');
    });

    it('should throw on failed login', async () => {
      vi.mocked(adminApi.login).mockRejectedValue(new Error('Unauthorized'));

      const store = useAuthStore();
      await expect(
        store.login({ storeId: 'store1', username: 'admin', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should clear token and localStorage', () => {
      localStorage.setItem('admin_token', 'some-token');
      localStorage.setItem('admin_store_id', 'store1');

      const store = useAuthStore();
      store.logout();

      expect(store.token).toBeNull();
      expect(store.storeId).toBeNull();
      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(localStorage.getItem('admin_store_id')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false for expired token', () => {
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 100 }));
      const expiredToken = `header.${payload}.signature`;
      localStorage.setItem('admin_token', expiredToken);

      setActivePinia(createPinia());
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });
  });
});
