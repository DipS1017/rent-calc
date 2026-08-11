// Google Sheets REST client used directly from the browser (no server), plus the
// row parse/serialize helpers for the 13-column schema.
//
// Column layout A..M: Date, Rent, Water, Garbage, Internet, Prev Meter, Curr Meter,
// Units, Electricity, Outstanding, Total Due, Note, Rate (Rs/unit; blank = 15).

const API = 'https://sheets.googleapis.com/v4/spreadsheets'
const RANGE = 'A:M'
const NCOLS = 13
const DEFAULT_RATE = 15

// normalizeBSDate recognises a B.S. date even if Google Sheets reformatted it into a real
// date. We store "YYYY/M/D" (as text); if the sheet turned it into a Gregorian date it
// comes back like "2083/04/01", "2083-4-1", or year-last "4/1/2083" — all normalized back
// to "YYYY/M/D" here so those rows aren't silently dropped. Returns null for non-dates
// (header/title/blank rows).
function normalizeBSDate(raw) {
  let s = String(raw ?? '')
    .replace(/^'/, '')
    .trim()
  if (!s) return null
  s = s.split(/[ T]/)[0].replace(/-/g, '/') // drop any time portion; unify separators
  // year-first: 2083/4/1 or 2083/04/01
  let m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (m) return `${+m[1]}/${+m[2]}/${+m[3]}`
  // year-last (Google reformatted a date we wrote as YYYY/M/D): 4/1/2083 -> 2083/4/1
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${+m[3]}/${+m[1]}/${+m[2]}`
  return null
}
const KNOWN_HEADERS = new Set([
  'date', 'rent', 'water', 'garbage', 'internet',
  'prev meter', 'previous meter', 'curr meter', 'current meter', 'meter',
  'units', 'unit', 'difference', 'electricity', 'total', 'elec',
  'outstanding', 'total due', 'grand total', 'with internet',
  'note', 'notes', 'description',
])

function toInt(s) {
  const t = String(s ?? '').trim()
  if (t === '') return 0
  const n = Number(t)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

// parseRow turns a sheet row (array of cells) into a row object, or null if the first
// cell isn't a B.S. date (header/blank/label rows are skipped).
export function parseRow(cells, rowNum = 0) {
  if (!cells || cells.length === 0) return null
  const first = String(cells[0] ?? '').replace(/^'/, '').trim()
  if (!first || KNOWN_HEADERS.has(first.toLowerCase())) return null // blank or a header row

  const norm = normalizeBSDate(first)
  const hasData = cells.slice(1).some((c) => String(c ?? '').trim() !== '')
  const dateLike = norm !== null || /^[\d.\/-]+$/.test(first)
  // Skip only pure title rows (text, no data, not date-like) e.g. "Unit 3 — Tenant".
  if (!hasData && !dateLike) return null

  const date = norm || first // render the date as-is when we can't recognize the format
  const raw = new Array(NCOLS).fill('')
  raw[0] = date
  for (let i = 1; i < NCOLS; i++) raw[i] = i < cells.length ? String(cells[i] ?? '').trim() : ''
  return {
    date,
    dateOk: norm !== null,
    rent: toInt(raw[1]),
    water: toInt(raw[2]),
    garbage: toInt(raw[3]),
    internet: toInt(raw[4]),
    prevMeter: toInt(raw[5]),
    currMeter: toInt(raw[6]),
    units: toInt(raw[7]),
    electricity: toInt(raw[8]),
    outstanding: toInt(raw[9]),
    totalDue: toInt(raw[10]),
    note: raw[11],
    rate: toInt(raw[12]) || DEFAULT_RATE, // blank/0 → default 15
    rowNum,
    raw,
  }
}

// rowValues renders a row into the A..M cells written to Sheets. The date is
// apostrophe-prefixed so Sheets keeps it as text; zero optionals are written blank.
export function rowValues(r) {
  const blank = (n) => (n === 0 ? '' : n)
  return [
    "'" + r.date,
    r.rent,
    r.water,
    r.garbage,
    blank(r.internet),
    blank(r.prevMeter),
    blank(r.currMeter),
    blank(r.units),
    blank(r.electricity),
    blank(r.outstanding),
    r.totalDue,
    r.note ?? '',
    r.rate || DEFAULT_RATE,
  ]
}

// extractSheetID pulls the spreadsheet ID from a full URL or accepts a raw ID.
export function extractSheetID(u) {
  u = String(u).trim()
  if (!u) throw new Error('empty sheet URL')
  const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9_-]+$/.test(u)) return u
  throw new Error(`cannot extract sheet ID from "${u}"`)
}

const firstRowOfRange = (rng) => {
  const m = String(rng).match(/![^!]*?[A-Za-z]+(\d+)/)
  return m ? Number(m[1]) : 0
}

const quoteTab = (t) => `'${String(t).replace(/'/g, "''")}'`

// createSheets returns a client bound to a token provider. getAccessToken() must
// resolve to a currently-valid OAuth access token.
export function createSheets(getAccessToken) {
  async function call(path, { method = 'GET', body, params } = {}) {
    const token = await getAccessToken()
    const url = new URL(API + path)
    for (const [k, v] of params || []) url.searchParams.append(k, v)
    const res = await fetch(url, {
      method,
      cache: 'no-store', // never serve a stale cached sheet response
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      let detail = ''
      try {
        const j = await res.json()
        detail = j.error?.message || ''
      } catch {
        /* non-JSON error body */
      }
      throw new Error(`Sheets ${method} ${res.status}${detail ? ': ' + detail : ''}`)
    }
    return res.status === 204 ? null : res.json()
  }

  const rangePath = (sheetId, range, suffix = '') =>
    `/${sheetId}/values/${encodeURIComponent(range)}${suffix}`

  return {
    async listTabs(sheetId) {
      const j = await call(`/${sheetId}`, { params: [['fields', 'sheets.properties.title']] })
      return (j.sheets || []).map((s) => s.properties.title)
    },

    async allRows(sheetId, tab) {
      const j = await call(rangePath(sheetId, `${quoteTab(tab)}!${RANGE}`))
      const raw = j.values || []
      const rows = []
      const unrecognized = [] // rows we DID render but whose date format we couldn't read
      raw.forEach((cells, i) => {
        const r = parseRow(cells, i + 1) // range starts at row 1 -> sheet row i+1
        if (!r) return // only headers/blank/title rows are skipped
        if (r.dateOk === false) unrecognized.push(r.date)
        delete r.dateOk
        rows.push(r)
      })
      return { rows, unrecognized }
    },

    async tenantName(sheetId, tab) {
      const j = await call(rangePath(sheetId, `${quoteTab(tab)}!A1:L4`))
      for (const row of j.values || []) {
        for (const cell of row) {
          const s = String(cell ?? '').trim()
          if (!s || KNOWN_HEADERS.has(s.toLowerCase())) continue
          if (parseRow([cell])) continue // a data cell, not a title
          return s
        }
      }
      return ''
    },

    // gidOf resolves a tab's numeric sheetId (needed for structural edits).
    async gidOf(sheetId, tab) {
      const j = await call(`/${sheetId}`, { params: [['fields', 'sheets.properties(sheetId,title)']] })
      const s = (j.sheets || []).find((x) => x.properties.title === tab)
      if (!s) throw new Error(`tab "${tab}" not found`)
      return s.properties.sheetId
    },

    async renameTab(sheetId, oldTitle, newTitle) {
      const gid = await this.gidOf(sheetId, oldTitle)
      await call(`/${sheetId}:batchUpdate`, {
        method: 'POST',
        body: {
          requests: [{ updateSheetProperties: { properties: { sheetId: gid, title: newTitle }, fields: 'title' } }],
        },
      })
    },

    // deleteRow removes a 1-based sheet row (rows below shift up by one).
    async deleteRow(sheetId, tab, rowNum) {
      if (rowNum < 1) throw new Error(`invalid row number ${rowNum}`)
      const gid = await this.gidOf(sheetId, tab)
      await call(`/${sheetId}:batchUpdate`, {
        method: 'POST',
        body: {
          requests: [{
            deleteDimension: { range: { sheetId: gid, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum } },
          }],
        },
      })
    },

    async appendRow(sheetId, tab, r) {
      const j = await call(rangePath(sheetId, `${quoteTab(tab)}!${RANGE}`, ':append'), {
        method: 'POST',
        params: [
          ['valueInputOption', 'USER_ENTERED'],
          ['insertDataOption', 'INSERT_ROWS'],
        ],
        body: { values: [rowValues(r)] },
      })
      return firstRowOfRange(j.updates?.updatedRange || '')
    },

    async updateRow(sheetId, tab, rowNum, r) {
      if (rowNum < 1) throw new Error(`invalid row number ${rowNum}`)
      await call(rangePath(sheetId, `${quoteTab(tab)}!A${rowNum}:M${rowNum}`), {
        method: 'PUT',
        params: [['valueInputOption', 'USER_ENTERED']],
        body: { values: [rowValues(r)] },
      })
    },
  }
}
