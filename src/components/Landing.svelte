<script>
  import GoogleButton from './GoogleButton.svelte'
  let { store, connect, onDashboard } = $props()

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

  // Sample register page (mock data) — the hero shows the actual artifact this tool keeps.
  const ledger = [
    ['2081/08/01', 'Mangsir', '10,000', '375', '11,375', false],
    ['2081/09/01', 'Poush', '10,000', '450', '11,450', false],
    ['2081/10/01', 'Magh', '10,000', '300', '11,300', false],
    ['2081/11/01', 'Falgun', '10,000', '525', '11,525', false],
    ['2081/12/01', 'Chaitra', '10,000', '375', '11,375', true],
  ]

  const steps = [
    ['Sign in & open your sheet', 'Sign in with Google and pick your existing rent spreadsheet from Drive. One tab per tenant.'],
    ['Edit like a register', 'Change any cell — electricity and totals recompute instantly and save straight back to your sheet.'],
    ['Hand over the invoice', 'Open any month as a clean invoice and download it as PNG or PDF for your tenant.'],
  ]
</script>

<div class="min-h-full overflow-y-auto scrollbar-slim">
  <!-- nav -->
  <header class="sticky top-0 z-30 border-b border-brand-200 bg-white/85 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
      <div class="flex items-center gap-2.5">
        <div class="brandmark">K</div>
        <span class="text-h5 font-bold tracking-tight text-brand-900">Kirayaa</span>
      </div>
      {#if store.connected}
        <button class="btn-primary btn-sm" onclick={onDashboard}>Open dashboard →</button>
      {:else}
        <a href="#start" class="btn-ghost btn-sm">Sign in</a>
      {/if}
    </div>
  </header>

  <!-- hero: pitch on the left, the register itself on the right -->
  <section id="start" class="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-20">
    <div class="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <!-- pitch -->
      <div>
        <div class="flex items-center gap-2.5 text-micro font-bold uppercase tracking-[0.16em] text-accent-600">
          <span class="h-2 w-2 rounded-full bg-accent-600"></span>
          Rent register · Nepali landlords
        </div>
        <h1 class="mt-5 text-h2 font-extrabold leading-[1.05] tracking-tight text-brand-900 sm:text-display">
          Every tenant's rent, in one clean ledger.
        </h1>
        <p class="mt-5 max-w-md text-h5 font-normal leading-relaxed text-brand-500">
          Rent, water, garbage, internet, and electricity meters — month by month, tenant by tenant.
          Your Google Sheet stays the source of truth; Kirayaa does the sums and prints the invoice.
        </p>

        <div class="mt-8 max-w-sm">
          <GoogleButton onclick={connect} busy={store.busy} />
          <p class="mt-3 text-[13px] leading-relaxed text-brand-400">
            You sign in with Google and pick your spreadsheet. Kirayaa opens only the
            <span class="font-medium text-brand-700">one sheet you choose</span> — never the rest of your Drive.
            Everything runs in your browser.
          </p>
          {#if store.error}
            <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{store.error}</div>
          {/if}
          {#if store.needsClientId || store.needsApiKey}
            <div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Set <code class="rounded bg-amber-100 px-1">VITE_GOOGLE_CLIENT_ID</code> and
              <code class="rounded bg-amber-100 px-1">VITE_GOOGLE_API_KEY</code> in <code class="rounded bg-amber-100 px-1">.env</code> — see <code class="rounded bg-amber-100 px-1">.env.example</code>.
            </div>
          {/if}
        </div>
      </div>

      <!-- the artifact: a sample register page -->
      <div class="card overflow-hidden">
        <div class="flex items-baseline justify-between border-b border-brand-200 px-5 py-3.5">
          <div class="text-h5 font-bold tracking-tight text-brand-900">Unit 4 — Sample tenant</div>
          <div class="text-micro font-semibold uppercase tracking-wide text-brand-400">2081 · sample</div>
        </div>
        <table class="w-full border-separate border-spacing-0 text-[14px]">
          <thead>
            <tr class="bg-brand-50 text-[11px] font-semibold uppercase tracking-wide text-brand-500">
              <th class="px-4 py-2.5 text-left">Month</th>
              <th class="px-4 py-2.5 text-right">Rent</th>
              <th class="px-4 py-2.5 text-right">Elec</th>
              <th class="px-4 py-2.5 text-right">Total Due</th>
            </tr>
          </thead>
          <tbody>
            {#each ledger as [date, name, rent, elec, total, current]}
              <tr class="border-b border-brand-100 last:border-0 {current ? 'bg-accent-50/70' : ''}">
                <td class="px-4 py-2">
                  <span class="font-mono text-[12px] text-brand-400 tabular-nums">{date}</span>
                  <span class="ml-1.5 font-medium text-brand-700">{name}</span>
                  {#if current}<span class="ml-1.5 rounded-full bg-accent-600 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">now</span>{/if}
                </td>
                <td class="px-4 py-2 text-right font-mono tabular-nums text-brand-500">{rent}</td>
                <td class="px-4 py-2 text-right font-mono tabular-nums text-brand-500">{elec}</td>
                <td class="px-4 py-2 text-right font-mono font-bold tabular-nums text-brand-900">{total}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="flex items-center justify-between border-t border-brand-200 px-5 py-2.5 text-[13px] text-brand-400">
          <span>Electricity &amp; totals auto-calculated</span>
          <span class="font-medium text-accent-600">↳ one-click invoice</span>
        </div>
      </div>
    </div>
  </section>

  <!-- how it works: one card, three steps (a real sequence) -->
  <section id="how" class="mx-auto max-w-6xl px-5 pb-16">
    <div class="card overflow-hidden">
      <div class="grid divide-brand-200 sm:grid-cols-3 sm:divide-x">
        {#each steps as [title, body], i}
          <div class="p-6 sm:p-7">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-h5 font-extrabold text-accent-600">{i + 1}</div>
            <h3 class="mt-4 font-semibold text-brand-900">{title}</h3>
            <p class="mt-1.5 text-[14px] leading-relaxed text-brand-500">{body}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- sheet format -->
  <section class="mx-auto max-w-6xl px-5 pb-16">
    <div class="card p-6 sm:p-8">
      <h2 class="text-h4 font-bold tracking-tight text-brand-900">What your sheet holds</h2>
      <p class="mt-1.5 text-[14px] text-brand-500">
        Kirayaa reads a tab per tenant with these columns in order (A→L). The <span class="font-medium text-brand-700">auto</span> columns are computed for you.
      </p>
      <div class="mt-5 overflow-x-auto scrollbar-slim">
        <table class="w-full text-left text-[14px]">
          <thead>
            <tr class="border-b border-brand-200 text-[11px] font-semibold uppercase tracking-wide text-brand-400">
              <th class="py-2.5 pr-3">Col</th><th class="py-2.5 pr-4">Header</th><th class="py-2.5 pr-4">Filled by</th><th class="py-2.5">What goes in it</th>
            </tr>
          </thead>
          <tbody>
            {#each columns as [col, header, type, desc]}
              <tr class="border-b border-brand-100">
                <td class="py-2 pr-3"><span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 font-mono text-xs font-bold text-brand-500">{col}</span></td>
                <td class="py-2 pr-4 font-semibold text-brand-800">{header}</td>
                <td class="py-2 pr-4">
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold {type === 'auto' ? 'bg-accent-50 text-accent-700' : 'bg-brand-100 text-brand-500'}">{type}</span>
                </td>
                <td class="py-2 text-brand-500">{desc}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <details class="group mt-5 rounded-lg border border-brand-200 bg-brand-50/70 p-4">
        <summary class="cursor-pointer list-none font-semibold text-brand-800 marker:hidden">
          <span class="text-accent-600 group-open:hidden">▸</span><span class="hidden text-accent-600 group-open:inline">▾</span>
          How the math works
        </summary>
        <ul class="mt-3 space-y-1.5 text-[14px] text-brand-500">
          <li>• <b>Units used</b> = current meter − previous month's meter (never negative).</li>
          <li>• <b>Electricity</b> = units × rate (default Rs. 15/unit).</li>
          <li>• <b>Total Due</b> = Rent + Water + Garbage + Internet + Electricity + Outstanding.</li>
          <li>• <b>Internet</b> is added only for tenants who actually pay it.</li>
          <li>• <b>Outstanding</b> carries an unpaid balance onto the invoice's Total Due.</li>
        </ul>
      </details>
    </div>
  </section>

  <!-- footer -->
  <footer class="mx-auto max-w-6xl px-5 pb-16 pt-4">
    <p class="border-t border-brand-200 pt-6 text-center text-[13px] text-brand-400">
      Kirayaa · your data stays in your Google Sheet · open source
    </p>
  </footer>
</div>
