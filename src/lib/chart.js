// Sparkline path builder, ported from the Go chart.go. Drawn over a fixed 0..600 x
// 0..80 viewBox with a zoomed y-range so small month-to-month variation is visible
// (not a flat line hugging the top).

const CHART_W = 600
const CHART_H = 80
const CHART_PAD = 8

// yRange returns a padded [lo, hi] value window around the data (~15% headroom).
export function yRange(vals) {
  if (vals.length === 0) return [0, 1]
  let mn = vals[0]
  let mx = vals[0]
  for (const v of vals) {
    if (v < mn) mn = v
    if (v > mx) mx = v
  }
  let span = mx - mn
  if (span === 0) {
    span = mx || 1
  }
  let pad = Math.floor(span / 6)
  if (pad < 1) pad = 1
  return [mn - pad, mx + pad]
}

function yCoord(v, lo, hi) {
  if (hi <= lo) hi = lo + 1
  let y = CHART_PAD + Math.floor(((CHART_H - 2 * CHART_PAD) * (hi - v)) / (hi - lo))
  if (y < CHART_PAD) y = CHART_PAD
  if (y > CHART_H - CHART_PAD) y = CHART_H - CHART_PAD
  return y
}

// sparkline builds an SVG polyline `points` string, a closed `area` path, and the
// per-point coordinates { x, y, short, val }.
export function sparkline(vals, labels = []) {
  const n = vals.length
  if (n === 0) return { points: '', area: '', pts: [] }
  const [lo, hi] = yRange(vals)
  const pts = []
  const pieces = []
  for (let i = 0; i < n; i++) {
    const x = n > 1 ? Math.floor((i * CHART_W) / (n - 1)) : Math.floor(CHART_W / 2)
    const y = yCoord(vals[i], lo, hi)
    pts.push({ x, y, short: i < labels.length ? labels[i] : '', val: vals[i] })
    pieces.push(`${x},${y}`)
  }
  const points = pieces.join(' ')
  let d = `M0,${CHART_H}`
  for (const p of pts) d += ` L${p.x},${p.y}`
  d += ` L${CHART_W},${CHART_H} Z`
  return { points, area: d, pts }
}
