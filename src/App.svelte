<script>
  import { onMount } from 'svelte'
  import { Store } from './lib/store.svelte.js'
  import { router } from './lib/router.svelte.js'
  import GoogleButton from './components/GoogleButton.svelte'
  import Landing from './components/Landing.svelte'
  import TopBar from './components/TopBar.svelte'
  import Strip from './components/Strip.svelte'
  import Sheet from './components/Sheet.svelte'
  import InvoiceModal from './components/InvoiceModal.svelte'

  let { store = new Store() } = $props()

  // On load, reopen the last sheet if the token is still valid (no re-prompt) — so a direct
  // visit to /dashboard with a live session lands straight on the table.
  onMount(() => store.autoConnect())

  // Sign in / pick a sheet, then route to the dashboard on success.
  async function connect() {
    await store.pickSheet()
    if (store.connected) router.go('dashboard')
  }
</script>

{#if router.view === 'dashboard'}
  {#if store.connected}
    <div class="flex min-h-full flex-col">
      <TopBar {store} onHome={() => router.go('landing')} />

      <main class="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
        {#if store.error}
          <div class="mb-4 rounded-2xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-800" role="alert">
            {store.error}
          </div>
        {/if}
        {#if store.warning}
          <div class="mb-4 rounded-2xl bg-peach-50 px-4 py-3 text-sm font-medium text-sienna" role="status">
            ⚠ {store.warning}
          </div>
        {/if}
        {#if store.flash && !store.error}
          <div class="mb-4 rounded-2xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-800" role="status">
            {store.flash}
          </div>
        {/if}

        {#if store.tab || store.loading}
          <Strip strip={store.strip} loading={store.loading} />
          <Sheet {store} />
        {:else}
          <div class="card mt-6 p-12 text-center text-brand-400">No sheets found in this spreadsheet.</div>
        {/if}
      </main>

      <InvoiceModal {store} />
    </div>
  {:else}
    <!-- Direct visit to /dashboard without a live session — sign-in gate -->
    <div class="flex min-h-full items-center justify-center px-5 py-16">
      <div class="card w-full max-w-md p-8 text-center">
        <div class="brandmark mx-auto">K</div>
        {#if store.busy}
          <h1 class="mt-5 font-display text-h4 tracking-tight text-brand-800">Opening your dashboard…</h1>
          <p class="mt-2 text-sm text-brand-400">Reconnecting to your Google Sheet.</p>
        {:else}
          <h1 class="mt-5 font-display text-h4 tracking-tight text-brand-800">Sign in to open your dashboard</h1>
          <p class="mt-2 text-[15px] text-brand-500">Sign in with Google and pick your rent spreadsheet — it opens right here.</p>
          <div class="mt-6 flex justify-center">
            <GoogleButton onclick={connect} busy={store.busy} />
          </div>
          {#if store.error}
            <div class="mt-4 rounded-2xl bg-brand-100 px-3 py-2 text-sm font-medium text-brand-800">{store.error}</div>
          {/if}
          <button class="mt-5 text-sm font-medium text-brand-400 hover:text-brand-800" onclick={() => router.go('landing')}>← Back to home</button>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <Landing {store} {connect} onDashboard={() => router.go('dashboard')} />
{/if}
