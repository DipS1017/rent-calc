<script>
  import { money } from '../lib/calc.js'
  import TrendChart from './TrendChart.svelte'
  import UnitsChart from './UnitsChart.svelte'

  let { strip, loading = false } = $props()

  const usageLabel = { high: 'Higher than usual', low: 'Lower than usual', normal: 'Typical' }
  const usageMark = { high: '↑', low: '↓', normal: '→' }
</script>

{#if loading}
  <section class="card overflow-hidden">
    <div class="flex items-baseline justify-between border-b border-brand-200 px-6 py-4">
      <div class="h-5 w-32 animate-pulse rounded bg-brand-100"></div>
    </div>
    <div class="grid grid-cols-2 gap-px bg-brand-200 sm:grid-cols-4">
      {#each Array(4) as _}
        <div class="bg-white px-6 py-4">
          <div class="h-2.5 w-20 animate-pulse rounded bg-brand-100"></div>
          <div class="mt-3 h-6 w-24 animate-pulse rounded bg-brand-100"></div>
          <div class="mt-2.5 h-2.5 w-16 animate-pulse rounded bg-brand-100"></div>
        </div>
      {/each}
    </div>
    <div class="grid gap-px border-t border-brand-200 bg-brand-200 sm:grid-cols-2">
      {#each Array(2) as _}
        <div class="bg-white px-6 py-5"><div class="h-[96px] animate-pulse rounded bg-brand-50"></div></div>
      {/each}
    </div>
  </section>
{:else if strip.hasData}
  <section class="card overflow-hidden">
    <div class="flex items-baseline justify-between border-b border-brand-200 px-6 py-4">
      <h2 class="font-display text-h4 leading-none tracking-tight text-brand-800">Analytics</h2>
      <span class="text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">
        {strip.months} month{strip.months === 1 ? '' : 's'} on record
      </span>
    </div>

    <!-- KPI row — the first cell is the single peach accent (kraft-on-warm) -->
    <div class="grid grid-cols-2 gap-px bg-brand-200 sm:grid-cols-4">
      <div class="bg-peach-100 px-6 py-4">
        <div class="text-micro font-medium tracking-[0.06em] text-sienna/70 uppercase">This month's bill</div>
        <div class="mt-2.5 font-mono text-h5 leading-none font-medium tracking-tight text-sienna tabular-nums">Rs&thinsp;{money(strip.total)}</div>
        {#if strip.hasPrev}
          <div class="mt-2.5 text-[12px] font-medium text-sienna/80">
            {strip.totalUp ? '↑' : '↓'} {strip.totalDeltaPct}% <span class="text-sienna/55">vs last</span>
          </div>
        {:else}
          <div class="mt-2.5 text-[12px] text-sienna/55">first month</div>
        {/if}
      </div>

      <div class="bg-white px-6 py-4">
        <div class="text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">Electricity</div>
        <div class="mt-2.5 font-mono text-h5 leading-none font-medium tracking-tight text-brand-800 tabular-nums">
          {strip.units}<span class="ml-1 font-sans text-sm font-normal text-brand-400">units</span>
        </div>
        <div class="mt-2.5 text-[12px] font-medium text-brand-500">
          {usageMark[strip.usageFlag]} {usageLabel[strip.usageFlag]}{#if strip.usageFlag !== 'normal' && strip.avgUnits}&nbsp;{strip.usagePct > 0 ? '+' : ''}{strip.usagePct}%{/if}
        </div>
      </div>

      <div class="bg-white px-6 py-4">
        <div class="text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">Avg / month</div>
        <div class="mt-2.5 font-mono text-h5 leading-none font-medium tracking-tight text-brand-800 tabular-nums">Rs&thinsp;{money(strip.avgBill)}</div>
        <div class="mt-2.5 text-[12px] text-brand-400">across {strip.months} month{strip.months === 1 ? '' : 's'}</div>
      </div>

      <div class="bg-white px-6 py-4">
        <div class="text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">Billed to date</div>
        <div class="mt-2.5 font-mono text-h5 leading-none font-medium tracking-tight text-brand-800 tabular-nums">Rs&thinsp;{money(strip.collected)}</div>
        <div class="mt-2.5 text-[12px] text-brand-400">total across all months</div>
      </div>
    </div>

    <!-- charts — gestural sienna, no axes -->
    <div class="grid gap-px border-t border-brand-200 bg-brand-200 sm:grid-cols-2">
      <div class="bg-white px-6 pt-4 pb-5">
        <div class="mb-2 text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">Bill, last months</div>
        <div class="relative h-[96px]">
          <TrendChart labels={strip.labels} values={strip.billSeries} />
        </div>
      </div>
      <div class="bg-white px-6 pt-4 pb-5">
        <div class="mb-2 text-micro font-medium tracking-[0.06em] text-brand-400 uppercase">Units, last months</div>
        <div class="relative h-[96px]">
          <UnitsChart labels={strip.labels} values={strip.unitSeries} />
        </div>
      </div>
    </div>
  </section>
{/if}
