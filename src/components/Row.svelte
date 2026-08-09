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
  class="group border-b border-brand-100 last:border-0 hover:bg-brand-50/70 {pulse ? 'saved-pulse' : ''}"
  onanimationend={() => (pulse = false)}
>
  <td class="w-[112px] p-0"><input class="cell font-mono text-[14px]" bind:value={date} onchange={commit} aria-label="Date" /></td>
  <td class="p-0"><input class={num} bind:value={rent} onchange={commit} inputmode="numeric" aria-label="Rent" /></td>
  <td class="p-0"><input class={num} bind:value={water} onchange={commit} inputmode="numeric" aria-label="Water" /></td>
  <td class="p-0"><input class={num} bind:value={garbage} onchange={commit} inputmode="numeric" aria-label="Garbage" /></td>
  <td class="p-0"><input class={num} bind:value={internet} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Internet" /></td>
  <td class="p-0"><input class={num} bind:value={prevMeter} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Previous meter" /></td>
  <td class="p-0"><input class={num} bind:value={currMeter} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Current meter" /></td>

  <td class="{ro} text-right">
    {#if row.units}
      <span class="inline-flex rounded-full bg-accent-50 px-2 py-0.5 font-mono text-[12px] font-semibold text-accent-700 tabular-nums">+{row.units}</span>
    {:else}<span class="text-brand-200">—</span>{/if}
  </td>
  <td class="{ro} text-brand-400">{row.electricity || '—'}</td>
  <td class="p-0"><input class={num} bind:value={outstanding} onchange={commit} inputmode="numeric" placeholder="—" aria-label="Outstanding" /></td>
  <td class="{ro} font-bold text-brand-900">{money(row.totalDue)}</td>

  <td class="max-w-[200px] p-0">
    <input class="cell truncate" bind:value={note} onchange={commit} title={note || 'Add a note'} placeholder="—" aria-label="Note" />
  </td>

  <td class="px-3 py-2 text-right whitespace-nowrap">
    <button class="text-[13px] font-semibold text-accent-600 hover:text-accent-700 hover:underline" onclick={() => store.openInvoice(row.date)}>Invoice</button>
    <button
      class="ml-3 align-middle text-brand-300 opacity-0 transition hover:text-brand-800 group-hover:opacity-100"
      title="Delete this month"
      aria-label="Delete this month"
      onclick={() => store.askDelete(row.rowNum)}
    >
      <svg viewBox="0 0 24 24" class="inline h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
    </button>
  </td>
</tr>
