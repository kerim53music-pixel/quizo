import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Question } from '../../lib/questions'
import { IconScroll, IconGlobe, IconBall, IconFilm, IconNote, IconFlask, IconStar, type IconProps } from '../../components/icons'

export type Side = 'you' | 'foe'
export type OptState = 'idle' | 'active' | 'correct' | 'wrong'
export type Outcome = { label: string; delta: number; good: boolean }

const EASE = [0.22, 1, 0.36, 1] as const

const CAT: Record<string, { a: string; b: string; Icon: (p: IconProps) => React.ReactNode }> = {
  Tarih: { a: '#f5c451', b: '#c98a15', Icon: IconScroll },
  Coğrafya: { a: '#2dd4bf', b: '#0d9488', Icon: IconGlobe },
  Spor: { a: '#4ade80', b: '#12946a', Icon: IconBall },
  Sinema: { a: '#fb7185', b: '#e11d48', Icon: IconFilm },
  Müzik: { a: '#a78bfa', b: '#7c3aed', Icon: IconNote },
  Bilim: { a: '#38bdf8', b: '#2563eb', Icon: IconFlask },
  'Genel Kültür': { a: '#fbbf24', b: '#d97706', Icon: IconStar },
}

function CategoryBadge({ cat }: { cat: string }) {
  const c = CAT[cat] ?? CAT['Genel Kültür']
  const Ico = c.Icon
  return (
    <div
      className="grid place-items-center"
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: `linear-gradient(150deg, ${c.a}, ${c.b})`,
        border: '3px solid #fff',
        boxShadow: `0 10px 22px -6px ${c.b}`,
        color: '#fff',
      }}
    >
      <Ico size={26} strokeWidth={2} />
    </div>
  )
}

export function QuestionCard({
  q,
  tag,
  index,
  total,
}: {
  q: Question
  tag?: string
  index?: number
  total?: number
}) {
  return (
    <div className="flex flex-col items-center">
      {total != null && index != null && (
        <div className="flex items-center gap-1.5" style={{ marginBottom: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? 11 : 8,
                height: i === index ? 11 : 8,
                borderRadius: 999,
                background: i < index ? '#34d67a' : i === index ? '#fff' : 'rgba(255,255,255,0.35)',
                boxShadow: i === index ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
                transition: 'all 200ms',
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={q.q}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.97 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="flex w-full flex-col items-center"
        >
          <div style={{ position: 'relative', zIndex: 2, marginBottom: -26 }}>
            <CategoryBadge cat={q.category} />
          </div>
          <div
            style={{
              width: '100%',
              background: '#ffffff',
              borderRadius: 24,
              padding: '38px 20px 22px',
              boxShadow: '0 18px 38px -14px rgba(0,0,0,0.55)',
            }}
          >
            {tag && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#8a90b0',
                  marginBottom: 8,
                }}
              >
                {tag.toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: '#20233a',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 20,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {q.q}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function OptionList({
  q,
  stateOf,
  onPick,
}: {
  q: Question
  stateOf: (i: number) => OptState
  onPick: (i: number) => void
}) {
  const SKIN: Record<OptState, { bg: string; fg: string; lip: string; op: number }> = {
    idle: { bg: '#ffffff', fg: '#2a2c42', lip: '#c9cde0', op: 0.92 },
    active: { bg: '#ffffff', fg: '#2a2c42', lip: '#c9cde0', op: 1 },
    correct: { bg: 'linear-gradient(180deg,#42df84,#20b866)', fg: '#fff', lip: '#149a52', op: 1 },
    wrong: { bg: 'linear-gradient(180deg,#ff5f68,#e0242f)', fg: '#fff', lip: '#a5121c', op: 1 },
  }
  return (
    <div className="flex flex-col gap-3">
      {q.options.map((opt, i) => {
        const st = stateOf(i)
        const s = SKIN[st]
        return (
          <button
            key={i}
            className="quiz-pill"
            disabled={st !== 'active'}
            onClick={() => onPick(i)}
            style={
              {
                width: '100%',
                minHeight: 56,
                borderRadius: 18,
                background: s.bg,
                color: s.fg,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16.5,
                padding: '12px 16px',
                opacity: s.op,
                boxShadow: `0 5px 0 ${s.lip}, 0 12px 20px -8px rgba(0,0,0,0.45)`,
              } as CSSProperties
            }
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export function OutcomeBanner({ outcome }: { outcome: Outcome }) {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 15 }}
      className="flex flex-col items-center"
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '0.03em',
          color: outcome.good ? '#5cf09a' : outcome.delta === 0 ? '#fff' : '#ff8088',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}
      >
        {outcome.label}
      </div>
      {outcome.delta !== 0 && (
        <div
          className="tnum"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, color: outcome.delta > 0 ? '#5cf09a' : '#ff8088', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          {outcome.delta > 0 ? '+' : ''}
          {outcome.delta}
        </div>
      )}
    </motion.div>
  )
}
