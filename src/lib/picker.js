// Google Picker — lets the user choose one of their spreadsheets from Drive's own UI.
// Combined with the drive.file scope this is least-privilege: the app only gains access
// to the single file the user picks. Loads gapi's picker module on demand.

const GAPI_SRC = 'https://apis.google.com/js/api.js'

let apiScriptPromise = null
function loadApiScript() {
  if (window.gapi) return Promise.resolve()
  if (apiScriptPromise) return apiScriptPromise
  apiScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GAPI_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('failed to load the Google API script'))
    document.head.appendChild(s)
  })
  return apiScriptPromise
}

let pickerModulePromise = null
function loadPickerModule() {
  if (window.google?.picker) return Promise.resolve()
  if (pickerModulePromise) return pickerModulePromise
  pickerModulePromise = new Promise((resolve, reject) => {
    window.gapi.load('picker', {
      callback: () => resolve(),
      onerror: () => reject(new Error('failed to load the Picker module')),
    })
  })
  return pickerModulePromise
}

// pickSpreadsheet opens the Picker and resolves to { id, name, url } for the chosen
// spreadsheet, or null if the user cancels.
export async function pickSpreadsheet({ token, apiKey, appId }) {
  if (!apiKey) throw new Error('missing VITE_GOOGLE_API_KEY — see .env.example')
  await loadApiScript()
  await loadPickerModule()
  const picker = window.google.picker

  return new Promise((resolve, reject) => {
    try {
      const view = new picker.DocsView(picker.ViewId.SPREADSHEETS)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false)

      const builder = new picker.PickerBuilder()
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setTitle('Choose your rent spreadsheet')
        .setCallback((data) => {
          if (data.action === picker.Action.PICKED) {
            const doc = data.docs[0]
            resolve({ id: doc.id, name: doc.name, url: doc.url })
          } else if (data.action === picker.Action.CANCEL) {
            resolve(null)
          }
        })
      if (appId) builder.setAppId(appId)
      builder.build().setVisible(true)
    } catch (e) {
      reject(e)
    }
  })
}
