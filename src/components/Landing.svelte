<script>
  import GoogleButton from './GoogleButton.svelte'
  let { store } = $props()

  const columns = [
    ['A', 'Date', 'text', 'B.S. date, 1st of the month — e.g. 2081/12/1'],
    ['B', 'Rent', 'you type', 'Monthly rent'],
    ['C', 'Water', 'you type', 'Water charge'],
    ['D', 'Garbage', 'you type', 'Garbage charge'],
    ['E', 'Internet', 'you type', 'Internet charge — leave blank if none'],
    ['F', 'Prev Meter', 'you type', "Last month's electricity reading"],
    ['G', 'Curr Meter', 'you type', "This month's electricity reading"],
    ['H', 'Units', 'auto', 'Curr − Prev'],
    ['I', 'Electricity', 'auto', 'Units × rate (default Rs. 15)'],
    ['J', 'Outstanding', 'you type', 'Unpaid balance carried in — blank if none'],
    ['K', 'Total Due', 'auto', 'Rent + Water + Garbage + Internet + Electricity + Outstanding'],
    ['L', 'Note', 'text', 'Free-text — also printed on the invoice'],
  ]
</script>

<div class="min-h-full overflow-y-auto scrollbar-slim">
  <!-- nav -->
  <header class="sticky top-0 z-30 border-b border-white/40 bg-white/50 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
      <div class="flex items-center gap-2.5">
        <div class="brandmark">K</div>
        <span class="text-lg font-extrabold tracking-tight text-slate-900">Kirayaa</span>
      </div>
      <a href="#start" class="btn-ghost btn-sm">Sign in</a>
    </div>
  </header>

  <!-- hero -->
  <section id="start" class="mx-auto max-w-6xl px-5 pt-16 pb-10 text-center sm:pt-24">
    <span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700">
      <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span> Powered by your Google Sheet · no backend
    </span>
    <h1 class="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
      Rent, <span class="brand-gradient-text">sorted.</span>
    </h1>
    <p class="mx-auto mt-5 max-w-xl text-lg text-slate-500">
      Track rent, utilities, and electricity meters for every tenant — with your Google Sheet as the source of truth and one-click invoices.
    </p>

    <div class="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
      <GoogleButton onclick={() => store.pickSheet()} busy={store.busy} />
      <p class="text-xs leading-relaxed text-slate-400">
        You'll sign in with Google and pick your spreadsheet. Kirayaa can only open the
        <span class="font-medium text-slate-500">one sheet you choose</span> — never the rest of your Drive.
        Everything stays in your browser.
      </p>
      {#if store.error}
        <div class="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{store.error}</div>
      {/if}
      {#if store.needsClientId || store.needsApiKey}
        <div class="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-700">
          Set <code class="rounded bg-amber-100 px-1">VITE_GOOGLE_CLIENT_ID</code> and
          <code class="rounded bg-amber-100 px-1">VITE_GOOGLE_API_KEY</code> in <code class="rounded bg-amber-100 px-1">.env</code> — see <code class="rounded bg-amber-100 px-1">.env.example</code>.
        </div>
      {/if}
      <a href="#how" class="mt-1 text-sm font-semibold text-brand-600 hover:text-brand-700">See how it works ↓</a>
    </div>

    <!-- product preview -->
    <div class="mx-auto mt-14 max-w-4xl">
      <div class="card overflow-hidden p-0 text-left shadow-[0_30px_80px_-30px_rgb(16_185_129/0.4)]">
        <div class="flex items-center gap-1.5 border-b border-slate-200/70 bg-slate-50/70 px-4 py-2.5">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-300"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-amber-300"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-300"></span>
          <span class="ml-2 text-xs text-slate-400">Unit 4 — Sample tenant</span>
        </div>
        <div class="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4">
          <div class="rounded-xl bg-brand-50/60 p-3">
            <div class="text-[10px] font-bold uppercase text-slate-400">Earnings</div>
            <div class="text-xl font-extrabold text-slate-900">Rs 12,375</div>
            <div class="text-xs font-semibold text-emerald-600">▲ Rs 75</div>
          </div>
          <div class="rounded-xl bg-amber-50/60 p-3">
            <div class="text-[10px] font-bold uppercase text-slate-400">Units</div>
            <div class="text-xl font-extrabold text-slate-900">25</div>
            <div class="text-xs font-semibold text-amber-600">▲ 5 units</div>
          </div>
          <div class="col-span-1 rounded-xl bg-white p-3 ring-1 ring-slate-100 sm:col-span-2">
            <div class="text-[10px] font-bold uppercase text-slate-400">Bill trend</div>
            <svg viewBox="0 0 200 44" class="mt-1 h-10 w-full" preserveAspectRatio="none">
              <polyline points="0,34 33,30 66,22 100,24 133,14 166,18 200,10" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- how it works -->
  <section id="how" class="mx-auto max-w-6xl px-5 py-16">
    <h2 class="text-center text-3xl font-extrabold tracking-tight text-slate-900">How it works</h2>
    <div class="mt-10 grid gap-5 sm:grid-cols-3">
      {#each [
        ['1', 'Sign in & pick your sheet', 'Sign in with Google and choose your existing rent spreadsheet from Drive. One tab per tenant.'],
        ['2', 'Edit like a spreadsheet', 'Change any cell — electricity and totals recompute instantly and save straight back to your sheet.'],
        ['3', 'Send the invoice', 'Open any month as a clean invoice and download it as PNG or PDF for your tenant.'],
      ] as [n, title, body]}
        <div class="card p-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl text-base font-black text-white" style="background-color:#059669; box-shadow:var(--shadow-glow)">{n}</div>
          <h3 class="mt-4 font-bold text-slate-900">{title}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- sheet format -->
  <section class="mx-auto max-w-6xl px-5 pb-16">
    <div class="card p-6 sm:p-8">
      <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Your sheet's columns</h2>
      <p class="mt-1.5 text-sm text-slate-500">
        Kirayaa reads a tab per tenant with these columns in order (A→K). The <span class="font-medium text-slate-700">auto</span> columns are computed for you.
      </p>
      <div class="mt-5 overflow-x-auto scrollbar-slim">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th class="py-2 pr-3">Col</th><th class="py-2 pr-4">Header</th><th class="py-2 pr-4">Filled by</th><th class="py-2">What goes in it</th>
            </tr>
          </thead>
          <tbody>
            {#each columns as [col, header, type, desc]}
              <tr class="border-b border-slate-100">
                <td class="py-2 pr-3"><span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">{col}</span></td>
                <td class="py-2 pr-4 font-semibold text-slate-800">{header}</td>
                <td class="py-2 pr-4">
                  <span class="rounded-md px-1.5 py-0.5 text-[11px] font-semibold {type === 'auto' ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'}">{type}</span>
                </td>
                <td class="py-2 text-slate-500">{desc}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <details class="group mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <summary class="cursor-pointer list-none font-semibold text-slate-800 marker:hidden">
          <span class="text-brand-600 group-open:hidden">▸</span><span class="hidden text-brand-600 group-open:inline">▾</span>
          How the math works
        </summary>
        <ul class="mt-3 space-y-1.5 text-sm text-slate-600">
          <li>• <b>Units used</b> = current meter − previous month's meter (never negative).</li>
          <li>• <b>Electricity</b> = units × rate (default Rs. 15/unit).</li>
          <li>• <b>Grand Total</b> = Rent + Water + Garbage + Electricity.</li>
          <li>• <b>with Internet</b> adds the internet charge (shown only for tenants who have it).</li>
          <li>• <b>Outstanding</b> carries an unpaid balance onto the invoice's Total Due.</li>
        </ul>
      </details>
    </div>
  </section>

  <!-- final CTA -->
  <section class="mx-auto max-w-6xl px-5 pb-24">
    <div class="card overflow-hidden bg-brand-600 p-10 text-center text-white shadow-[var(--shadow-glow)]">
      <h2 class="text-3xl font-black tracking-tight">Ready when you are.</h2>
      <p class="mx-auto mt-2 max-w-md text-white/85">Sign in with Google and pick your sheet — you'll be calculating rent in seconds.</p>
      <div class="mt-6 flex justify-center">
        <GoogleButton onclick={() => store.pickSheet()} busy={store.busy} light />
      </div>
    </div>
    <p class="mt-6 text-center text-xs text-slate-400">Kirayaa · your data stays in your Google Sheet · open source</p>
  </section>
</div>
