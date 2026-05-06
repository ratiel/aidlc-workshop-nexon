import type { Directive } from 'vue'

export const vLazyImage: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    el.classList.add('opacity-0', 'transition-opacity', 'duration-300')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = binding.value
          el.onload = () => {
            el.classList.remove('opacity-0')
            el.classList.add('opacity-100')
          }
          el.onerror = () => {
            el.classList.remove('opacity-0')
            el.classList.add('opacity-100')
            el.alt = el.alt || '이미지를 불러올 수 없습니다'
          }
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(el)
  },
}
