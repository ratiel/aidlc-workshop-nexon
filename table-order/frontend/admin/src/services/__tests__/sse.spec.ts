import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SSEService } from '../sse';

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 0;
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  close = vi.fn();
}

describe('SSEService', () => {
  let sseService: SSEService;
  let mockEventSource: MockEventSource;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem('admin_token', 'test-token');

    vi.stubGlobal('EventSource', vi.fn((url: string) => {
      mockEventSource = new MockEventSource(url);
      return mockEventSource;
    }));

    sseService = new SSEService('/api/sse/admin');
  });

  afterEach(() => {
    sseService.disconnect();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should connect with token in URL', () => {
    sseService.connect();

    expect(mockEventSource.url).toContain('token=test-token');
  });

  it('should set status to connected on open', () => {
    const statusHandler = vi.fn();
    sseService.onStatusChange(statusHandler);
    sseService.connect();

    mockEventSource.onopen!();

    expect(statusHandler).toHaveBeenCalledWith('connected');
  });

  it('should parse and dispatch events', () => {
    const eventHandler = vi.fn();
    sseService.onEvent(eventHandler);
    sseService.connect();
    mockEventSource.onopen!();

    const orderEvent = { type: 'new_order', data: { id: '1', orderNumber: '001' } };
    mockEventSource.onmessage!({ data: JSON.stringify(orderEvent) });

    expect(eventHandler).toHaveBeenCalledWith(orderEvent);
  });

  it('should attempt reconnection on error', () => {
    const statusHandler = vi.fn();
    sseService.onStatusChange(statusHandler);
    sseService.connect();
    mockEventSource.onopen!();

    mockEventSource.onerror!();

    expect(statusHandler).toHaveBeenCalledWith('reconnecting');
  });

  it('should use exponential backoff for reconnection', () => {
    sseService.connect();
    mockEventSource.onerror!();

    // First reconnect after 1000ms
    vi.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(2);

    // Trigger another error
    mockEventSource.onerror!();

    // Second reconnect after 2000ms
    vi.advanceTimersByTime(2000);
    expect(EventSource).toHaveBeenCalledTimes(3);
  });

  it('should not connect without token', () => {
    localStorage.removeItem('admin_token');
    sseService.connect();

    expect(sseService.getConnectionStatus()).toBe('disconnected');
  });

  it('should clean up on disconnect', () => {
    sseService.connect();
    sseService.disconnect();

    expect(mockEventSource.close).toHaveBeenCalled();
    expect(sseService.getConnectionStatus()).toBe('disconnected');
  });

  it('should allow unsubscribing event handlers', () => {
    const handler = vi.fn();
    const unsubscribe = sseService.onEvent(handler);
    sseService.connect();
    mockEventSource.onopen!();

    unsubscribe();
    mockEventSource.onmessage!({ data: JSON.stringify({ type: 'new_order', data: {} }) });

    expect(handler).not.toHaveBeenCalled();
  });
});
