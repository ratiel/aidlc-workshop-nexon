/**
 * Format a number as Korean Won currency
 * e.g., 15000 → "15,000원"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

/**
 * Format a date string to Korean locale
 * e.g., "2026-01-15T10:30:00Z" → "2026. 1. 15. 오전 10:30"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date string to time only
 * e.g., "2026-01-15T10:30:00Z" → "10:30"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
