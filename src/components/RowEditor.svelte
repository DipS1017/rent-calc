<script>
  import { computeTotals, money } from '../lib/calc.js'

  let { store, row } = $props()

  const toInt = (s) => { const n = Number(String(s ?? '').trim()); return Number.isFinite(n) ? Math.trunc(n) : 0 }

  // One reactive object holds every editable field, so the form and Save stay compact.
  // svelte-ignore state_referenced_locally
  let f = $state({
    date: row.date,
    rent: String(row.rent),
    water: String(row.water),
    garbage: String(row.garbage),
    internet: row.internet ? String(row.internet) : '',
    prevMeter: row.prevMeter ? String(row.prevMeter) : '',
    currMeter: row.currMeter ? String(row.currMeter) : '',
    rate: String(row.rate),
    outstanding: row.outstanding ? String(row.outstanding) : '',
    note: row.note,
  })

  const fields = [
    ['rent', 'Rent'], ['water', 'Water'], ['garbage', 'Garbage'], ['internet', 'Internet'],
    ['prevMeter', 'Prev meter'], ['currMeter', 'Curr meter'], ['rate', 'Rate (Rs/unit)'], ['outstanding', 'Outstanding'],
  ]

  let live = $derived(
    computeTotals(
      toInt(f.rent), toInt(f.water), toInt(f.garbage), toInt(f.internet),
      toInt(f.prevMeter), toInt(f.currMeter), toInt(f.rate) || 15, toInt(f.outstanding),
    ),
  )

  const fieldClass =
    'mt-1 w-full rounded-xl border border-brand-300 bg-white px-3 py-2 text-[15px] text-brand-800 tabular-nums focus:border-brand-800 focus:outline-none'

  function save() {
    store.saveRow(row.rowNum, f)
    store.closeEditor()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onclick={() => store.closeEditor()}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="card max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none sm:rounded-3xl"
    role="dialog"
    aria-modal="true"
    aria-label="Edit month"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="sticky top-0 z-10 flex items-center justify-between border-b border-brand-200 bg-white px-5 py-3.5">
      <h3 class="font-display text-h5 tracking-tight text-brand-800">Edit month</h3>
      <button class="text-sm font-medium text-brand-500 hover:text-brand-900" onclick={() => store.closeEditor()}>Close</button>
    </div>

    <div class="px-5 py-4">
      <label class="block text-[13px] font-medium text-brand-500">
        Date <span class="text-brand-300">(B.S.)</span>
        <input class="{fieldClass} font-mono" bind:value={f.date} inputmode="numeric" />
      </label>

      <div class="mt-3 grid grid-cols-2 gap-3">
        {#each fields as [key, label]}
          <label class="block text-[13px] font-medium text-brand-500">
            {label}
            <input class={fieldClass} bind:value={f[key]} inputmode="numeric" placeholder="—" />
          </label>
        {/each}
      </div>

      <label class="mt-3 block text-[13px] font-medium text-brand-500">
        Note
        <input class={fieldClass} bind:value={f.note} placeholder="—" />
      </label>

      <!-- live totals -->
      <div class="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-brand-200">
        <div class="bg-white px-3 py-2.5 text-center">
          <div class="text-[10px] font-medium tracking-wide text-brand-400 uppercase">Units</div>
          <div class="mt-0.5 font-mono text-[15px] font-medium text-brand-800 tabular-nums">{live.units || '—'}</div>
        </div>
        <div class="bg-white px-3 py-2.5 text-center">
          <div class="text-[10px] font-medium tracking-wide text-brand-400 uppercase">Elec</div>
          <div class="mt-0.5 font-mono text-[15px] font-medium text-brand-800 tabular-nums">{live.electricity || '—'}</div>
        </div>
        <div class="bg-peach-100 px-3 py-2.5 text-center">
          <div class="text-[10px] font-medium tracking-wide text-sienna/70 uppercase">Total Due</div>
          <div class="mt-0.5 font-mono text-[15px] font-bold text-sienna tabular-nums">{money(live.totalDue)}</div>
        </div>
      </div>
    </div>

    <div class="sticky bottom-0 flex items-center gap-2 border-t border-brand-200 bg-white px-5 py-3">
      <button
        class="text-sm font-medium text-brand-500 hover:text-brand-900"
        onclick={() => { store.closeEditor(); store.askDelete(row.rowNum) }}
      >Delete</button>
      <button
        class="text-sm font-medium text-brand-500 hover:text-brand-900"
        onclick={() => { store.closeEditor(); store.openInvoice(row.date) }}
      >Invoice</button>
      <div class="flex-1"></div>
      <button class="btn-primary btn-sm" onclick={save}>Save</button>
    </div>
  </div>
</div>
