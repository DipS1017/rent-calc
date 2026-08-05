// Google Identity Services (GIS) OAuth token flow — browser-only, no client secret.
// The access token is cached in localStorage so a page refresh doesn't force a new sign-in;
// it still carries Google's ~1h expiry, so you sign in fresh once it lapses (e.g. next month).

const GIS_SRC = 'https://accounts.google.com/gsi/client'
// drive.file: the app can only read/write files the user opens via the Picker (or that
// it creates) — least privilege, and enough for the Sheets API to edit the picked sheet.
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const STORAGE_KEY = 'rentcalc.token'
const SKEW_MS = 60_000 // treat a token as expired 60s early

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    let s = document.querySelector(`script[src="${GIS_SRC}"]`)
    if (s) {
      s.addEventListener('load', () => resolve())
      s.addEventListener('error', () => reject(new Error('failed to load Google Identity Services')))
      return
    }
    s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('failed to load Google Identity Services'))
    document.head.appendChild(s)
  })
}

function readCache() {
  try {
    const t = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (t?.access_token && t.expires_at > Date.now() + SKEW_MS) return t
  } catch {
    /* ignore */
  }
  return null
}

// createAuth returns an auth handle for a given OAuth Web client ID.
export function createAuth(clientId) {
  let tokenClient = null
  let cached = readCache()

  async function ensureClient() {
    if (tokenClient) return
    if (!clientId) throw new Error('missing VITE_GOOGLE_CLIENT_ID — see .env.example')
    await loadGis()
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: () => {}, // replaced per request
    })
  }

  // requestToken wraps GIS's callback/error_callback in a promise, with a timeout so a
  // dropped popup or blocked silent request surfaces an error instead of hanging forever.
  function requestToken(prompt) {
    return new Promise((resolve, reject) => {
      let done = false
      const finish = (fn, arg) => {
        if (done) return
        done = true
        clearTimeout(timer)
        fn(arg)
      }
      const timer = setTimeout(
        () => finish(reject, new Error('Google sign-in timed out — please try again.')),
        prompt === '' ? 20_000 : 180_000,
      )
      tokenClient.callback = (resp) => {
        if (resp.error) return finish(reject, new Error(resp.error))
        cached = {
          access_token: resp.access_token,
          expires_at: Date.now() + (Number(resp.expires_in) - 60) * 1000,
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
        } catch {
          /* ignore */
        }
        finish(resolve, cached.access_token)
      }
      tokenClient.error_callback = (err) =>
        finish(reject, new Error(err?.type === 'popup_closed' ? 'Sign-in was cancelled.' : (err?.type || 'sign-in failed')))
      try {
        tokenClient.requestAccessToken({ prompt })
      } catch (e) {
        finish(reject, e)
      }
    })
  }

  return {
    isSignedIn: () => !!(cached && cached.expires_at > Date.now() + SKEW_MS),

    // signIn triggers interactive consent (call from a user gesture — a button click).
    async signIn() {
      await ensureClient()
      return requestToken('consent')
    },

    // getAccessToken returns a valid token, silently renewing when possible.
    async getAccessToken() {
      if (cached && cached.expires_at > Date.now() + SKEW_MS) return cached.access_token
      await ensureClient()
      return requestToken('')
    },

    signOut() {
      cached = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
    },
  }
}
