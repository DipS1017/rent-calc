<script>
  import { money } from '../lib/calc.js'
  import TrendChart from './TrendChart.svelte'
  import UnitsChart from './UnitsChart.svelte'

  let { strip } = $props()

  const usageLabel = { high: 'Higher than usual', low: 'Lower than usual', normal: 'Typical usage' }
  const usageClass = {
    high: 'bg-rose-50 text-rose-600',
    low: 'bg-sky-50 text-sky-600',
    normal: 'bg-emerald-50 text-emerald-600',
  }
  const usageIcon = { high: '▲', low: '▼', normal: '✓' }
</script>

{#if strip.hasData}
  <section class="grid gap-4 lg:grid-cols-2">
    <!-- Bill trend -->
    <div class="card p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-[11px] font-bold tracking-wide text-slate-400 uppercase">This month's bill</div>
          <div class="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Rs {money(strip.total)}</div>
        </div>
        {#if strip.hasPrev}
          <span class="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold {strip.totalUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
            {strip.totalUp ? '▲' : '▼'} {strip.totalDeltaPct}% <span class="font-normal opacity-70">vs last</span>
          </span>
        {/if}
      </div>
      <div class="relative mt-3 h-[128px]">
        <TrendChart labels={strip.labels} values={strip.billSeries} />
      </div>
    </div>

    <!-- Electricity usage + anomaly -->
    <div class="card p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Electricity this month</div>
          <div class="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            {strip.units} <span class="text-lg font-semibold text-slate-400">units</span>
          </div>
        </div>
        <span class="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold {usageClass[strip.usageFlag]}">
          {usageIcon[strip.usageFlag]} {usageLabel[strip.usageFlag]}{#if strip.usageFlag !== 'normal' && strip.avgUnits}&nbsp;{strip.usagePct > 0 ? '+' : ''}{strip.usagePct}%{/if}
        </span>
      </div>
      <div class="relative mt-3 h-[128px]">
        <UnitsChart labels={strip.labels} values={strip.unitSeries} />
      </div>
    </div>
  </section>
{/if}
