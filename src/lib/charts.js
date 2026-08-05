// Chart.js — register only the pieces we use (keeps the bundle lean) and set Inter/slate
// defaults so charts match the Kirayaa design system.
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js'

let registered = false
export function ensureCharts() {
  if (registered) return
  Chart.register(
    LineController, LineElement, PointElement,
    BarController, BarElement,
    LinearScale, CategoryScale, Filler, Tooltip,
  )
  Chart.defaults.font.family = "'Inter', ui-sans-serif, system-ui, sans-serif"
  Chart.defaults.color = '#64748b'
  registered = true
}

export { Chart }
