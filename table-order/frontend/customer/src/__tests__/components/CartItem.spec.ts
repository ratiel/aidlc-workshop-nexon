import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CartItem from '@/components/cart/CartItem.vue'
import type { CartItem as CartItemType } from '@/types/cart'

const mockItem: CartItemType = {
  menuId: 1,
  name: '김치찌개',
  price: 8000,
  quantity: 2,
  imageUrl: 'https://example.com/img.jpg',
}

describe('CartItem', () => {
  it('renders item name and price', () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    expect(wrapper.text()).toContain('김치찌개')
    expect(wrapper.text()).toContain('8,000원')
  })

  it('renders quantity', () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    expect(wrapper.text()).toContain('2')
  })

  it('emits increment event', async () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    await wrapper.find('[data-testid="cart-item-increment"]').trigger('click')
    expect(wrapper.emitted('increment')).toBeTruthy()
    expect(wrapper.emitted('increment')![0]).toEqual([1])
  })

  it('emits decrement event', async () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    await wrapper.find('[data-testid="cart-item-decrement"]').trigger('click')
    expect(wrapper.emitted('decrement')).toBeTruthy()
    expect(wrapper.emitted('decrement')![0]).toEqual([1])
  })

  it('emits remove event', async () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    await wrapper.find('[data-testid="cart-item-remove"]').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')![0]).toEqual([1])
  })

  it('has accessible buttons with aria-labels', () => {
    const wrapper = mount(CartItem, { props: { item: mockItem } })
    expect(wrapper.find('[data-testid="cart-item-increment"]').attributes('aria-label')).toBe('김치찌개 수량 증가')
    expect(wrapper.find('[data-testid="cart-item-decrement"]').attributes('aria-label')).toBe('김치찌개 수량 감소')
    expect(wrapper.find('[data-testid="cart-item-remove"]').attributes('aria-label')).toBe('김치찌개 삭제')
  })
})
