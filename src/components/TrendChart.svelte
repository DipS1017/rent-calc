<script>
  import { ensureCharts, Chart } from '../lib/charts.js'

  let { labels = [], values = [] } = $props()
  let canvas
  ensureCharts()

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 130)
    grad.addColorStop(0, 'rgba(99,102,241,0.34)')
    grad.addColorStop(1, 'rgba(99,102,241,0)')

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labels],
        datasets: [{
          data: [...values],
          borderColor: '#6366f1',
          backgroundColor: grad,
          fill: true,
          tension: 0.38,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: { label: (c) => 'Rs ' + c.parsed.y.toLocaleString() },
          },
        },
        scales: { x: { display: false }, y: { display: false, grace: '14%' } },
        interaction: { mode: 'index', intersect: false },
      },
    })
    return () => chart.destroy()
  })
</script>

<canvas bind:this={canvas}></canvas>
