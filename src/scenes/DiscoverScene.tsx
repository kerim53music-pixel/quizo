import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { IconArrowLeft, IconMic, IconMicOff } from '../components/icons'
import { mockOpenRooms, MODE_BY_SIZE, type OpenRoom } from '../lib/room'
import { type EditProps } from '../lib/editable'
import { ScreenExtras } from '../components/ScreenExtras'

const EASE = [0.22, 1, 0.36, 1] as const
const FILTERS = [
  { v: 0, label: 'TÜMÜ' },
  { v: 2, label: '2' },
  { v: 4, label: '4' },
  { v: 6, label: '6' },
  { v: 8, label: '8' },
]

function RoomCard({ r, onJoin }: { r: OpenRoom; onJoin: () => void }) {
  const full = r.players >= r.size
  return (
    <motion.div layout className="glass flex items-center gap-3" style={{ borderRadius: 16, padding: '13px 14px' }}>
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{r.name}</div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-2)', marginTop: 3 }}>
          <span className="tnum" style={{ color: full ? 'var(--color-wrong)' : 'var(--color-cyan)' }}>{r.players}/{r.size}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{MODE_BY_SIZE[r.size] ?? ''}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{r.category}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: r.voice ? 'var(--color-violet-bright)' : 'var(--color-ink-3)' }}>
            {r.voice ? <IconMic size={13} /> : <IconMicOff size={13} />}
          </span>
        </div>
      </div>
      <motion.button
        onClick={full ? undefined : onJoin}
        disabled={full}
        whileTap={full ? undefined : { scale: 0.95 }}
        style={{
          padding: '10px 18px',
          borderRadius: 12,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '0.04em',
          color: '#fff',
          background: full ? 'rgba(255,255,255,0.06)' : 'linear-gradient(120deg,#7c3aed,#3b82f6)',
          boxShadow: full ? 'none' : '0 8px 22px -8px rgba(124,58,237,0.7)',
          opacity: full ? 0.5 : 1,
        }}
      >
        {full ? 'DOLU' : 'KATIL'}
      </motion.button>
    </motion.div>
  )
}

export function DiscoverScene({ onBack, onJoin, editMode = false }: { onBack: () => void; onJoin: (r: OpenRoom) => void } & EditProps) {
  const [rooms] = useState<OpenRoom[]>(() => mockOpenRooms())
  const [filter, setFilter] = useState(0)
  const shown = useMemo(() => (filter === 0 ? rooms : rooms.filter((r) => r.size === filter)), [rooms, filter])

  return (
    <motion.div className="stage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="relative z-[1] flex h-full flex-col">
        <header className="flex items-center gap-3 px-4 pt-safe" style={{ paddingBottom: 8 }}>
          <motion.button onClick={onBack} whileTap={{ scale: 0.9 }} aria-label="Geri" className="glass-soft grid place-items-center rounded-full" style={{ width: 40, height: 40, color: 'var(--color-ink-1)' }}>
            <IconArrowLeft size={20} />
          </motion.button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '0.04em' }}>ODALARI KEŞFET</h1>
        </header>

        <div className="flex gap-2 px-4" style={{ paddingBottom: 10 }}>
          {FILTERS.map((f) => {
            const on = filter === f.v
            return (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                className="glass-soft tnum"
                style={{
                  padding: '7px 0',
                  flex: 1,
                  borderRadius: 10,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 12.5,
                  color: on ? '#fff' : 'var(--color-ink-2)',
                  background: on ? 'linear-gradient(150deg,#7c3aed,#3b82f6)' : undefined,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-safe">
          {shown.length === 0 ? (
            <div className="grid flex-1 place-items-center" style={{ color: 'var(--color-ink-3)', fontWeight: 600 }}>
              Bu filtreye uygun oda yok.
            </div>
          ) : (
            shown.map((r) => <RoomCard key={r.code} r={r} onJoin={() => onJoin(r)} />)
          )}
        </div>
      </div>
      {!editMode && <ScreenExtras screen="discover" />}
    </motion.div>
  )
}
