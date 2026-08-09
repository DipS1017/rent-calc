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
  <div class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-brand-900/40 p-4 backdrop-blur-sm sm:p-8" onclick={() => store.closeInvoice()}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="card my-auto w-full max-w-[720px] overflow-hidden" role="dialog" aria-modal="true" aria-label="Invoice" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between border-b border-brand-200 px-6 py-3.5">
        <h2 class="text-sm font-medium text-brand-800">Invoice · {inv.date}</h2>
        <button class="btn-ghost btn-sm" onclick={() => store.closeInvoice()}>Close</button>
      </div>

      <div class="overflow-x-auto bg-brand-100 p-4 scrollbar-slim sm:p-6">
        <!-- Printable invoice: self-contained, hex colours only (html2canvas-safe). -->
        <div class="invoice" bind:this={node}>
          <div class="inv-head">
            <div>
              <div class="inv-title">Invoice</div>
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

      <div class="flex justify-end gap-2.5 border-t border-brand-200 px-6 py-3.5">
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
    color: #17191c;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }
  .inv-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: #17191c;
    color: #ffffff;
    padding: 32px 36px;
    border-bottom: 3px solid #fbe1d1;
  }
  .inv-brand {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 500;
    color: #fbe1d1;
  }
  .inv-title {
    font-family: 'Source Serif 4', ui-serif, Georgia, serif;
    font-size: 42px;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1;
    margin-top: 2px;
  }
  .inv-sub {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #fbe1d1;
    margin-top: 10px;
  }
  .inv-date-lbl {
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 500;
    color: #a3a6af;
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
    font-weight: 500;
    text-transform: uppercase;
    color: #777b86;
  }
  .inv-billed-name {
    font-family: 'Source Serif 4', ui-serif, Georgia, serif;
    font-size: 27px;
    font-weight: 400;
    color: #17191c;
    line-height: 1.15;
    margin-top: 4px;
  }
  .inv-cols {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.06em;
    font-weight: 500;
    text-transform: uppercase;
    color: #a3a6af;
    padding-bottom: 8px;
    border-bottom: 1px solid #ececec;
  }
  .inv-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 13px 0;
    border-bottom: 1px solid #f2f2f3;
  }
  .inv-item.zebra {
    background: #fafafb;
    margin: 0 -36px;
    padding-left: 36px;
    padding-right: 36px;
  }
  .inv-label {
    font-size: 15px;
    color: #17191c;
  }
  .inv-itemsub {
    font-size: 11px;
    color: #a3a6af;
    margin-top: 3px;
  }
  .inv-amt {
    font-size: 15px;
    font-weight: 500;
    color: #17191c;
    white-space: nowrap;
  }
  .inv-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fbe1d1;
    color: #5d2a1a;
    border-radius: 16px;
    padding: 20px 24px;
    margin-top: 24px;
  }
  .inv-total-lbl {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5d2a1a;
  }
  .inv-total-amt {
    font-size: 28px;
    font-weight: 600;
    color: #5d2a1a;
  }
  .inv-note {
    margin-top: 16px;
    background: #f2f2f3;
    border-left: 3px solid #17191c;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    font-size: 12.5px;
    color: #57595f;
  }
  .inv-foot {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
    padding: 16px 0 24px;
    border-top: 1px solid #ececec;
  }
  .inv-foot-brand {
    font-size: 14px;
    font-weight: 600;
    color: #17191c;
  }
  .inv-foot-note {
    font-size: 11px;
    color: #a3a6af;
  }
  /* Ledger signature: figures and meter readings use tabular lining numerals. */
  .inv-amt,
  .inv-total-amt,
  .inv-date,
  .inv-itemsub {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-variant-numeric: tabular-nums;
  }
</style>
