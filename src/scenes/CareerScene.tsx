import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { RankBadge } from '../components/RankBadge'
import { IconArrowLeft, IconBolt, IconUsers } from '../components/icons'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type EditProps, type BlkProps } from '../lib/editable'
import { CAREER } from '../lib/player'

const EASE = [0.22, 1, 0.36, 1] as const

function ModeCard({
  title,
  desc,
  stat,
  icon,
  accentA,
  accentB,
  state,
  blk,
}: {
  title: string
  desc: string
  stat: string
  icon: ReactNode
  accentA: string
  accentB: string
  state: 'active' | 'locked'
  blk?: BlkProps
}) {
  return (
    <div
      className="glass relative flex items-center gap-3.5"
      onPointerDown={blk?.onPointerDown}
      style={{
        borderRadius: 16,
        padding: '13px 14px',
        opacity: state === 'locked' ? 0.62 : 1,
        borderColor: state === 'active' ? `${accentA}66` : undefined,
        ...(blk?.style || {}),
      }}
    >
      <div
        className="grid place-items-center"
        style={{
          width: 46,
          height: 46,
          minWidth: 46,
          borderRadius: 13,
          color: '#fff',
          background: `linear-gradient(150deg, ${accentA}, ${accentB})`,
          boxShadow: `0 8px 20px -8px ${accentA}`,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16.5 }}>
          {title}
        </div>
        <div style={{ color: 'var(--color-ink-2)', fontSize: 12.5, fontWeight: 600 }}>{desc}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          className="tnum"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: accentA }}
        >
          {stat}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginTop: 2,
            color: state === 'active' ? 'var(--color-emerald)' : 'var(--color-ink-3)',
          }}
        >
          {state === 'active' ? '● AKTİF' : 'YAKINDA'}
        </div>
      </div>
    </div>
  )
}

export function CareerScene({
  onBack,
  onFind,
  editMode = false,
  layout,
  selectedId,
  onBlockDown,
}: {
  onBack: () => void
  onFind: () => void
} & EditProps) {
  const bp = makeBp(editMode ? layout : loadLayout('career'), editMode, selectedId, onBlockDown)
  return (
    <motion.div
      className="stage"
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="relative z-[1] flex h-full flex-col">
        <header className="flex items-center gap-3 px-4 pt-safe" style={{ paddingBottom: 8 }}>
          <motion.button
            onClick={editMode ? undefined : onBack}
            onPointerDown={bp('back').onPointerDown}
            whileTap={editMode ? undefined : { scale: 0.9 }}
            aria-label="Geri"
            className="glass-soft grid place-items-center rounded-full"
            style={{ width: 40, height: 40, color: 'var(--color-ink-1)', ...bp('back').style }}
          >
            <IconArrowLeft size={20} />
          </motion.button>
          <h1 onPointerDown={bp('title').onPointerDown} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.04em', ...bp('title').style }}>
            KARİYER
          </h1>
        </header>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {/* Rank card */}
          <motion.div
            className="glass sheen relative overflow-hidden"
            onPointerDown={bp('rankcard').onPointerDown}
            style={{ borderRadius: 20, padding: 18, ...bp('rankcard').style } as CSSProperties}
            initial={editMode ? false : { opacity: 0, y: 16 }}
            animate={editMode ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center gap-4">
              <div
                className="grid place-items-center"
                style={{
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  borderRadius: 18,
                  background: 'linear-gradient(150deg, rgba(56,189,248,0.22), rgba(139,92,246,0.22))',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <RankBadge size={38} />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 24,
                    color: 'var(--color-cyan)',
                    textShadow: '0 0 20px rgba(56,189,248,0.4)',
                  }}
                >
                  {CAREER.league.toUpperCase()}
                </div>
                <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                  {formatNumber(CAREER.soloQp)} QP
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div
                className="flex items-center justify-between"
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: 6 }}
              >
                <span>Sonraki: {CAREER.nextLeague}</span>
                <span className="tnum" style={{ color: 'var(--color-gold)' }}>+{CAREER.toNext} QP</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg,#38bdf8,#a78bfa)',
                    boxShadow: '0 0 12px rgba(139,92,246,0.7)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(CAREER.tierProgress * 100)}%` }}
                  transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
                />
              </div>
            </div>
          </motion.div>

          {/* Modes */}
          <div className="flex flex-col gap-3">
            <ModeCard
              title="1V1 DERECELİ"
              desc="Ana dereceli mod"
              stat={`Solo ${formatNumber(CAREER.soloQp)}`}
              icon={<IconBolt size={24} />}
              accentA="#a78bfa"
              accentB="#6d28d9"
              state="active"
              blk={bp('mode1')}
            />
            <ModeCard
              title="2V2 DERECELİ"
              desc="Takımınla derece kazan"
              stat={`Takım ${formatNumber(CAREER.teamQp)}`}
              icon={<IconUsers size={24} />}
              accentA="#60a5fa"
              accentB="#2563eb"
              state="locked"
              blk={bp('mode2')}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-safe" style={{ paddingTop: 8 }}>
          <motion.button
            onClick={editMode ? undefined : onFind}
            onPointerDown={bp('cta').onPointerDown}
            whileTap={editMode ? undefined : { scale: 0.97 }}
            whileHover={editMode ? undefined : { scale: 1.01 }}
            className="sheen relative w-full"
            style={{
              height: 60,
              borderRadius: 18,
              background: 'linear-gradient(120deg,#7c3aed,#3b82f6)',
              boxShadow: '0 16px 40px -12px rgba(124,58,237,0.7), inset 0 1px 0 rgba(255,255,255,0.25)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: '0.06em',
              color: '#fff',
              ...bp('cta').style,
            }}
          >
            EŞLEŞME BUL
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
