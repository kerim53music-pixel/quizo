import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { RankBadge } from '../components/RankBadge'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type EditProps, type BlkProps } from '../lib/editable'
import type { Fighter } from '../lib/player'

const EASE = [0.22, 1, 0.36, 1] as const

function FighterCard({ f, side, delay, blk, editMode }: { f: Fighter; side: 'me' | 'foe'; delay: number; blk?: BlkProps; editMode?: boolean }) {
  const me = side === 'me'
  const c = me ? '#60a5fa' : '#f0454f'
  return (
    <motion.div
      className="glass relative overflow-hidden"
      onPointerDown={blk?.onPointerDown}
      initial={editMode ? false : { x: me ? -140 : 140, opacity: 0 }}
      animate={editMode ? undefined : { x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 170, damping: 20, delay }}
      style={
        {
          borderRadius: 18,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          maxWidth: 330,
          borderColor: `${c}66`,
          ...(blk?.style || {}),
        } as CSSProperties
      }
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 130% at ${me ? '0%' : '100%'} 50%, ${c}2b, transparent 60%)`,
        }}
      />
      <Avatar name={f.name} size={56} />
      <div className="relative min-w-0 flex-1">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>{f.name.toUpperCase()}</div>
        <div className="flex items-center gap-1" style={{ color: 'var(--color-ink-2)', fontSize: 12.5, fontWeight: 600 }}>
          {f.city} · <RankBadge size={12} />
          <span style={{ color: c }}>{f.league}</span>
        </div>
      </div>
      <div className="tnum relative" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: c }}>
        {formatNumber(f.qp)}
      </div>
    </motion.div>
  )
}

export function VsScene({
  me,
  opponent,
  onStart,
  editMode = false,
  layout,
  selectedId,
  onBlockDown,
}: {
  me: Fighter
  opponent: Fighter
  onStart: () => void
} & EditProps) {
  const [count, setCount] = useState<number | null>(null)
  const started = useRef(false)
  const bp = makeBp(editMode ? layout : loadLayout('vs'), editMode, selectedId, onBlockDown)

  useEffect(() => {
    if (editMode) return
    const timers: number[] = []
    timers.push(window.setTimeout(() => setCount(3), 1500))
    timers.push(window.setTimeout(() => setCount(2), 2300))
    timers.push(window.setTimeout(() => setCount(1), 3100))
    timers.push(
      window.setTimeout(() => {
        if (!started.current) {
          started.current = true
          onStart()
        }
      }, 3900),
    )
    return () => timers.forEach((t) => clearTimeout(t))
  }, [onStart, editMode])

  return (
    <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 42%, rgba(4,5,10,0.45), rgba(4,5,10,0.87))' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '55%', background: 'radial-gradient(120% 90% at 0% 50%, rgba(96,165,250,0.16), transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '55%', background: 'radial-gradient(120% 90% at 100% 50%, rgba(240,69,79,0.16), transparent 60%)' }} />

      <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-3 px-5">
        <FighterCard f={me} side="me" delay={0.15} blk={bp('me-card')} editMode={editMode} />

        <div onPointerDown={bp('vs').onPointerDown} style={{ position: 'relative', margin: '2px 0', ...bp('vs').style }}>
          <motion.div
            initial={editMode ? false : { scale: 0, rotate: -12 }}
            animate={editMode ? undefined : { scale: 1, rotate: 0 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 260, damping: 12 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 62,
              lineHeight: 1,
              letterSpacing: '0.02em',
              background: 'linear-gradient(180deg,#ffffff,#c9d2ee)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.6))',
            }}
          >
            VS
          </motion.div>
          <motion.div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, margin: 'auto', width: 120, height: 120, borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(139,92,246,0.5)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2.4, opacity: [0, 0.6, 0] }}
            transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
          />
        </div>

        <FighterCard f={opponent} side="foe" delay={0.15} blk={bp('foe-card')} editMode={editMode} />
      </div>

      <AnimatePresence>
        {count !== null && (
          <motion.div
            key={count}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 5 }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.34em', color: 'var(--color-cyan)', marginBottom: 6 }}>
                MAÇ BAŞLIYOR
              </div>
              <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 112, lineHeight: 1, color: '#fff', textShadow: '0 0 44px rgba(96,165,250,0.75)' }}>
                {count}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
