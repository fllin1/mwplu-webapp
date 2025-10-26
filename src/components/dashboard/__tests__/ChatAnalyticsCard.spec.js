import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ChatAnalyticsCard from '@/components/dashboard/ChatAnalyticsCard.vue'
import { dbService } from '@/services/supabase'

vi.mock('@/services/supabase', () => ({
  dbService: {
    getUserMonthlyChatUsage: vi.fn(),
  },
}))

describe('ChatAnalyticsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state first, then data', async () => {
    dbService.getUserMonthlyChatUsage.mockResolvedValue({
      success: true,
      data: { messageCount: 12, costTotal: 0.34 },
    })

    const wrapper = shallowMount(ChatAnalyticsCard, {
      global: { stubs: { BaseSpinner: { template: '<div />' } } },
    })

    // Initially shows loading
    expect(wrapper.text()).toContain('Chargement')

    // Wait for mount hook
    await Promise.resolve()
    await Promise.resolve()

    expect(dbService.getUserMonthlyChatUsage).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Messages ce mois')
    expect(wrapper.text()).toMatch(/12/) // formatted number
    expect(wrapper.text()).toMatch(/€|EUR/) // currency symbol present (EUR)
  })

  it('shows 0s when service returns empty values', async () => {
    dbService.getUserMonthlyChatUsage.mockResolvedValue({
      success: true,
      data: { messageCount: 0, costTotal: 0 },
    })

    const wrapper = shallowMount(ChatAnalyticsCard, {
      global: { stubs: { BaseSpinner: { template: '<div />' } } },
    })

    await Promise.resolve(); await Promise.resolve()
    expect(wrapper.text()).toMatch(/0/) // messages 0
  })

  it('renders error when service fails', async () => {
    dbService.getUserMonthlyChatUsage.mockResolvedValue({ success: false, error: 'Boom' })

    const wrapper = shallowMount(ChatAnalyticsCard, {
      global: { stubs: { BaseSpinner: { template: '<div />' } } },
    })

    await Promise.resolve(); await Promise.resolve()
    expect(wrapper.text()).toContain('Boom')
  })
})


