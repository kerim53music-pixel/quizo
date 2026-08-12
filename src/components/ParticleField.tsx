import { useEffect, useRef } from 'react'

type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; tw: number; c: string }

const COLORS = ['#a78bfa', '#60a5fa', '#38bdf8', '#e8c25a']

/**
 * Lightweight canvas particle field — rising, glowing energy motes.
 * Gives the background real life without hurting performance.
 */
export function ParticleField({ count = 46 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: P[] = []
    let raf = 0
    let running = true

    const seed = (n: number) => {
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 1.9,
        vy: -(0.12 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.18,
        a: 0.15 + Math.random() * 0.55,
        tw: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!particles.length) seed(reduce ? Math.min(count, 22) : count)
    }

    const tick = () => {
      if (!running) return
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        p.y += p.vy
        p.x += p.vx
        p.tw += 0.03
        if (p.y < -6) {
          p.y = h + 6
          p.x = Math.random() * w
        }
        if (p.x < -6) p.x = w + 6
        if (p.x > w + 6) p.x = -6
        const flick = 0.55 + Math.sin(p.tw) * 0.45
        ctx.globalAlpha = p.a * flick
        ctx.shadowBlur = 8
        ctx.shadowColor = p.c
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      if (!reduce) raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)

    const onVis = () => {
      running = document.visibilityState === 'visible'
      if (running && !reduce) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [count])

  return <canvas ref={ref} className="ambient-particles" aria-hidden="true" />
}
