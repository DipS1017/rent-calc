// Minimal path router (Svelte 5 runes). Two views: the landing page at the app root and
// the dashboard at `<base>/dashboard`. No dependency, no server config beyond SPA fallback.
//
// `base` is derived from the current URL so this works at a domain root (localhost:5173 →
// base "") and under a GitHub Pages project subpath (/kirayaa/ → base "/kirayaa").

function computeBase() {
  if (typeof location === 'undefined') return ''
  return location.pathname
    .replace(/dashboard\/?$/, '') // drop the dashboard segment if we're on it
    .replace(/\/+$/, '') // drop any trailing slash
}

const BASE = computeBase()

class Router {
  path = $state(typeof location !== 'undefined' ? location.pathname : '/')

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.path = location.pathname
      })
    }
  }

  // 'dashboard' when the URL ends in /dashboard, otherwise 'landing'.
  get view() {
    return /dashboard\/?$/.test(this.path) ? 'dashboard' : 'landing'
  }

  // Navigate to a named view, pushing a real history entry so Back/Forward work.
  go(view) {
    const to = view === 'dashboard' ? `${BASE}/dashboard` : `${BASE}/`
    if (location.pathname !== to) history.pushState({}, '', to)
    this.path = to
  }
}

export const router = new Router()
