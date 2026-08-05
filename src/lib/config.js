// Local persistence for the single user, in localStorage (the server-side config.json
// equivalent): which sheet, last tab, unit rate, and per-tab invoice title overrides.

const KEY = 'rentcalc.config'
const env = import.meta.env || {}

const DEFAULTS = {
  sheetUrl: '',
  sheetId: '',
  sheetName: '',
  tabName: '',
  unitRate: 15,
  titles: {}, // { [tabName]: "invoice title override" }
}

export function loadConfig() {
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}
  } catch {
    stored = {}
  }
  return {
    ...DEFAULTS,
    ...stored,
    sheetUrl: stored.sheetUrl || env.VITE_SHEET_URL || '',
    unitRate: Number(stored.unitRate) || Number(env.VITE_UNIT_RATE) || 15,
    titles: stored.titles || {},
  }
}

export function saveConfig(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export const clientId = env.VITE_GOOGLE_CLIENT_ID || ''
export const apiKey = env.VITE_GOOGLE_API_KEY || ''
// The Cloud project number prefixes the client ID (e.g. "1028107089736-xxxx"). The
// Picker uses it as the app ID so per-file (drive.file) grants attach to this app.
export const appId = clientId.split('-')[0] || ''
