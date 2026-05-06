import type { SSEEvent, ConnectionStatus } from '@/types';

type SSEEventHandler = (event: SSEEvent) => void;
type StatusChangeHandler = (status: ConnectionStatus) => void;

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export class SSEService {
  private eventSource: EventSource | null = null;
  private eventHandlers: SSEEventHandler[] = [];
  private statusHandlers: StatusChangeHandler[] = [];
  private reconnectDelay = INITIAL_RECONNECT_DELAY;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: ConnectionStatus = 'disconnected';
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    this.disconnect();

    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.setStatus('disconnected');
      return;
    }

    const separator = this.url.includes('?') ? '&' : '?';
    const urlWithToken = `${this.url}${separator}token=${encodeURIComponent(token)}`;

    this.eventSource = new EventSource(urlWithToken);

    this.eventSource.onopen = () => {
      this.reconnectDelay = INITIAL_RECONNECT_DELAY;
      this.setStatus('connected');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const parsed: SSEEvent = JSON.parse(event.data);
        this.eventHandlers.forEach((handler) => handler(parsed));
      } catch {
        // Ignore malformed events
      }
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = null;
      this.setStatus('reconnecting');
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setStatus('disconnected');
  }

  onEvent(handler: SSEEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
    };
  }

  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      MAX_RECONNECT_DELAY
    );
  }
}

export function createAdminSSE(): SSEService {
  return new SSEService('/api/sse/admin');
}
