import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dbService } from '@/services/supabase'

const mockAuthGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSchema = vi.fn()

vi.mock('@supabase/supabase-js', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    createClient: () => ({
      auth: { getUser: mockAuthGetUser },
      from: mockFrom,
      schema: mockSchema,
    }),
  }
})

describe('dbService.getUserMonthlyChatUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
  })

  it('returns aggregated values when available', async () => {
    const select = vi.fn().mockReturnThis()
    const eq = vi.fn().mockReturnThis()
    const maybeSingle = vi.fn().mockResolvedValue({ data: { message_count: 10, cost_total: '1.23' }, error: null })

    mockSchema.mockReturnValue({ from: () => ({ select, eq, maybeSingle }) })

    const res = await dbService.getUserMonthlyChatUsage(2025, 10)
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ messageCount: 10, costTotal: 1.23 })
    expect(mockSchema).toHaveBeenCalledWith('analytics')
  })

  it('falls back to analytics.chat_events sum when no aggregated row', async () => {
    // 1st: aggregated monthly returns null
    const select1 = vi.fn().mockReturnThis()
    const eq1 = vi.fn().mockReturnThis()
    const maybeSingle1 = vi.fn().mockResolvedValue({ data: null, error: null })

    // 2nd: events returns rows and count
    const select2 = vi.fn().mockReturnThis()
    const eq2 = vi.fn().mockReturnThis()
    const gte2 = vi.fn().mockReturnThis()
    const lt2 = vi.fn().mockResolvedValue({ data: [{ cost_total: '0.12' }, { cost_total: 0.2 }], count: 5, error: null })

    mockSchema
      .mockReturnValueOnce({ from: () => ({ select: select1, eq: eq1, maybeSingle: maybeSingle1 }) })
      .mockReturnValueOnce({ from: () => ({ select: select2, eq: eq2, gte: gte2, lt: lt2 }) })

    const res = await dbService.getUserMonthlyChatUsage(2025, 10)
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ messageCount: 5, costTotal: 0.32 })
  })

  it('returns zeros for unauthenticated user', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null } })
    const res = await dbService.getUserMonthlyChatUsage(2025, 10)
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ messageCount: 0, costTotal: 0 })
  })

  it('returns error on invalid inputs', async () => {
    const res = await dbService.getUserMonthlyChatUsage('2025', '10')
    expect(res.success).toBe(false)
    expect(res.error).toBeTypeOf('string')
  })
})


