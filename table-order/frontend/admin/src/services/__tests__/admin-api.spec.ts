import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from '../admin-api';
import * as apiModule from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn(),
  HttpError: class HttpError extends Error {
    constructor(public statusCode: number, public errorBody: unknown) {
      super('error');
    }
  },
}));

describe('adminApi', () => {
  const mockApiRequest = vi.mocked(apiModule.apiRequest);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /admin/login with credentials', async () => {
      mockApiRequest.mockResolvedValue({ token: 'jwt-token', expiresAt: '2026-05-07T00:00:00Z' });

      const result = await adminApi.login({
        storeId: 'store1',
        username: 'admin',
        password: 'pass123',
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ storeId: 'store1', username: 'admin', password: 'pass123' }),
      });
      expect(result.token).toBe('jwt-token');
    });
  });

  describe('getOrders', () => {
    it('should call GET /admin/orders', async () => {
      mockApiRequest.mockResolvedValue({ orders: [] });

      const result = await adminApi.getOrders();

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/orders');
      expect(result.orders).toEqual([]);
    });
  });

  describe('updateOrderStatus', () => {
    it('should call PATCH with order id and status', async () => {
      mockApiRequest.mockResolvedValue({ id: 'order1', status: 'PREPARING' });

      await adminApi.updateOrderStatus('order1', 'PREPARING');

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/orders/order1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PREPARING' }),
      });
    });
  });

  describe('deleteOrder', () => {
    it('should call DELETE with order id', async () => {
      mockApiRequest.mockResolvedValue(undefined);

      await adminApi.deleteOrder('order1');

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/orders/order1', {
        method: 'DELETE',
      });
    });
  });

  describe('completeTable', () => {
    it('should call POST /admin/tables/:id/complete', async () => {
      mockApiRequest.mockResolvedValue(undefined);

      await adminApi.completeTable('table1');

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/tables/table1/complete', {
        method: 'POST',
      });
    });
  });

  describe('getTableHistory', () => {
    it('should call GET with query params', async () => {
      mockApiRequest.mockResolvedValue({ history: [], total: 0 });

      await adminApi.getTableHistory('table1', { startDate: '2026-05-01', endDate: '2026-05-06' });

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/admin/tables/table1/history?startDate=2026-05-01&endDate=2026-05-06'
      );
    });

    it('should call GET without query params when none provided', async () => {
      mockApiRequest.mockResolvedValue({ history: [], total: 0 });

      await adminApi.getTableHistory('table1');

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/tables/table1/history');
    });
  });

  describe('setupTable', () => {
    it('should call POST /admin/tables/setup', async () => {
      mockApiRequest.mockResolvedValue(undefined);

      await adminApi.setupTable({ tableNumber: 3, password: '1234' });

      expect(mockApiRequest).toHaveBeenCalledWith('/admin/tables/setup', {
        method: 'POST',
        body: JSON.stringify({ tableNumber: 3, password: '1234' }),
      });
    });
  });
});
