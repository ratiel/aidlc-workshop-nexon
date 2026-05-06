/**
 * Sanitize user input by trimming and removing HTML tags
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate table number (positive integer, 1-999)
 */
export function validateTableNumber(input: string | number): number | null {
  const num = typeof input === 'number' ? input : parseInt(input, 10)
  if (isNaN(num) || num < 1 || num > 999) return null
  return num
}

/**
 * Check if a value is non-empty (works with strings and numbers)
 */
export function isNonEmpty(value: string | number): boolean {
  if (typeof value === 'number') return !isNaN(value)
  return value.trim().length > 0
}

/**
 * Validate store ID (non-empty, max 50 chars)
 */
export function validateStoreId(input: string): string | null {
  const sanitized = sanitizeInput(input)
  if (sanitized.length === 0 || sanitized.length > 50) return null
  return sanitized
}
