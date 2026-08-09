<script>
  import { todayBS } from '../lib/nepali.js'
  let { store, onHome } = $props()

  const today = todayBS()
  let open = $state(false)
  let renaming = $state(false)
  let renameValue = $state('')

  function pick(t) {
    open = false
    store.switchTab(t)
  }
  function startRename() {
    open = false
    renameValue = store.tab
    renaming = true
  }
  function submitRename(e) {
    e.preventDefault()
    const v = renameValue
    renaming = false
    store.renameTab(v)
  }
  function onDocClick(e) {
    if (open && !e.target.closest('.tenant-dd')) open = false
  }
  function onKey(e) {
    if (e.key === 'Escape') { open = false; renaming = false }
  }
</script>

<svelte:window onclick={onDocClick} onkeydown={onKey} />

<header class="sticky top-0 z-30 border-b border-brand-200 bg-white">
  <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
    <button class="flex shrink-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50" onclick={() => onHome?.()} title="Back to home">
      <div class="brandmark shrink-0">K</div>
      <div class="mr-2 hidden shrink-0 leading-none sm:block">
        <div class="font-display text-h4 leading-none tracking-tight text-brand-800">Kirayaa</div>
        {#if store.sheetName}
          <div class="mt-1 max-w-[150px] truncate text-[11px] text-brand-400" title={store.sheetName}>{store.sheetName}</div>
        {/if}
      </div>
    </button>

    <div class="mx-1 hidden h-7 w-px bg-brand-200 sm:block"></div>

    <!-- tenant selector -->
    <div class="tenant-dd relative">
      <button
        onclick={() => (open = !open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        class="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-accent-600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M10 9h4M10 13h4M10 17h4"/></svg>
        <span class="max-w-[42vw] truncate sm:max-w-[200px]">{store.tab || 'Select tenant'}</span>
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand-400 transition {open ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {#if open}
        <div class="absolute left-0 top-full z-40 mt-1.5 w-64 overflow-hidden rounded-lg border border-brand-200 bg-white shadow-lg">
          <div class="max-h-[min(60vh,18rem)] overflow-auto p-1.5 scrollbar-slim">
            <div class="px-2.5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-400">
              {store.tabs.length} sheet{store.tabs.length === 1 ? '' : 's'}
            </div>
            {#each store.tabs as t (t)}
              {@const active = t === store.tab}
              <button
                role="option"
                aria-selected={active}
                onclick={() => pick(t)}
                class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition
                  {active ? 'bg-accent-50 font-semibold text-accent-700' : 'text-brand-600 hover:bg-brand-50'}"
              >
                <span class="truncate">{t}</span>
                {#if active}
                  <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                {/if}
              </button>
            {/each}
          </div>
          <button class="flex w-full items-center gap-2 border-t border-brand-100 px-3.5 py-2.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50" onclick={startRename}>
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            Rename “{store.tab}”
          </button>
        </div>
      {/if}
    </div>

    <div class="flex-1"></div>

    {#if today}
      <span class="hidden shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-500 md:inline-flex" title="Today (Bikram Sambat)">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-accent-600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        Today · <span class="font-mono text-brand-700">{today}</span>
      </span>
    {/if}

    {#if store.saving > 0}
      <span class="hidden items-center gap-1.5 text-xs font-medium text-brand-400 sm:inline-flex" role="status">
        <span class="h-1.5 w-1.5 animate-ping rounded-full bg-accent-500"></span> saving
      </span>
    {/if}

    <button class="btn-ghost btn-sm shrink-0" onclick={() => store.pickSheet()} disabled={store.busy} title="Choose a different spreadsheet">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="hidden sm:inline">Change sheet</span>
    </button>
  </div>
</header>

{#if renaming}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm" onclick={() => (renaming = false)}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <form class="card w-full max-w-sm p-7" onclick={(e) => e.stopPropagation()} onsubmit={submitRename}>
      <h3 class="font-display text-h5 tracking-tight text-brand-800">Rename tenant tab</h3>
      <p class="mt-1.5 text-sm text-brand-500">This renames the tab in your Google Sheet.</p>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        class="mt-4 w-full rounded-2xl border border-brand-300 px-4 py-2.5 text-sm focus:border-brand-800 focus:ring-2 focus:ring-brand-800/15 focus:outline-none"
        bind:value={renameValue}
        autofocus
        aria-label="New tab name"
      />
      <div class="mt-5 flex justify-end gap-2.5">
        <button type="button" class="btn-ghost btn-sm" onclick={() => (renaming = false)}>Cancel</button>
        <button type="submit" class="btn-primary btn-sm" disabled={store.busy}>Save</button>
      </div>
    </form>
  </div>
{/if}
