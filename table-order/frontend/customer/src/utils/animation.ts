import { ref, onMounted, onUnmounted } from 'vue'

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 300,
  emphasis: 500,
} as const

export const ANIMATION_EASING = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

/**
 * Composable to detect prefers-reduced-motion
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false)

  let mediaQuery: MediaQueryList | null = null

  function updateMotionPreference(event: MediaQueryListEvent | MediaQueryList) {
    prefersReducedMotion.value = event.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', updateMotionPreference)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', updateMotionPreference)
  })

  return prefersReducedMotion
}
