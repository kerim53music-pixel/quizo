import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { IconArrowLeft } from '../components/icons'
import { DEFAULT_SETTINGS, MODE_BY_SIZE, type RoomSettings } from '../lib/room'
import { type EditProps } from '../lib/editable'
import { ScreenExtras, hasScreenExtras } from '../components/ScreenExtras'

const EASE = [0.22, 1, 0.36, 1] as const
const SIZES = [2, 4, 6, 8]

function Seg({ options, value, onChange }: { options: { v: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="glass-soft flex" style={{ borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = value === o.v
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 9,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 12.5,
              background: on ? 'linear-gradient(150deg,#7c3aed,#3b82f6)' : 'transparent',
              color: on ? '#fff' : 'var(--color-ink-2)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-ink-2)', letterSpacing: '0.02em' }}>{label}</div>
      {children}
    </div>
  )
}

export function CreateRoomScene({ onBack, onCreate, editMode = false }: { onBack: () => void; onCreate: (size: number, s: RoomSettings) => void } & EditProps) {
  const custom = !editMode && hasScreenExtras('create')
  const [size, setSize] = useState(2)
  const [s, setS] = useState<RoomSettings>(DEFAULT_SETTINGS)
  const set = (patch: Partial<RoomSettings>) => setS((prev) => ({ ...prev, ...patch }))
  const toggleStage = (i: number) => setS((prev) => ({ ...prev, stages: prev.stages.map((v, j) => (j === i ? !v : v)) }))

  return (
    <motion.div className="stage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="relative z-[1] flex h-full flex-col" style={{ display: custom ? 'none' : undefined }}>
        <header className="flex items-center gap-3 px-4 pt-safe" style={{ paddingBottom: 8 }}>
          <motion.button onClick={onBack} whileTap={{ scale: 0.9 }} aria-label="Geri" className="glass-soft grid place-items-center rounded-full" style={{ width: 40, height: 40, color: 'var(--color-ink-1)' }}>
            <IconArrowLeft size={20} />
          </motion.button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.04em' }}>ODA KUR</h1>
        </header>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <Row label="Kişi sayısı">
            <div className="grid grid-cols-2 gap-2.5">
              {SIZES.map((n) => {
                const on = size === n
                return (
                  <motion.button
                    key={n}
                    onClick={() => setSize(n)}
                    whileTap={{ scale: 0.97 }}
                    className="glass relative"
                    style={{ padding: '14px 10px', borderRadius: 14, borderColor: on ? 'rgba(167,139,250,0.6)' : undefined } as CSSProperties}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: on ? 'var(--color-violet-bright)' : 'var(--color-ink-1)' }}>{n} KİŞİ</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-3)' }}>{MODE_BY_SIZE[n]}</div>
                  </motion.button>
                )
              })}
            </div>
          </Row>

          <Row label="Oda">
            <Seg options={[{ v: 'private', label: 'ÖZEL' }, { v: 'public', label: 'HERKESE AÇIK' }]} value={s.visibility} onChange={(v) => set({ visibility: v as RoomSettings['visibility'] })} />
          </Row>
          <Row label="Takımlar">
            <Seg options={[{ v: 'auto', label: 'OTOMATİK' }, { v: 'manual', label: 'MANUEL' }]} value={s.teamMode} onChange={(v) => set({ teamMode: v as RoomSettings['teamMode'] })} />
          </Row>
          <Row label="Zorluk">
            <Seg options={[{ v: 'Karışık', label: 'KARIŞIK' }, { v: 'Normal', label: 'NORMAL' }, { v: 'Zor', label: 'ZOR' }]} value={s.difficulty} onChange={(v) => set({ difficulty: v as RoomSettings['difficulty'] })} />
          </Row>
          <div className="flex gap-3">
            <div className="flex-1">
              <Row label="Çalma">
                <Seg options={[{ v: 'on', label: 'AÇIK' }, { v: 'off', label: 'KAPALI' }]} value={s.steal ? 'on' : 'off'} onChange={(v) => set({ steal: v === 'on' })} />
              </Row>
            </div>
            <div className="flex-1">
              <Row label="Sesli sohbet">
                <Seg options={[{ v: 'on', label: 'AÇIK' }, { v: 'off', label: 'KAPALI' }]} value={s.voice ? 'on' : 'off'} onChange={(v) => set({ voice: v === 'on' })} />
              </Row>
            </div>
          </div>

          <Row label="Etaplar">
            <div className="flex gap-2">
              {['1', '2', '3', '4'].map((n, i) => {
                const on = s.stages[i]
                return (
                  <button
                    key={n}
                    onClick={() => toggleStage(i)}
                    className="glass-soft flex-1"
                    style={{
                      padding: '10px 0',
                      borderRadius: 11,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 13,
                      color: on ? '#fff' : 'var(--color-ink-3)',
                      background: on ? 'linear-gradient(150deg,#7c3aed,#3b82f6)' : undefined,
                      opacity: on ? 1 : 0.6,
                    }}
                  >
                    ETAP {n}
                  </button>
                )
              })}
            </div>
          </Row>
        </div>

        <div className="px-4 pb-safe" style={{ paddingTop: 8 }}>
          <motion.button
            onClick={() => onCreate(size, s)}
            whileTap={{ scale: 0.97 }}
            style={{ height: 58, width: '100%', borderRadius: 16, background: 'linear-gradient(120deg,#7c3aed,#3b82f6)', boxShadow: '0 16px 40px -12px rgba(124,58,237,0.7)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '0.05em', color: '#fff' }}
          >
            ODAYI KUR
          </motion.button>
        </div>
      </div>
      {!editMode && <ScreenExtras screen="create" />}
      {custom && (
        <button onClick={() => onCreate(size, s)} className="btn-primary press" style={{ position: 'absolute', left: '50%', top: '88%', transform: 'translateX(-50%)', zIndex: 7, height: 54, width: '76%', fontSize: 17 }}>
          ODAYI KUR
        </button>
      )}
    </motion.div>
  )
}
