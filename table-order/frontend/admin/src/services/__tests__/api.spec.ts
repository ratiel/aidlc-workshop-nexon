import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, HttpError } from '../api';

describe('apiRequest', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make a GET request with correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });

    await apiRequest('/admin/orders');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/orders',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should include Authorization header when token exists', async () => {
    localStorage.setItem('admin_token', 'test-token');
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiRequest('/admin/orders');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/orders',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should not include Authorization header when no token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiRequest('/admin/orders');

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBeUndefined();
  });

  it('should throw HttpError on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad Request', message: 'Invalid input', statusCode: 400 }),
    });

    await expect(apiRequest('/admin/orders')).rejects.toThrow(HttpError);
  });

  it('should remove token and redirect on 401', async () => {
    localStorage.setItem('admin_token', 'expired-token');
    const mockLocation = { href: '' };
    vi.stubGlobal('window', { location: mockLocation });

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized', message: 'Token expired', statusCode: 401 }),
    });

    await expect(apiRequest('/admin/orders')).rejects.toThrow(HttpError);
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  it('should return undefined for 204 responses', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await apiRequest('/admin/orders/1');
    expect(result).toBeUndefined();
  });

  it('should pass method and body for POST requests', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ token: 'abc' }),
    });

    await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin' }),
      })
    );
  });
});
