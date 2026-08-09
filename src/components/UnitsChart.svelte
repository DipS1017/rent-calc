<script>
  import { ensureCharts, Chart } from '../lib/charts.js'

  let { labels = [], values = [] } = $props()
  let canvas
  ensureCharts()

  $effect(() => {
    if (!canvas) return
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: [...labels],
        datasets: [{
          data: [...values],
          backgroundColor: '#fbe1d1',
          hoverBackgroundColor: '#5d2a1a',
          borderRadius: 4,
          maxBarThickness: 22,
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
            backgroundColor: '#17191c',
            padding: 9,
            cornerRadius: 8,
            callbacks: { label: (c) => `${c.parsed.y} units` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#a3a6af', maxRotation: 0, autoSkipPadding: 8 } },
          y: { display: false, beginAtZero: true, grace: '10%' },
        },
      },
    })
    return () => chart.destroy()
  })
</script>

<canvas bind:this={canvas}></canvas>
