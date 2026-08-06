<script>
  import { ensureCharts, Chart } from '../lib/charts.js'

  let { labels = [], values = [] } = $props()
  let canvas
  ensureCharts()

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 130)
    grad.addColorStop(0, 'rgba(37,99,235,0.20)')
    grad.addColorStop(1, 'rgba(37,99,235,0)')

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labels],
        datasets: [{
          data: [...values],
          borderColor: '#2563eb',
          backgroundColor: grad,
          fill: true,
          tension: 0.38,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#2563eb',
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
