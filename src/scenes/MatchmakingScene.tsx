import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { RankBadge } from '../components/RankBadge'
import { IconX } from '../components/icons'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type EditProps } from '../lib/editable'
import { ScreenExtras, hasScreenExtras } from '../components/ScreenExtras'
import type { Fighter } from '../lib/player'

const EASE = [0.22, 1, 0.36, 1] as const
const STEPS = ['BAĞLANIYOR', 'RAKİP ARANIYOR', 'RAKİP BULUNDU', 'HAZIRLANIYOR']
const STEP_MS = 1000

function ConnectSteps({ active }: { active: number }) {
  return (
    <div className="flex items-center" style={{ width: '100%' }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < STEPS.length - 1 ? '1 1 0' : '0 0 auto' }}>
          <div className="flex items-center" style={{ width: '100%' }}>
            <span
              style={{
                width: 30,
                height: 30,
                minWidth: 30,
                borderRadius: '50%',
                display: 'block',
                background: i <= active ? 'radial-gradient(circle, #7dd3fc, #2563eb)' : 'rgba(255,255,255,0.08)',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: i <= active ? '#38bdf8' : 'rgba(255,255,255,0.18)',
                boxShadow: i === active ? '0 0 16px 4px rgba(56,189,248,0.85)' : i < active ? '0 0 8px 1px rgba(56,189,248,0.5)' : 'none',
                transition: 'all 0.4s ease',
              }}
            />
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < active ? '#38bdf8' : 'rgba(255,255,255,0.12)', transition: 'background 0.4s ease' }} />
            )}
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 800, marginTop: 6, color: i <= active ? '#7dd3fc' : 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function Dots() {
  return (
    <span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}

export function MatchmakingScene({
  me,
  onCancel,
  onFound,
  editMode = false,
  layout,
  selectedId,
  onBlockDown,
}: {
  me: Fighter
  onCancel: () => void
  onFound: () => void
} & EditProps) {
  const done = useRef(false)
  const [secs, setSecs] = useState(0)
  const [step, setStep] = useState(0)
  const bp = makeBp(editMode ? layout : loadLayout('search'), editMode, selectedId, onBlockDown)
  // Kendi tasarımın varsa varsayılan sahne HİÇ çizilmez (bir an bile görünmesin)
  const custom = !editMode && hasScreenExtras('search')

  useEffect(() => {
    if (editMode) return
    let i = 0
    setStep(0)
    const stepIv = setInterval(() => {
      i++
      if (i >= STEPS.length) {
        clearInterval(stepIv)
        if (!done.current) {
          done.current = true
          onFound()
        }
      } else {
        setStep(i)
      }
    }, STEP_MS)
    const secsIv = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => {
      clearInterval(stepIv)
      clearInterval(secsIv)
    }
  }, [onFound, editMode])

  return (
    <motion.div
      className="stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-7 px-6" style={{ display: custom ? 'none' : undefined }}>
        <motion.h1
          onPointerDown={bp('title').onPointerDown}
          initial={editMode ? false : { opacity: 0, y: -10 }}
          animate={editMode ? undefined : { opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 21,
            letterSpacing: '0.05em',
            color: 'var(--color-ink-1)',
            ...bp('title').style,
          }}
        >
          RAKİP ARANIYOR
          <Dots />
        </motion.h1>

        {/* Radar */}
        <div onPointerDown={bp('radar').onPointerDown} style={{ position: 'relative', width: 224, height: 224, display: 'grid', placeItems: 'center', ...bp('radar').style }}>
          {[0, 0.7, 1.4].map((d, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: 224,
                height: 224,
                borderRadius: '50%',
                borderWidth: 1.5,
                borderStyle: 'solid',
                borderColor: 'rgba(96,165,250,0.4)',
              }}
              initial={{ scale: 0.35, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.2, delay: d, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
          <div style={{ position: 'absolute', width: 224, height: 224, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', width: 148, height: 148, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
          <div
            style={
              {
                position: 'absolute',
                width: 224,
                height: 224,
                borderRadius: '50%',
                background:
                  'conic-gradient(from var(--angle), transparent 0deg, rgba(96,165,250,0.30) 42deg, transparent 92deg)',
                animation: 'spin-border 2.2s linear infinite',
              } as CSSProperties
            }
          />
          <Avatar name={me.name} size={80} />
        </div>

        {/* Player card */}
        <motion.div
          className="glass"
          onPointerDown={bp('mecard').onPointerDown}
          initial={editMode ? false : { opacity: 0, y: 16 }}
          animate={editMode ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ease: EASE }}
          style={{ borderRadius: 16, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 300, ...bp('mecard').style }}
        >
          <Avatar name={me.name} size={42} />
          <div className="min-w-0">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              {me.name.toUpperCase()}
            </div>
            <div className="flex items-center gap-1" style={{ color: 'var(--color-ink-2)', fontSize: 12.5, fontWeight: 600 }}>
              {me.city} · <RankBadge size={12} />
              <span style={{ color: 'var(--color-cyan)' }}>{me.league}</span>
            </div>
          </div>
          <div className="tnum" style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-cyan)' }}>
            {formatNumber(me.qp)}
          </div>
        </motion.div>

        <div onPointerDown={bp('secs').onPointerDown} className="tnum" style={{ color: 'var(--color-ink-3)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', ...bp('secs').style }}>
          00:{String(secs).padStart(2, '0')}
        </div>

        <motion.button
          onClick={editMode ? undefined : onCancel}
          onPointerDown={bp('cancel').onPointerDown}
          whileTap={editMode ? undefined : { scale: 0.96 }}
          className="glass-soft flex items-center gap-2"
          style={{
            padding: '11px 26px',
            borderRadius: 14,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.04em',
            color: 'var(--color-ink-2)',
            ...bp('cancel').style,
          }}
        >
          <IconX size={18} />
          İPTAL
        </motion.button>
      </div>
      {!editMode && <ScreenExtras screen="search" />}
      {/* Sırayla yanan ışıklar — editörde "Işıklar" parçası olarak taşınır/boyutlandırılır */}
      <div
        {...bp('steps')}
        style={{ position: 'absolute', left: '5%', top: '56%', width: '90%', zIndex: editMode ? 40 : 7, padding: editMode ? '14px 0' : undefined, ...bp('steps').style }}
      >
        <ConnectSteps active={editMode ? 1 : step} />
      </div>

      {/* İPTAL — kendi tasarımın gösterilirken de her zaman erişilebilir */}
      {custom && (
        <button
          {...bp('cancel')}
          onClick={onCancel}
          className="glass-soft flex items-center gap-2"
          style={{
            position: 'absolute',
            left: '50%',
            top: '88%',
            transform: 'translateX(-50%)',
            zIndex: 7,
            padding: '11px 26px',
            borderRadius: 14,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.04em',
            color: '#fff',
            ...bp('cancel').style,
          }}
        >
          <IconX size={18} />
          İPTAL
        </button>
      )}
    </motion.div>
  )
}
