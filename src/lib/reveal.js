// reveal — a quiet fade-up when an element enters the viewport, matching the "Steep"
// editorial calm: weightless, one gentle move, no bounce. Respects reduced-motion and
// degrades to no-op where IntersectionObserver is unavailable.
//
// Usage:  <div use:reveal>            (default)
//         <div use:reveal={{ delay: 180 }}>
export function reveal(node, opts = {}) {
  const { delay = 0, y = 14, duration = 700 } = opts

  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {}

  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)' // gentle ease-out, no overshoot
  node.style.willChange = 'opacity, transform'
  node.style.opacity = '0'
  node.style.transform = `translateY(${y}px)`

  const show = () => {
    node.style.transition = `opacity ${duration}ms ${ease} ${delay}ms, transform ${duration}ms ${ease} ${delay}ms`
    node.style.opacity = '1'
    node.style.transform = 'none'
    const clear = () => {
      node.style.willChange = ''
      node.removeEventListener('transitionend', clear)
    }
    node.addEventListener('transitionend', clear)
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          show()
          io.unobserve(node)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
  io.observe(node)

  return {
    destroy() {
      io.disconnect()
    },
  }
}
