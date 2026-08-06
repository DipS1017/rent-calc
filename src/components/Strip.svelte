<script>
  import { money } from '../lib/calc.js'
  import TrendChart from './TrendChart.svelte'
  import UnitsChart from './UnitsChart.svelte'

  let { strip, loading = false } = $props()

  const usageLabel = { high: 'Higher than usual', low: 'Lower than usual', normal: 'Typical' }
  const usageTone = { high: 'text-rose-600', low: 'text-sky-600', normal: 'text-emerald-600' }
  const usageDot = { high: 'bg-rose-500', low: 'bg-sky-500', normal: 'bg-emerald-500' }
</script>

{#if loading}
  <section class="card overflow-hidden">
    <div class="flex items-baseline justify-between border-b border-brand-200 px-5 py-3">
      <div class="h-4 w-32 animate-pulse rounded bg-brand-100"></div>
    </div>
    <div class="grid grid-cols-2 gap-px bg-brand-200 sm:grid-cols-4">
      {#each Array(4) as _}
        <div class="bg-white px-5 py-3.5">
          <div class="h-2.5 w-20 animate-pulse rounded bg-brand-100"></div>
          <div class="mt-2.5 h-6 w-24 animate-pulse rounded bg-brand-100"></div>
          <div class="mt-2 h-2.5 w-16 animate-pulse rounded bg-brand-100"></div>
        </div>
      {/each}
    </div>
    <div class="grid gap-px border-t border-brand-200 bg-brand-200 sm:grid-cols-2">
      {#each Array(2) as _}
        <div class="bg-white px-5 py-4"><div class="h-[92px] animate-pulse rounded bg-brand-50"></div></div>
      {/each}
    </div>
  </section>
{:else if strip.hasData}
  <section class="card overflow-hidden">
    <div class="flex items-baseline justify-between border-b border-brand-200 px-5 py-3">
      <h2 class="text-h5 font-bold leading-none tracking-tight text-brand-900">Analytics</h2>
      <span class="text-micro font-semibold tracking-wide text-brand-400 uppercase">
        {strip.months} month{strip.months === 1 ? '' : 's'} on record
      </span>
    </div>

    <!-- compact KPI row — hairlines via gap-px on a slate backing -->
    <div class="grid grid-cols-2 gap-px bg-brand-200 sm:grid-cols-4">
      <div class="bg-white px-5 py-3.5">
        <div class="text-micro font-semibold tracking-wide text-brand-400 uppercase">This month's bill</div>
        <div class="mt-1.5 font-mono text-h4 leading-none font-bold tracking-tight text-brand-900 tabular-nums">Rs&thinsp;{money(strip.total)}</div>
        {#if strip.hasPrev}
          <div class="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold {strip.totalUp ? 'text-rose-600' : 'text-emerald-600'}">
            <span class="h-1.5 w-1.5 rounded-full {strip.totalUp ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
            {strip.totalUp ? '+' : '−'}{strip.totalDeltaPct}% <span class="font-normal text-brand-400">vs last</span>
          </div>
        {:else}
          <div class="mt-2 text-[12px] text-brand-300">first month</div>
        {/if}
      </div>

      <div class="bg-white px-5 py-3.5">
        <div class="text-micro font-semibold tracking-wide text-brand-400 uppercase">Electricity</div>
        <div class="mt-1.5 font-mono text-h4 leading-none font-bold tracking-tight text-brand-900 tabular-nums">
          {strip.units}<span class="ml-1 font-sans text-sm font-medium text-brand-400">units</span>
        </div>
        <div class="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold {usageTone[strip.usageFlag]}">
          <span class="h-1.5 w-1.5 rounded-full {usageDot[strip.usageFlag]}"></span>
          {usageLabel[strip.usageFlag]}{#if strip.usageFlag !== 'normal' && strip.avgUnits}&nbsp;{strip.usagePct > 0 ? '+' : ''}{strip.usagePct}%{/if}
        </div>
      </div>

      <div class="bg-white px-5 py-3.5">
        <div class="text-micro font-semibold tracking-wide text-brand-400 uppercase">Avg / month</div>
        <div class="mt-1.5 font-mono text-h4 leading-none font-bold tracking-tight text-brand-900 tabular-nums">Rs&thinsp;{money(strip.avgBill)}</div>
        <div class="mt-2 text-[12px] text-brand-400">across {strip.months} month{strip.months === 1 ? '' : 's'}</div>
      </div>

      <div class="bg-white px-5 py-3.5">
        <div class="text-micro font-semibold tracking-wide text-brand-400 uppercase">Billed to date</div>
        <div class="mt-1.5 font-mono text-h4 leading-none font-bold tracking-tight text-brand-900 tabular-nums">Rs&thinsp;{money(strip.collected)}</div>
        <div class="mt-2 text-[12px] text-brand-400">total across all months</div>
      </div>
    </div>

    <!-- charts, compact -->
    <div class="grid gap-px border-t border-brand-200 bg-brand-200 sm:grid-cols-2">
      <div class="bg-white px-5 pt-3 pb-3.5">
        <div class="mb-1.5 text-micro font-semibold tracking-wide text-brand-400 uppercase">Bill, last months</div>
        <div class="relative h-[92px]">
          <TrendChart labels={strip.labels} values={strip.billSeries} />
        </div>
      </div>
      <div class="bg-white px-5 pt-3 pb-3.5">
        <div class="mb-1.5 text-micro font-semibold tracking-wide text-brand-400 uppercase">Units, last months</div>
        <div class="relative h-[92px]">
          <UnitsChart labels={strip.labels} values={strip.unitSeries} />
        </div>
      </div>
    </div>
  </section>
{/if}
