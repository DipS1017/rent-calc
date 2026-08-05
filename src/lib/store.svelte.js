// The app's single reactive controller (Svelte 5 runes). Holds all state, talks to
// Google Sheets directly, and applies edits optimistically — the UI updates instantly
// and the sheet write happens in the background — which is what makes it feel fast.
//
// 12-column schema (A..L): Date, Rent, Water, Garbage, Internet, Prev Meter, Curr Meter,
// Units, Electricity, Outstanding, Total Due, Note.
import { loadConfig, saveConfig, clientId, apiKey, appId } from './config.js'
import { createAuth } from './auth.js'
import { createSheets, extractSheetID } from './sheets.js'
import { pickSpreadsheet } from './picker.js'
import { computeTotals } from './calc.js'
import { shortDate, parse as parseBS, nextMonth, format as fmtBS } from './nepali.js'
import { buildInvoice } from './invoice.js'

const toInt = (s) => {
  const n = Number(String(s ?? '').trim())
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

// sortByDate orders rows by their B.S. date ascending, so "latest" always means latest by
// date — robust to sheets that aren't physically in chronological order (gaps, inserts).
// Row identity is the sheet rowNum, which is unaffected by reordering the array.
function dateKey(d) {
  try {
    const { year, month, day } = parseBS(d)
    return year * 10000 + month * 100 + day
  } catch {
    // Unrecognized format: order by any 4-digit year we can find, then remaining numbers,
    // so these rows still land roughly in the right place instead of jumping to the top.
    const nums = (String(d).match(/\d+/g) || []).map(Number)
    const year = nums.find((n) => n >= 1000 && n <= 9999) || 0
    const rest = nums.filter((n) => n !== year)
    return year * 10000 + (rest[0] || 0) * 100 + (rest[1] || 0)
  }
}
function sortByDate(rows) {
  return [...rows].sort((a, b) => dateKey(a.date) - dateKey(b.date))
}
const sum = (a) => a.reduce((x, y) => x + y, 0)
const avg = (a) => (a.length ? Math.round(sum(a) / a.length) : 0)

export class Store {
  // config-backed
  sheetUrl = $state('')
  sheetId = ''
  sheetName = $state('')
  unitRate = 15
  titles = {}
  lastTab = ''

  // session
  connected = $state(false)
  needsClientId = $state(!clientId)
  needsApiKey = $state(!apiKey)
  tabs = $state([])
  tab = $state('')
  tenantName = $state('')
  rows = $state([])

  // ui
  flash = $state('')
  error = $state('')
  warning = $state('')
  busy = $state(false)
  saving = $state(0)
  invoiceDate = $state(null)
  pendingDelete = $state(null) // rowNum awaiting delete confirmation

  #tempNum = -1
  #cache = new Map() // in-session cache: tab -> { rows, tenantName, warning }

  constructor() {
    const cfg = loadConfig()
    // The last sheet + token are remembered so a refresh reopens straight into the app
    // without re-prompting. The token still carries Google's ~1h expiry, so a new day/month
    // signs in fresh (see autoConnect).
    this.sheetUrl = cfg.sheetUrl
    this.sheetId = cfg.sheetId
    this.sheetName = cfg.sheetName
    this.lastTab = cfg.tabName
    this.unitRate = cfg.unitRate
    this.titles = cfg.titles
    this.auth = createAuth(clientId)
    this.sheets = createSheets(() => this.auth.getAccessToken())
  }

  // ── derived views ──

  get currentTitle() {
    return this.titles?.[this.tab] || this.tenantName || this.tab
  }

  get invoice() {
    if (!this.invoiceDate) return null
    const idx = this.rows.findIndex((r) => r.date === this.invoiceDate)
    if (idx < 0) return null
    return buildInvoice(this.rows, idx, { title: this.currentTitle, unitRate: this.unitRate })
  }

  get pendingDeleteRow() {
    return this.pendingDelete == null ? null : this.rows.find((r) => r.rowNum === this.pendingDelete) || null
  }

  // strip: per-tenant insight — this month vs usual, an electricity anomaly flag, trends,
  // and a lifetime summary. (Cross-floor comparison removed — it wasn't actionable.)
  get strip() {
    const rows = this.rows
    const n = rows.length
    const s = { hasData: n > 0 }
    if (n === 0) return s

    const last = rows[n - 1]
    s.total = last.totalDue

    if (n >= 2) {
      const prev = rows[n - 2]
      s.hasPrev = true
      const d = last.totalDue - prev.totalDue
      s.totalUp = d >= 0
      s.totalDeltaAbs = Math.abs(d)
      s.totalDeltaPct = prev.totalDue > 0 ? Math.round((Math.abs(d) * 100) / prev.totalDue) : 0
      const u = last.units - prev.units
      s.unitsUp = u >= 0
      s.unitsDeltaAbs = Math.abs(u)
    }

    // electricity anomaly: this month's units vs the tenant's trailing average.
    s.units = last.units
    const priorUnits = rows.slice(0, -1).map((r) => r.units).filter((u) => u > 0)
    s.avgUnits = avg(priorUnits)
    if (s.avgUnits > 0 && last.units > 0) {
      s.usagePct = Math.round(((last.units - s.avgUnits) * 100) / s.avgUnits)
      s.usageFlag = s.usagePct >= 30 ? 'high' : s.usagePct <= -30 ? 'low' : 'normal'
    } else {
      s.usageFlag = 'normal'
      s.usagePct = 0
    }

    // trends (last 12 months)
    const slice = rows.slice(n > 12 ? n - 12 : 0)
    s.labels = slice.map((r) => shortDate(r.date))
    s.billSeries = slice.map((r) => r.totalDue)
    s.unitSeries = slice.map((r) => r.units)
    return s
  }

  // ── persistence ──

  #save() {
    saveConfig({
      sheetUrl: this.sheetUrl,
      sheetId: this.sheetId,
      sheetName: this.sheetName,
      tabName: this.lastTab,
      unitRate: this.unitRate,
      titles: this.titles,
    })
  }

  // ── tab cache (instant tab-switch + refresh; write-through on every edit) ──
  #rowKey(tab) {
    return `rentcalc.rows:${this.sheetId}:${tab}`
  }
  #tabsKey() {
    return `rentcalc.tabs:${this.sheetId}`
  }
  #readLS(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  }
  #writeLS(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      /* quota / unavailable — cache is best-effort */
    }
  }
  #readRowCache(tab) {
    const c = this.#cache.get(tab) || this.#readLS(this.#rowKey(tab))
    return c && Array.isArray(c.rows) ? c : null
  }
  // putCache writes the current rows for a tab to both the in-session map and localStorage.
  #putCache(tab, rows, tenantName, warning) {
    const data = { rows, tenantName: tenantName || '', warning: warning || '' }
    this.#cache.set(tab, data)
    this.#writeLS(this.#rowKey(tab), data)
    return data
  }
  // syncCache mirrors the live rows for the current tab into the cache (called after edits).
  #syncCache() {
    this.#putCache(this.tab, this.rows, this.tenantName, this.warning)
  }
  #applyCache(tab, data) {
    this.tab = tab
    this.rows = sortByDate(data.rows)
    this.tenantName = data.tenantName || ''
    this.warning = data.warning || ''
    this.lastTab = tab
    this.#save()
  }

  async #persist(fn, label) {
    this.saving++
    try {
      await fn()
    } catch (e) {
      this.error = `${label} failed: ${e.message}`
      throw e
    } finally {
      this.saving--
    }
  }

  // ── connect / pick ──

  async pickSheet() {
    this.busy = true
    this.error = ''
    this.flash = ''
    try {
      if (!this.auth.isSignedIn()) await this.auth.signIn()
      const token = await this.auth.getAccessToken()
      // The consent popup can leave the tall landing page scrolled down; reset to the top
      // so the Picker opens in view instead of below the fold.
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
      const picked = await pickSpreadsheet({ token, apiKey, appId })
      if (!picked) return
      this.sheetUrl = picked.url || this.sheetUrl
      await this.#openSheet(picked.id, picked.name)
    } catch (e) {
      this.error = e.message
    } finally {
      this.busy = false
    }
  }

  async connect(url) {
    this.busy = true
    this.error = ''
    this.flash = ''
    try {
      const u = String(url ?? this.sheetUrl).trim()
      const id = extractSheetID(u)
      this.sheetUrl = u
      await this.#openSheet(id, this.sheetName)
    } catch (e) {
      this.error = e.message
    } finally {
      this.busy = false
    }
  }

  // autoConnect reopens the last sheet on page load when the cached token is still valid —
  // so a refresh doesn't prompt for sign-in. If the token/sheet has lapsed, it silently
  // falls back to the landing page.
  async autoConnect() {
    if (this.connected || this.busy) return
    if (!this.auth.isSignedIn() || !this.sheetId) return

    // Instant paint from cache so a refresh shows the app immediately, then revalidate.
    const cachedTabs = this.#readLS(this.#tabsKey())
    if (Array.isArray(cachedTabs) && cachedTabs.length) {
      const tab = cachedTabs.includes(this.lastTab) ? this.lastTab : cachedTabs[0]
      const cachedRows = this.#readLS(this.#rowKey(tab))
      if (cachedRows && Array.isArray(cachedRows.rows)) {
        this.tabs = cachedTabs
        this.#applyCache(tab, cachedRows)
        this.connected = true
      }
    }

    this.busy = true
    try {
      const tabs = await this.sheets.listTabs(this.sheetId)
      this.tabs = tabs
      this.#writeLS(this.#tabsKey(), tabs)
      const tab = tabs.includes(this.lastTab) ? this.lastTab : tabs[0] || ''
      if (tab) await this.loadTab(tab, { force: true }) // revalidate the visible tab
      this.connected = true
    } catch {
      if (!this.connected) {
        this.auth.signOut()
        this.sheetId = ''
        this.#save()
      }
    } finally {
      this.busy = false
    }
  }

  async #openSheet(id, name) {
    this.sheetId = id
    if (name) this.sheetName = name
    this.#save()
    if (!this.auth.isSignedIn()) await this.auth.signIn()

    const tabs = await this.sheets.listTabs(id)
    this.tabs = tabs
    this.#writeLS(this.#tabsKey(), tabs)
    const tab = tabs.includes(this.lastTab) ? this.lastTab : tabs[0] || ''
    if (tab) await this.loadTab(tab)
    this.connected = true
    this.flash = `Connected · ${this.sheetName || 'sheet'} · ${tabs.length} tab${tabs.length === 1 ? '' : 's'}.`
  }

  // loadTab: paint instantly from cache, then revalidate from the network. A tab already
  // fetched this session is trusted (no refetch on switch). `force` skips the cache.
  async loadTab(tab, { force = false } = {}) {
    if (!force) {
      const cached = this.#readRowCache(tab)
      if (cached) this.#applyCache(tab, cached)
      if (this.#cache.has(tab)) return // fetched this session already — it's fresh
    }
    const { rows, unrecognized } = await this.sheets.allRows(this.sheetId, tab)
    let name = ''
    try {
      name = await this.sheets.tenantName(this.sheetId, tab)
    } catch {
      /* title is optional */
    }
    // Nothing is dropped; this is only a heads-up that some dates weren't clean B.S. dates
    // (shown as-is, so they may sort oddly). Setting the Date column to Plain text fixes it.
    const warning = unrecognized.length
      ? `${unrecognized.length} row${unrecognized.length === 1 ? '' : 's'} have a date I couldn't read as a B.S. date (shown as-is — e.g. “${unrecognized[0]}”), so they may sort oddly. Tip: set the Date column to Plain text in Google Sheets.`
      : ''
    this.#applyCache(tab, this.#putCache(tab, rows, name, warning))
  }

  // refresh force-reloads the current tab from the sheet (for edits made directly in Sheets).
  async refresh() {
    if (!this.tab || this.busy) return
    this.busy = true
    this.error = ''
    try {
      await this.loadTab(this.tab, { force: true })
    } catch (e) {
      this.error = e.message
    } finally {
      this.busy = false
    }
  }

  async switchTab(tab) {
    if (tab === this.tab || this.busy) return
    this.busy = true
    this.error = ''
    this.flash = ''
    try {
      await this.loadTab(tab)
    } catch (e) {
      this.error = e.message
    } finally {
      this.busy = false
    }
  }

  // renameTab renames the current tenant tab in the spreadsheet.
  async renameTab(newName) {
    newName = String(newName).trim()
    if (!newName || newName === this.tab) return
    if (this.tabs.includes(newName)) {
      this.error = `A tab named "${newName}" already exists.`
      return
    }
    const old = this.tab
    this.busy = true
    this.error = ''
    try {
      await this.sheets.renameTab(this.sheetId, old, newName)
      this.tabs = this.tabs.map((t) => (t === old ? newName : t))
      if (this.titles[old]) {
        this.titles = { ...this.titles, [newName]: this.titles[old] }
        delete this.titles[old]
        this.#save()
      }
      this.tab = newName
      this.lastTab = newName
      this.#cache.delete(old)
      this.#writeLS(this.#tabsKey(), this.tabs)
      this.#syncCache()
      this.flash = `Renamed to "${newName}".`
    } catch (e) {
      this.error = `Rename failed: ${e.message}`
    } finally {
      this.busy = false
    }
  }

  // ── row edits ──

  saveRow(rowNum, input) {
    const idx = this.rows.findIndex((r) => r.rowNum === rowNum)
    if (idx < 0) return
    const date = String(input.date).trim()
    try {
      parseBS(date)
    } catch (e) {
      this.error = e.message
      return
    }
    this.error = ''
    const rent = toInt(input.rent)
    const water = toInt(input.water)
    const garbage = toInt(input.garbage)
    const internet = toInt(input.internet)
    const prevMeter = toInt(input.prevMeter)
    const currMeter = toInt(input.currMeter)
    const outstanding = toInt(input.outstanding)
    const { units, electricity, totalDue } = computeTotals(
      rent, water, garbage, internet, prevMeter, currMeter, this.unitRate, outstanding,
    )
    const row = {
      date, rent, water, garbage, internet, prevMeter, currMeter,
      units, electricity, outstanding, totalDue,
      note: String(input.note ?? '').trim(), rowNum,
    }
    const next = this.rows.slice()
    next[idx] = row
    this.rows = sortByDate(next)
    this.#syncCache()
    this.#persist(() => this.sheets.updateRow(this.sheetId, this.tab, rowNum, row), 'Save').catch(() => {})
  }

  async addMonth() {
    if (this.busy) return
    let date = ''
    let rent = 0
    let water = 0
    let garbage = 0
    let internet = 0
    let prevMeter = 0
    if (this.rows.length > 0) {
      const last = this.rows[this.rows.length - 1]
      rent = last.rent
      water = last.water
      garbage = last.garbage
      internet = last.internet
      prevMeter = last.currMeter
      try {
        date = fmtBS(nextMonth(parseBS(last.date)))
      } catch {
        /* leave blank if the last date is unparseable */
      }
    }
    const { units, electricity, totalDue } = computeTotals(rent, water, garbage, internet, prevMeter, 0, this.unitRate, 0)
    const tempNum = this.#tempNum--
    const row = {
      date, rent, water, garbage, internet, prevMeter, currMeter: 0,
      units, electricity, outstanding: 0, totalDue, note: '', rowNum: tempNum,
    }
    this.rows = sortByDate([...this.rows, row])
    this.#syncCache()
    try {
      let num = 0
      await this.#persist(async () => {
        num = await this.sheets.appendRow(this.sheetId, this.tab, row)
      }, 'Add month')
      const i = this.rows.findIndex((r) => r.rowNum === tempNum)
      if (i >= 0) {
        const next = this.rows.slice()
        next[i] = { ...row, rowNum: num }
        this.rows = next
      }
    } catch {
      this.rows = this.rows.filter((r) => r.rowNum !== tempNum)
    }
    this.#syncCache()
  }

  // ── delete row (with confirmation) ──

  askDelete(rowNum) {
    this.pendingDelete = rowNum
  }
  cancelDelete() {
    this.pendingDelete = null
  }
  async confirmDelete() {
    const rowNum = this.pendingDelete
    this.pendingDelete = null
    if (rowNum == null) return
    const idx = this.rows.findIndex((r) => r.rowNum === rowNum)
    if (idx < 0) return
    // Optimistic: drop the row and shift the rowNums of everything below it up by one.
    this.rows = this.rows
      .filter((r) => r.rowNum !== rowNum)
      .map((r) => (r.rowNum > rowNum ? { ...r, rowNum: r.rowNum - 1 } : r))
    this.#syncCache()
    try {
      await this.#persist(() => this.sheets.deleteRow(this.sheetId, this.tab, rowNum), 'Delete')
    } catch {
      // reload from the sheet to resync after a failed delete
      try {
        await this.loadTab(this.tab)
      } catch {
        /* surfaced via error already */
      }
    }
  }

  // ── invoice modal ──

  openInvoice(date) {
    this.invoiceDate = date
  }
  closeInvoice() {
    this.invoiceDate = null
  }
}
