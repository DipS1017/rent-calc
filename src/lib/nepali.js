// Bikram Sambat (B.S.) date helpers, ported from the Go nepali package.
// Dates use the spreadsheet text format YYYY/M/D. Arithmetic is limited to month
// rollover (every row is dated the 1st), which is all this app needs.

// parse reads a B.S. date in "YYYY/M/D" form, throwing on malformed input.
export function parse(s) {
  const parts = String(s).trim().split('/')
  if (parts.length !== 3) {
    throw new Error(`invalid B.S. date "${s}" (expected YYYY/M/D)`)
  }
  const nums = parts.map((p) => {
    const t = p.trim()
    const n = Number(t)
    if (t === '' || !Number.isInteger(n)) throw new Error(`invalid B.S. date "${s}"`)
    return n
  })
  const [year, month, day] = nums
  if (month < 1 || month > 12 || day < 1 || day > 32) {
    throw new Error(`invalid B.S. date values in "${s}"`)
  }
  return { year, month, day }
}

// format renders a date back to "YYYY/M/D".
export function format({ year, month, day }) {
  return `${year}/${month}/${day}`
}

// nextMonth returns the date one month later, rolling the year over after month 12.
export function nextMonth({ year, month, day }) {
  let m = month + 1
  let y = year
  if (m > 12) {
    m = 1
    y++
  }
  return { year: y, month: m, day }
}

// shortDate drops the year: "YYYY/M/D" -> "M/D" for compact chart labels.
export function shortDate(s) {
  const p = String(s).split('/')
  return p.length === 3 ? `${p[1]}/${p[2]}` : s
}
