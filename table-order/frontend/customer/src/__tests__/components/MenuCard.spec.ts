import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MenuCard from '@/components/menu/MenuCard.vue'
import type { MenuItem } from '@/types/menu'

const mockMenu: MenuItem = {
  id: 1,
  name: '김치찌개',
  price: 8000,
  description: '맛있는 김치찌개',
  imageUrl: 'https://example.com/img.jpg',
  categoryId: 1,
}

describe('MenuCard', () => {
  it('renders menu name and price', () => {
    const wrapper = mount(MenuCard, { props: { menu: mockMenu } })
    expect(wrapper.text()).toContain('김치찌개')
    expect(wrapper.text()).toContain('8,000원')
  })

  it('emits tap event when card is clicked', async () => {
    const wrapper = mount(MenuCard, { props: { menu: mockMenu } })
    await wrapper.find('[data-testid="menu-card"]').trigger('click')
    expect(wrapper.emitted('tap')).toBeTruthy()
    expect(wrapper.emitted('tap')![0]).toEqual([mockMenu])
  })

  it('emits add-to-cart event when add button is clicked', async () => {
    const wrapper = mount(MenuCard, { props: { menu: mockMenu } })
    await wrapper.find('[data-testid="menu-card-add-button"]').trigger('click')
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
    expect(wrapper.emitted('add-to-cart')![0]).toEqual([mockMenu])
  })

  it('does not emit tap when add button is clicked (stopPropagation)', async () => {
    const wrapper = mount(MenuCard, { props: { menu: mockMenu } })
    await wrapper.find('[data-testid="menu-card-add-button"]').trigger('click')
    expect(wrapper.emitted('tap')).toBeFalsy()
  })

  it('has accessible add button with aria-label', () => {
    const wrapper = mount(MenuCard, { props: { menu: mockMenu } })
    const btn = wrapper.find('[data-testid="menu-card-add-button"]')
    expect(btn.attributes('aria-label')).toBe('김치찌개 장바구니에 추가')
  })
})
