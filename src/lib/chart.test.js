import { describe, it, expect } from 'vitest'
import { sparkline, yRange } from './chart.js'

describe('sparkline', () => {
  it('returns one point per value and carries labels', () => {
    const { pts } = sparkline([1, 2, 3, 4], ['a', 'b', 'c', 'd'])
    expect(pts).toHaveLength(4)
    expect(pts[0].short).toBe('a')
  })
  it('zooms the y-range so clustered values are not a flat top line', () => {
    const { pts } = sparkline([16000, 16050, 16300, 16100])
    // the max (index 2) should sit higher on screen (smaller y) than the min (index 0).
    expect(pts[2].y).toBeLessThan(pts[0].y)
  })
  it('is empty for no data', () => {
    expect(sparkline([]).pts).toHaveLength(0)
  })
})

describe('yRange', () => {
  it('pads a window around the data', () => {
    const [lo, hi] = yRange([100, 200])
    expect(lo).toBeLessThan(100)
    expect(hi).toBeGreaterThan(200)
  })
})
