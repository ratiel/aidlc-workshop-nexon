import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'

describe('OrderStatusBadge', () => {
  it('renders pending status', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'pending' } })
    expect(wrapper.text()).toBe('대기중')
    expect(wrapper.attributes('aria-label')).toBe('주문 상태: 대기중')
  })

  it('renders preparing status', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'preparing' } })
    expect(wrapper.text()).toBe('준비중')
    expect(wrapper.attributes('aria-label')).toBe('주문 상태: 준비중')
  })

  it('renders completed status', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'completed' } })
    expect(wrapper.text()).toBe('완료')
    expect(wrapper.attributes('aria-label')).toBe('주문 상태: 완료')
  })

  it('applies correct CSS classes for pending', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'pending' } })
    expect(wrapper.classes()).toContain('text-yellow-800')
  })

  it('applies correct CSS classes for preparing', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'preparing' } })
    expect(wrapper.classes()).toContain('text-blue-800')
  })

  it('applies correct CSS classes for completed', () => {
    const wrapper = mount(OrderStatusBadge, { props: { status: 'completed' } })
    expect(wrapper.classes()).toContain('text-green-800')
  })
})
