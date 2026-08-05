<script>
  import { money } from '../lib/calc.js'

  let { store, row } = $props()

  // Local editable drafts, seeded from the row. Read-only cells (Units, Elec, Total Due)
  // read `row` directly, so they refresh when saveRow replaces the row with recomputed values.
  // svelte-ignore state_referenced_locally
  let date = $state(row.date)
  let rent = $state(String(row.rent))
  let water = $state(String(row.water))
  let garbage = $state(String(row.garbage))
  let internet = $state(row.internet ? String(row.internet) : '')
  let prevMeter = $state(row.prevMeter ? String(row.prevMeter) : '')
  let currMeter = $state(row.currMeter ? String(row.currMeter) : '')
  let outstanding = $state(row.outstanding ? String(row.outstanding) : '')
  let note = $state(row.note)

  let pulse = $state(false)

  function commit() {
    store.saveRow(row.rowNum, { date, rent, water, garbage, internet, prevMeter, currMeter, outstanding, note })
    pulse = false
    requestAnimationFrame(() => { pulse = true })
  }

  const num = 'cell cell-num'
  const ro = 'auto-cell' // read-only, calculated cell
</script>

<tr
  class="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60 {pulse ? 'saved-pulse' : ''}"
  onanimationend={() => (pulse = false)}
>
  <td class="w-[92px] p-0"><input class="cell font-medium" bind:value={date} onchange={commit} aria-label="Date" /></td>
  <td class="p-0"><input class={num} bind:value={rent} onchange={commit} inputmode="numeric" aria-label="Rent" /></td>
  <td class="p-0"><input class={num} bind:value={water} onchange={commit} inputmode="numeric" aria-label="Water" /></td>
  <td class="p-0"><input class={num} bind:value={garbage} onchange={commit} inputmode="numeric" aria-label="Garbage" /></td>
  <td class="p-0"><input class={num} bind:value={internet} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Internet" /></td>
  <td class="p-0"><input class={num} bind:value={prevMeter} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Previous meter" /></td>
  <td class="p-0"><input class={num} bind:value={currMeter} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Current meter" /></td>

  <td class="{ro} text-right">
    {#if row.units}
      <span class="inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-600">+{row.units}</span>
    {:else}<span class="text-slate-300">—</span>{/if}
  </td>
  <td class="{ro} text-slate-500">{row.electricity || '—'}</td>
  <td class="p-0"><input class={num} bind:value={outstanding} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Outstanding" /></td>
  <td class="{ro} font-bold text-slate-900">{money(row.totalDue)}</td>

  <td class="max-w-[200px] p-0">
    <input class="cell truncate" bind:value={note} onchange={commit} title={note || 'Add a note'} placeholder="—" aria-label="Note" />
  </td>

  <td class="px-3 py-2 text-right whitespace-nowrap">
    <button class="text-xs font-semibold text-brand-600 hover:underline" onclick={() => store.openInvoice(row.date)}>Invoice</button>
    <button
      class="ml-3 align-middle text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
      title="Delete this month"
      aria-label="Delete this month"
      onclick={() => store.askDelete(row.rowNum)}
    >
      <svg viewBox="0 0 24 24" class="inline h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
    </button>
  </td>
</tr>
