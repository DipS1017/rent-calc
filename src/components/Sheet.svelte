<script>
  import Row from './Row.svelte'
  import RowEditor from './RowEditor.svelte'
  let { store } = $props()

  // Display newest month first. The underlying store.rows stays chronological (analytics,
  // meter chaining, and "add month" depend on that) — we only reverse for the view.
  let rowsDesc = $derived([...store.rows].reverse())

  // Months priced at a rate other than the current default — these get a warm tint.
  let offRate = $derived(store.rows.filter((r) => r.rate !== store.unitRate).length)
</script>

<section class="card mt-4 overflow-hidden">
  <div class="flex items-center justify-between gap-3 border-b border-brand-200 px-6 py-4">
    <div class="min-w-0">
      <h2 class="truncate font-display text-h4 leading-tight tracking-tight text-brand-800">{store.currentTitle}</h2>
      <p class="mt-1 text-[13px] text-brand-400">
        {#if store.loading}
          Loading…
        {:else}
          {store.rows.length} month{store.rows.length === 1 ? '' : 's'} on record ·
          <span class="text-brand-500">click a cell to edit</span> ·
          <span class="font-medium text-brand-700">Units, Elec &amp; Total Due auto-calculate from Rate (blank = 15)</span>
        {/if}
      </p>
      {#if !store.loading && offRate > 0}
        <p class="mt-1.5 inline-flex items-center gap-2 text-[12px] text-brand-500">
          <span class="inline-block h-3 w-4 shrink-0 rounded-[3px] bg-peach-100"></span>
          {offRate} shaded {offRate === 1 ? 'month is' : 'months are'} priced at a different rate than the current Rs {store.unitRate}/unit
        </p>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <label class="mr-1 hidden items-center gap-1.5 text-[13px] text-brand-500 sm:flex" title="Electricity rate per unit — read from your sheet; change it to re-bill this month">
        Rate <span class="text-brand-400">Rs</span>
        <input
          class="w-12 rounded-full border border-brand-300 bg-white px-2 py-1 text-center text-[13px] tabular-nums text-brand-800 focus:border-brand-800 focus:outline-none"
          value={store.pendingRate ?? store.unitRate}
          onchange={(e) => store.askRate(e.currentTarget.value)}
          inputmode="numeric"
          aria-label="Electricity rate per unit"
          disabled={store.busy}
        />/unit
      </label>
      <button class="btn-ghost btn-sm" onclick={() => store.refresh()} disabled={store.busy} title="Reload this tab from Google Sheets">
        <svg viewBox="0 0 24 24" class="h-4 w-4 {store.busy ? 'animate-spin' : ''}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/></svg>
        <span class="hidden sm:inline">Refresh</span>
      </button>
      <button class="btn-primary btn-sm" onclick={() => store.addMonth()} disabled={store.busy}>
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add month
      </button>
    </div>
  </div>

  <div class="max-h-[calc(100vh-360px)] min-h-[220px] overflow-auto scrollbar-slim">
    <table class="sheet-grid w-full border-separate border-spacing-0 text-[13.5px]">
      <thead>
        <tr>
          <th class="th w-10 lg:hidden"></th>
          <th class="th w-[112px] text-left">Date</th>
          <th class="th text-right">Rent</th>
          <th class="th text-right">Water</th>
          <th class="th text-right">Garbage</th>
          <th class="th text-right">Internet</th>
          <th class="th text-right" title="Previous meter reading">Prev</th>
          <th class="th text-right" title="Current meter reading">Curr</th>
          <th class="th text-right">Units</th>
          <th class="th text-right" title="Electricity rate per unit — blank in the sheet means Rs 15">Rate</th>
          <th class="th text-right">Elec</th>
          <th class="th text-right">Outstanding</th>
          <th class="th text-right">Total Due</th>
          <th class="th text-left">Note</th>
          <th class="th text-center"></th>
        </tr>
      </thead>
      <tbody>
        {#if store.loading}
          {#each Array(8) as _, i}
            <tr class="border-b border-brand-100">
              <td colspan="99" class="px-3 py-3">
                <div class="h-3.5 animate-pulse rounded bg-brand-100" style="width:{[96, 82, 90, 74, 88, 80, 92, 78][i]}%"></div>
              </td>
            </tr>
          {/each}
        {:else}
          {#each rowsDesc as row (row.rowNum)}
            <Row {store} {row} />
          {:else}
            <tr><td colspan="99" class="px-4 py-16 text-center text-brand-300">No rows yet — add the first month above.</td></tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

{#if store.editingRow}
  <RowEditor {store} row={store.editingRow} />
{/if}

{#if store.pendingDeleteRow}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm" onclick={() => store.cancelDelete()}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="card w-full max-w-sm p-7" role="dialog" aria-modal="true" aria-label="Delete month" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-start gap-3.5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </div>
        <div>
          <h3 class="font-display text-h5 tracking-tight text-brand-800">Delete this month?</h3>
          <p class="mt-1.5 text-sm text-brand-500">
            <span class="font-medium text-brand-800">{store.pendingDeleteRow.date}</span> will be removed from your Google Sheet. This can't be undone.
          </p>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-2.5">
        <button class="btn-ghost btn-sm" onclick={() => store.cancelDelete()}>Cancel</button>
        <button class="btn-primary btn-sm" onclick={() => store.confirmDelete()}>Delete</button>
      </div>
    </div>
  </div>
{/if}

{#if store.pendingRate != null}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm" onclick={() => store.cancelRate()}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="card w-full max-w-sm p-7" role="dialog" aria-modal="true" aria-label="Change electricity rate" onclick={(e) => e.stopPropagation()}>
      <h3 class="font-display text-h5 tracking-tight text-brand-800">Change rate to Rs {store.pendingRate}/unit?</h3>
      <p class="mt-1.5 text-sm text-brand-500">
        Apply it to the latest bill only, or re-bill electricity for <span class="font-medium text-brand-800">every month</span> in this sheet at the new rate.
      </p>
      <div class="mt-6 flex flex-col gap-2.5">
        <button class="btn-primary btn-sm w-full" onclick={() => store.applyRate('current')}>Update the latest bill only</button>
        <button class="btn-ghost btn-sm w-full" onclick={() => store.applyRate('all')}>Re-bill every month</button>
        <button class="mt-1 text-sm font-medium text-brand-400 hover:text-brand-800" onclick={() => store.cancelRate()}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
