import type { SSEEvent } from '@/types/sse'

type SSEEventHandler = (event: SSEEvent) => void
type SSEStatusHandler = (status: SSEConnectionStatus) => void

export type SSEConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

const RECONNECT_BASE_DELAY = 1000
const RECONNECT_MAX_DELAY = 30000
const RECONNECT_JITTER_FACTOR = 0.1

class SSEManager {
  private eventSource: EventSource | null = null
  private eventHandlers: SSEEventHandler[] = []
  private statusHandlers: SSEStatusHandler[] = []
  private status: SSEConnectionStatus = 'disconnected'
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private tableId: number | null = null
  private token: string | null = null

  connect(tableId: number, token: string): void {
    this.tableId = tableId
    this.token = token
    this.createConnection()
  }

  disconnect(): void {
    this.clearReconnectTimer()
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.tableId = null
    this.token = null
    this.reconnectAttempt = 0
    this.setStatus('disconnected')
  }

  onEvent(handler: SSEEventHandler): () => void {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler)
    }
  }

  onStatusChange(handler: SSEStatusHandler): () => void {
    this.statusHandlers.push(handler)
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler)
    }
  }

  getStatus(): SSEConnectionStatus {
    return this.status
  }

  private createConnection(): void {
    if (!this.tableId || !this.token) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const url = `${baseUrl}/sse/customer/${this.tableId}?token=${encodeURIComponent(this.token)}`

    this.eventSource = new EventSource(url)

    this.eventSource.onopen = () => {
      this.reconnectAttempt = 0
      this.setStatus('connected')
    }

    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data)
        this.dispatchEvent(data)
      } catch {
        console.warn('[SSE] Failed to parse event:', event.data)
      }
    }

    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }
      this.setStatus('reconnecting')
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer()

    const delay = this.getReconnectDelay()
    this.reconnectAttempt++

    this.reconnectTimer = setTimeout(() => {
      this.createConnection()
    }, delay)
  }

  private getReconnectDelay(): number {
    const exponentialDelay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempt),
      RECONNECT_MAX_DELAY
    )
    const jitter = exponentialDelay * RECONNECT_JITTER_FACTOR * (Math.random() * 2 - 1)
    return Math.max(0, exponentialDelay + jitter)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private setStatus(status: SSEConnectionStatus): void {
    this.status = status
    this.statusHandlers.forEach((handler) => handler(status))
  }

  private dispatchEvent(event: SSEEvent): void {
    this.eventHandlers.forEach((handler) => handler(event))
  }
}

export const sseManager = new SSEManager()
