// Invoice model builder + PNG/PDF export. The visual invoice is a DOM node rendered
// by InvoiceModal.svelte; here we compute the data and rasterize/print that node.
// html2canvas and jsPDF are imported lazily (only when the user exports), so the ~600 KB
// they add stays out of the initial page load.

// buildInvoice assembles the invoice for rows[idx]. With the self-contained row schema each row is
// self-contained (prev + curr meter, a single total due), so no cross-row lookups.
export function buildInvoice(rows, idx, { title, unitRate }) {
  const row = rows[idx]
  return {
    title,
    date: row.date,
    rent: row.rent,
    water: row.water,
    garbage: row.garbage,
    internet: row.internet,
    prevMeter: row.prevMeter,
    currMeter: row.currMeter,
    units: row.units,
    unitRate: row.rate ?? unitRate, // the rate this month was actually priced at
    electricity: row.electricity,
    outstanding: row.outstanding,
    totalDue: row.totalDue,
    note: row.note,
  }
}

// invoiceLineItems builds the ordered rows shown on the invoice.
export function invoiceLineItems(inv) {
  const items = []
  if (inv.rent > 0) items.push({ label: 'Rent', amount: inv.rent })
  if (inv.water > 0) items.push({ label: 'Water', amount: inv.water })
  if (inv.garbage > 0) items.push({ label: 'Garbage', amount: inv.garbage })
  if (inv.electricity > 0) {
    items.push({
      label: 'Electricity',
      amount: inv.electricity,
      sub: `Meter ${inv.prevMeter} → ${inv.currMeter} · ${inv.units} units × Rs. ${inv.unitRate}`,
    })
  }
  if (inv.internet > 0) items.push({ label: 'Internet', amount: inv.internet })
  if (inv.outstanding > 0) items.push({ label: 'Previous outstanding', amount: inv.outstanding })
  return items
}

export function sanitizeFilename(s) {
  return String(s)
    .replace(/[/\\:*?"<>| ]/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function invName(inv) {
  return sanitizeFilename(inv.title) + '-' + sanitizeFilename(inv.date)
}

async function renderCanvas(node) {
  const { default: html2canvas } = await import('html2canvas')
  return html2canvas(node, { scale: 2, backgroundColor: '#ffffff' })
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// downloadPng rasterizes the invoice node to a PNG the landlord can message to a tenant.
export async function downloadPng(node, filename) {
  const canvas = await renderCanvas(node)
  triggerDownload(canvas.toDataURL('image/png'), filename + '.png')
}

// downloadPdf places the rasterized invoice, scaled to fit, on a single A4 page
// (mirrors the Go fpdf layout).
export async function downloadPdf(node, filename) {
  const canvas = await renderCanvas(node)
  const img = canvas.toDataURL('image/png')
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  const margin = 32
  const availW = pw - 2 * margin
  const availH = ph - 2 * margin
  const ratio = canvas.height / canvas.width
  let w = availW
  let h = w * ratio
  if (h > availH) {
    h = availH
    w = h / ratio
  }
  pdf.addImage(img, 'PNG', (pw - w) / 2, margin, w, h)
  pdf.save(filename + '.pdf')
}
