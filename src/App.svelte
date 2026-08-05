<script>
  import { onMount } from 'svelte'
  import { Store } from './lib/store.svelte.js'
  import Landing from './components/Landing.svelte'
  import TopBar from './components/TopBar.svelte'
  import Strip from './components/Strip.svelte'
  import Sheet from './components/Sheet.svelte'
  import InvoiceModal from './components/InvoiceModal.svelte'

  let { store = new Store() } = $props()

  // On load, reopen the last sheet if the cached token is still valid (no re-prompt).
  onMount(() => store.autoConnect())
</script>

{#if !store.connected}
  <Landing {store} />
{:else}
  <div class="flex min-h-full flex-col">
    <TopBar {store} />

    <main class="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
      {#if store.error}
        <div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
          {store.error}
        </div>
      {/if}
      {#if store.warning}
        <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700" role="status">
          ⚠ {store.warning}
        </div>
      {/if}
      {#if store.flash && !store.error}
        <div class="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700" role="status">
          {store.flash}
        </div>
      {/if}

      {#if store.tab}
        <Strip strip={store.strip} />
        <Sheet {store} />
      {:else}
        <div class="card mt-6 p-12 text-center text-slate-500">No sheets found in this spreadsheet.</div>
      {/if}
    </main>

    <InvoiceModal {store} />
  </div>
{/if}
