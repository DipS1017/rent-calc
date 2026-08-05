import { describe, it, expect } from 'vitest'
import { computeTotals, billOf, money } from './calc.js'

describe('computeTotals', () => {
  it('derives units, electricity, and a single total due', () => {
    // 30 units × 15 = 450; total = 15000+500+300+1000(internet)+450 = 17250.
    expect(computeTotals(15000, 500, 300, 1000, 130, 160, 15, 0)).toEqual({
      units: 30,
      electricity: 450,
      totalDue: 17250,
    })
  })
  it('clamps a meter rollback to zero', () => {
    expect(computeTotals(15000, 500, 300, 0, 130, 90, 15, 0)).toEqual({
      units: 0,
      electricity: 0,
      totalDue: 15800,
    })
  })
  it('folds outstanding into the total due', () => {
    // 32 units × 15 = 480; total = 15000+500+300+1000+480+2000 = 19280.
    expect(computeTotals(15000, 500, 300, 1000, 1573, 1605, 15, 2000)).toEqual({
      units: 32,
      electricity: 480,
      totalDue: 19280,
    })
  })
  it('treats a missing previous meter as no usage', () => {
    expect(computeTotals(15000, 500, 300, 0, 0, 1605, 15, 0).units).toBe(0)
  })
})

describe('billOf', () => {
  it('is the row total due', () => {
    expect(billOf({ totalDue: 17250 })).toBe(17250)
  })
})

describe('money', () => {
  it('adds thousands separators and handles negatives', () => {
    expect(money(19000)).toBe('19,000')
    expect(money(1155)).toBe('1,155')
    expect(money(500)).toBe('500')
    expect(money(-16955)).toBe('-16,955')
  })
})
