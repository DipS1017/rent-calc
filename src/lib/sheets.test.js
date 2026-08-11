import { describe, it, expect } from 'vitest'
import { parseRow, rowValues, extractSheetID } from './sheets.js'

describe('parseRow', () => {
  it('parses a data row and strips the leading apostrophe', () => {
    const cells = ["'2081/12/1", '1000', '100', '50', '200', '500', '520', '20', '300', '0', '1650', 'note']
    expect(parseRow(cells, 13)).toMatchObject({
      date: '2081/12/1',
      rent: 1000,
      water: 100,
      garbage: 50,
      internet: 200,
      prevMeter: 500,
      currMeter: 520,
      units: 20,
      electricity: 300,
      outstanding: 0,
      totalDue: 1650,
      note: 'note',
      rowNum: 13,
    })
  })
  it('skips header, blank, and label rows', () => {
    expect(parseRow(['Date', 'Rent'])).toBeNull()
    expect(parseRow([])).toBeNull()
    expect(parseRow(['Unit 4 — Sample tenant'])).toBeNull()
  })
  it('tolerates floats and missing trailing cells', () => {
    const r = parseRow(['2081/1/1', '14000.0'])
    expect(r.rent).toBe(14000)
    expect(r.note).toBe('')
  })
  it('recovers dates Google reformatted into real dates', () => {
    expect(parseRow(['2083/04/01']).date).toBe('2083/4/1') // zero-padded
    expect(parseRow(['2083-4-1']).date).toBe('2083/4/1') // ISO dashes
    expect(parseRow(['4/1/2083']).date).toBe('2083/4/1') // year-last
  })
  it('renders rows even when the date is unreadable (never drops data)', () => {
    const r = parseRow(['Apr 1 2083', '9000', '600'])
    expect(r).not.toBeNull()
    expect(r.date).toBe('Apr 1 2083') // shown as-is
    expect(r.rent).toBe(9000)
  })
})

describe('rowValues', () => {
  it('apostrophe-prefixes the date and blanks zero optionals', () => {
    const cells = rowValues({
      date: '2082/1/1',
      rent: 15000,
      water: 500,
      garbage: 300,
      internet: 0,
      prevMeter: 1605,
      currMeter: 0,
      units: 0,
      electricity: 0,
      outstanding: 0,
      totalDue: 15800,
      note: '',
    })
    expect(cells).toEqual(["'2082/1/1", 15000, 500, 300, '', 1605, '', '', '', '', 15800, '', 15])
  })
})

describe('extractSheetID', () => {
  it('pulls the id from a URL or accepts a raw id', () => {
    expect(extractSheetID('https://docs.google.com/spreadsheets/d/ABC_123-xy/edit#gid=0')).toBe('ABC_123-xy')
    expect(extractSheetID('ABC_123-xy')).toBe('ABC_123-xy')
  })
  it('throws on junk input', () => {
    expect(() => extractSheetID('not a sheet!!')).toThrow()
    expect(() => extractSheetID('')).toThrow()
  })
})
