/**
 * Sanitize user input by trimming and removing HTML tags
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate table number (positive integer, 1-999)
 */
export function validateTableNumber(input: string): number | null {
  const num = parseInt(input, 10)
  if (isNaN(num) || num < 1 || num > 999) return null
  return num
}

/**
 * Check if a string is non-empty after trimming
 */
export function isNonEmpty(value: string): boolean {
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
