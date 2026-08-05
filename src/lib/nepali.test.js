import { describe, it, expect } from 'vitest'
import { parse, format, nextMonth, shortDate } from './nepali.js'

describe('parse', () => {
  it('parses a YYYY/M/D date', () => {
    expect(parse('2081/12/1')).toEqual({ year: 2081, month: 12, day: 1 })
  })
  it('throws on the wrong shape or out-of-range values', () => {
    expect(() => parse('2081/12')).toThrow()
    expect(() => parse('2081/13/1')).toThrow()
    expect(() => parse('2081/x/1')).toThrow()
  })
})

describe('nextMonth', () => {
  it('advances within a year', () => {
    expect(nextMonth(parse('2081/1/1'))).toEqual({ year: 2081, month: 2, day: 1 })
  })
  it('rolls the year over after month 12', () => {
    expect(nextMonth(parse('2081/12/1'))).toEqual({ year: 2082, month: 1, day: 1 })
  })
})

describe('format / shortDate', () => {
  it('round-trips a date and shortens for labels', () => {
    expect(format({ year: 2082, month: 1, day: 1 })).toBe('2082/1/1')
    expect(shortDate('2081/12/1')).toBe('12/1')
  })
})
