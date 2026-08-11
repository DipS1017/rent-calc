<script>
  import GoogleButton from './GoogleButton.svelte'
  import { reveal } from '../lib/reveal.js'
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
    ['I', 'Electricity', 'auto', 'Units × Rate'],
    ['J', 'Outstanding', 'you type', 'Unpaid balance carried in — blank if none'],
    ['K', 'Total Due', 'auto', 'Rent + Water + Garbage + Internet + Electricity + Outstanding'],
    ['L', 'Note', 'text', 'Free-text — also printed on the invoice'],
    ['M', 'Rate', 'you type', 'Electricity rate per unit — blank = Rs 15'],
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
  <!-- nav — whisper-quiet, transparent -->
  <header class="sticky top-0 z-30 bg-[#fafafb]/85 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <div class="flex items-center gap-2.5">
        <div class="brandmark">K</div>
        <span class="font-display text-h4 tracking-tight text-brand-800">Kirayaa</span>
      </div>
      {#if store.connected}
        <button class="btn-primary btn-sm" onclick={onDashboard}>Open dashboard →</button>
      {/if}
    </div>
  </header>

  <!-- hero: editorial serif headline, the register floating alongside -->
  <section id="start" class="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
    <div class="grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <!-- pitch -->
      <div>
        <div use:reveal={{ delay: 0 }} class="flex items-center gap-3 text-micro font-medium uppercase tracking-[0.16em] text-brand-400">
          <span class="h-px w-8 bg-brand-300"></span>
          Rent register · Nepali landlords
        </div>
        <h1 use:reveal={{ delay: 90 }} class="mt-6 font-display text-h1 leading-[1.06] tracking-[-0.02em] text-brand-800 sm:text-display">
          Every tenant's rent, in one <em class="italic">clean ledger.</em>
        </h1>
        <p use:reveal={{ delay: 190 }} class="mt-6 max-w-md text-body-lg leading-relaxed text-brand-500">
          Rent, water, garbage, internet, and electricity meters — month by month, tenant by tenant.
          Your Google Sheet stays the source of truth; Kirayaa does the sums and prints the invoice.
        </p>

        <div use:reveal={{ delay: 280 }} class="mt-9 max-w-sm">
          <GoogleButton onclick={connect} busy={store.busy} />
          <p class="mt-4 text-[13px] leading-relaxed text-brand-400">
            You sign in with Google and pick your spreadsheet. Kirayaa opens only the
            <span class="font-medium text-brand-700">one sheet you choose</span> — never the rest of your Drive.
            Everything runs in your browser.
          </p>
          {#if store.error}
            <div class="mt-4 rounded-2xl bg-brand-100 px-4 py-2.5 text-sm font-medium text-brand-800">{store.error}</div>
          {/if}
          {#if store.needsClientId || store.needsApiKey}
            <div class="mt-4 rounded-2xl bg-brand-100 px-4 py-2.5 text-xs text-brand-600">
              Set <code class="rounded bg-white px-1">VITE_GOOGLE_CLIENT_ID</code> and
              <code class="rounded bg-white px-1">VITE_GOOGLE_API_KEY</code> in <code class="rounded bg-white px-1">.env</code> — see <code class="rounded bg-white px-1">.env.example</code>.
            </div>
          {/if}
        </div>
      </div>

      <!-- the artifact: a floating sample register -->
      <div use:reveal={{ delay: 240, y: 20 }} class="card overflow-hidden">
        <div class="flex items-baseline justify-between border-b border-brand-200 px-6 py-4">
          <div class="font-display text-h4 tracking-tight text-brand-800">Unit 4 — Sample tenant</div>
          <div class="text-micro font-medium uppercase tracking-[0.06em] text-brand-400">2081 · sample</div>
        </div>
        <table class="w-full border-separate border-spacing-0 text-[14px]">
          <thead>
            <tr class="text-[11px] font-medium uppercase tracking-[0.06em] text-brand-400">
              <th class="border-b border-brand-200 px-5 py-3 text-left">Month</th>
              <th class="border-b border-brand-200 px-5 py-3 text-right">Rent</th>
              <th class="border-b border-brand-200 px-5 py-3 text-right">Elec</th>
              <th class="border-b border-brand-200 px-5 py-3 text-right">Total Due</th>
            </tr>
          </thead>
          <tbody>
            {#each ledger as [date, name, rent, elec, total, current]}
              <tr class="border-b border-brand-100 last:border-0 {current ? 'bg-peach-50' : ''}">
                <td class="px-5 py-2.5">
                  <span class="font-mono text-[12px] text-brand-400 tabular-nums">{date}</span>
                  <span class="ml-2 font-medium text-brand-700">{name}</span>
                  {#if current}<span class="ml-2 rounded-full bg-peach-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sienna">now</span>{/if}
                </td>
                <td class="px-5 py-2.5 text-right font-mono tabular-nums text-brand-500">{rent}</td>
                <td class="px-5 py-2.5 text-right font-mono tabular-nums text-brand-500">{elec}</td>
                <td class="px-5 py-2.5 text-right font-mono font-medium tabular-nums text-brand-800">{total}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="flex items-center justify-between border-t border-brand-200 px-6 py-3 text-[13px] text-brand-400">
          <span>Electricity &amp; totals auto-calculated</span>
          <span class="font-medium text-brand-800">one-click invoice →</span>
        </div>
      </div>
    </div>
  </section>

  <!-- how it works: three steps, editorial serif numerals -->
  <section id="how" class="mx-auto max-w-6xl px-6 pb-20">
    <div class="card overflow-hidden">
      <div class="grid divide-brand-200 sm:grid-cols-3 sm:divide-x">
        {#each steps as [title, body], i}
          <div use:reveal={{ delay: i * 110 }} class="p-8">
            <div class="font-display text-h1 leading-none text-brand-300">{i + 1}</div>
            <h3 class="mt-5 font-medium text-brand-800">{title}</h3>
            <p class="mt-2 text-[15px] leading-relaxed text-brand-500">{body}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- sheet format -->
  <section class="mx-auto max-w-6xl px-6 pb-20">
    <div use:reveal class="card p-8 sm:p-10">
      <h2 class="font-display text-h4 tracking-tight text-brand-800">What your sheet holds</h2>
      <p class="mt-2 text-[15px] text-brand-500">
        Kirayaa reads a tab per tenant with these columns in order (A→M). The <span class="font-medium text-brand-700">auto</span> columns are computed for you.
      </p>
      <div class="mt-6 overflow-x-auto scrollbar-slim">
        <table class="w-full text-left text-[14px]">
          <thead>
            <tr class="border-b border-brand-200 text-[11px] font-medium uppercase tracking-[0.06em] text-brand-400">
              <th class="py-3 pr-3">Col</th><th class="py-3 pr-4">Header</th><th class="py-3 pr-4">Filled by</th><th class="py-3">What goes in it</th>
            </tr>
          </thead>
          <tbody>
            {#each columns as [col, header, type, desc]}
              <tr class="border-b border-brand-100">
                <td class="py-2.5 pr-3"><span class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 font-mono text-xs font-medium text-brand-500">{col}</span></td>
                <td class="py-2.5 pr-4 font-medium text-brand-800">{header}</td>
                <td class="py-2.5 pr-4">
                  <span class="rounded-full px-2.5 py-0.5 text-[11px] font-medium {type === 'auto' ? 'bg-brand-800 text-white' : 'bg-brand-100 text-brand-500'}">{type}</span>
                </td>
                <td class="py-2.5 text-brand-500">{desc}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <details class="group mt-6 rounded-2xl bg-brand-50 p-5">
        <summary class="cursor-pointer list-none font-medium text-brand-800 marker:hidden">
          <span class="text-brand-400 group-open:hidden">▸</span><span class="hidden text-brand-400 group-open:inline">▾</span>
          How the math works
        </summary>
        <ul class="mt-3 space-y-1.5 text-[15px] text-brand-500">
          <li>• <b class="font-medium text-brand-700">Units used</b> = current meter − previous month's meter (never negative).</li>
          <li>• <b class="font-medium text-brand-700">Electricity</b> = units × the Rate column (col M; blank = Rs 15/unit).</li>
          <li>• <b class="font-medium text-brand-700">Total Due</b> = Rent + Water + Garbage + Internet + Electricity + Outstanding.</li>
          <li>• <b class="font-medium text-brand-700">Internet</b> is added only for tenants who actually pay it.</li>
          <li>• <b class="font-medium text-brand-700">Outstanding</b> carries an unpaid balance onto the invoice's Total Due.</li>
        </ul>
      </details>
    </div>
  </section>

  <!-- footer -->
  <footer class="mx-auto max-w-6xl px-6 pb-16 pt-4">
    <p use:reveal class="border-t border-brand-200 pt-6 text-center text-[13px] text-brand-400">
      Kirayaa · your data stays in your Google Sheet · open source
    </p>
  </footer>
</div>
