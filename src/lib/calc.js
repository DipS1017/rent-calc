// Pure bill math for the 13-column schema (A..M):
//   Date, Rent, Water, Garbage, Internet, Prev Meter, Curr Meter, Units,
//   Electricity, Outstanding, Total Due, Note, Rate.
// A "row" is the camelCase shape used across the app:
//   { date, rent, water, garbage, internet, prevMeter, currMeter, units,
//     electricity, outstanding, totalDue, note, rowNum, raw }

// computeTotals derives Units (meter delta), Electricity (units × rate), and the single
// Total Due (all charges + electricity + outstanding). Units/Electricity are never negative.
export function computeTotals(rent, water, garbage, internet, prevMeter, currMeter, unitRate, outstanding) {
  let units = 0
  if (currMeter > 0 && prevMeter > 0) {
    units = currMeter - prevMeter
    if (units < 0) units = 0
  }
  const electricity = units * unitRate
  const totalDue = rent + water + garbage + internet + electricity + outstanding
  return { units, electricity, totalDue }
}

// deriveRate is the current default rate — the Rate column of the most recent month.
// Returns 0 when there are no rows (caller falls back to 15).
export function deriveRate(rows) {
  return rows.length ? rows[rows.length - 1].rate : 0
}

// billOf is the amount owed for a row — now just the single Total Due.
export function billOf(row) {
  return row.totalDue
}

// money formats an integer with thousands separators (19000 -> "19,000").
export function money(n) {
  if (n < 0) return '-' + money(-n)
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const absInt = (x) => (x < 0 ? -x : x)
