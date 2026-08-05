<script>
  import { invoiceLineItems, invName, downloadPng, downloadPdf } from '../lib/invoice.js'
  import { money } from '../lib/calc.js'

  let { store } = $props()

  let node // the printable invoice element
  let downloading = $state(false)

  let inv = $derived(store.invoice)
  let items = $derived(inv ? invoiceLineItems(inv) : [])

  async function save(kind) {
    if (!node) return
    downloading = true
    try {
      if (kind === 'png') await downloadPng(node, invName(inv))
      else await downloadPdf(node, invName(inv))
    } catch (e) {
      store.error = `Invoice export failed: ${e.message}`
    } finally {
      downloading = false
    }
  }

  const onkey = (e) => { if (e.key === 'Escape') store.closeInvoice() }
</script>

<svelte:window onkeydown={onkey} />

{#if inv}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8" onclick={() => store.closeInvoice()}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="card my-auto w-full max-w-[720px] overflow-hidden" role="dialog" aria-modal="true" aria-label="Invoice" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between border-b border-slate-200/70 px-5 py-3">
        <h2 class="text-sm font-bold text-slate-900">Invoice · {inv.date}</h2>
        <button class="btn-ghost btn-sm" onclick={() => store.closeInvoice()}>Close</button>
      </div>

      <div class="overflow-x-auto bg-slate-100 p-4 scrollbar-slim sm:p-6">
        <!-- Printable invoice: self-contained, hex colours only (html2canvas-safe). -->
        <div class="invoice" bind:this={node}>
          <div class="inv-head">
            <div>
              <div class="inv-title">INVOICE</div>
              <div class="inv-sub">Rent · Utilities · Electricity</div>
            </div>
            <div>
              <div class="inv-date-lbl">BILLING DATE</div>
              <div class="inv-date">{inv.date}</div>
            </div>
          </div>

          <div class="inv-body">
            <div class="inv-billed">
              <div class="inv-billed-lbl">BILLED TO</div>
              <div class="inv-billed-name">{inv.title}</div>
            </div>

            <div class="inv-cols"><span>DESCRIPTION</span><span>AMOUNT</span></div>

            {#each items as it, i}
              <div class="inv-item {i % 2 === 1 ? 'zebra' : ''}">
                <div>
                  <div class="inv-label">{it.label}</div>
                  {#if it.sub}<div class="inv-itemsub">{it.sub}</div>{/if}
                </div>
                <div class="inv-amt">Rs. {money(it.amount)}</div>
              </div>
            {/each}

            <div class="inv-total">
              <div class="inv-total-lbl">TOTAL DUE</div>
              <div class="inv-total-amt">Rs. {money(inv.totalDue)}</div>
            </div>

            {#if inv.note}<div class="inv-note">Note: {inv.note}</div>{/if}

            <div class="inv-foot">
              <div class="inv-foot-note">Thank you for being a valued tenant.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2.5 border-t border-slate-200/70 px-5 py-3">
        <button class="btn-ghost btn-sm" onclick={() => save('png')} disabled={downloading}>Download PNG</button>
        <button class="btn-primary btn-sm" onclick={() => save('pdf')} disabled={downloading}>Download PDF</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Invoice styles are plain hex (not Tailwind's oklch) so html2canvas exports correctly. */
  .invoice {
    width: 640px;
    margin: 0 auto;
    background: #ffffff;
    color: #1e293b;
    font-family: 'IBM Plex Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }
  .inv-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: #1a2230;
    color: #ffffff;
    padding: 28px 36px;
    border-bottom: 4px solid #059669;
  }
  .inv-brand {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
    color: #6ee7b7;
  }
  .inv-title {
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 0.05em;
    margin-top: 6px;
  }
  .inv-sub {
    font-size: 12px;
    color: #6ee7b7;
    margin-top: 6px;
  }
  .inv-date-lbl {
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 700;
    color: #a0acbe;
    text-align: right;
  }
  .inv-date {
    font-size: 15px;
    text-align: right;
    margin-top: 4px;
  }
  .inv-body {
    padding: 0 36px;
  }
  .inv-billed {
    padding: 22px 0 10px;
  }
  .inv-billed-lbl {
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 700;
    color: #64748b;
  }
  .inv-billed-name {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 5px;
  }
  .inv-cols {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.06em;
    font-weight: 700;
    color: #94a3b8;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
  }
  .inv-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 13px 0;
    border-bottom: 1px solid #eef2f7;
  }
  .inv-item.zebra {
    background: #f8fafc;
    margin: 0 -36px;
    padding-left: 36px;
    padding-right: 36px;
  }
  .inv-label {
    font-size: 15px;
    color: #1e293b;
  }
  .inv-itemsub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 3px;
  }
  .inv-amt {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
  }
  .inv-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #059669;
    color: #ffffff;
    border-radius: 8px;
    padding: 16px 22px;
    margin-top: 20px;
  }
  .inv-total-lbl {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .inv-total-amt {
    font-size: 26px;
    font-weight: 800;
  }
  .inv-note {
    margin-top: 16px;
    background: #ecfdf5;
    border-left: 4px solid #059669;
    border-radius: 0 6px 6px 0;
    padding: 12px 16px;
    font-size: 12.5px;
    color: #475569;
  }
  .inv-foot {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 22px;
    padding: 16px 0 24px;
    border-top: 1px solid #e2e8f0;
  }
  .inv-foot-brand {
    font-size: 14px;
    font-weight: 800;
    color: #059669;
  }
  .inv-foot-note {
    font-size: 11px;
    color: #94a3b8;
  }
</style>
