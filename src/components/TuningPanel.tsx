import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useTuning, setTuning, resetTuning, type Tuning } from '../lib/tuning'

function Row({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <label style={{ display: 'block', marginBottom: 9 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11.5,
          fontWeight: 600,
          color: 'var(--color-ink-2)',
          marginBottom: 3,
        }}
      >
        <span>{label}</span>
        <span className="tnum" style={{ color: 'var(--color-cyan)' }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' } as CSSProperties}
      />
    </label>
  )
}

export function TuningPanel({ onOpenEditor }: { onOpenEditor?: () => void }) {
  const t = useTuning()
  const [open, setOpen] = useState(true)

  const set = (patch: Partial<Tuning>) => setTuning(patch)

  return (
    <div style={{ position: 'fixed', right: 10, bottom: 10, zIndex: 300, width: 232 }}>
      {open && (
        <div
          className="glass"
          style={{
            padding: '12px 13px',
            borderRadius: 14,
            marginBottom: 8,
            maxHeight: '78vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.08em',
                color: 'var(--color-ink-1)',
              }}
            >
              CANLI AYAR
            </span>
            <button
              onClick={() => resetTuning()}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-violet-bright)',
                padding: '3px 8px',
                borderRadius: 8,
                background: 'rgba(139,92,246,0.14)',
              }}
            >
              Sıfırla
            </button>
          </div>

          <button onClick={onOpenEditor} style={{ width: '100%', marginBottom: 10, padding: '9px 0', borderRadius: 10, background: 'linear-gradient(180deg,#7c3aed,#3b82f6)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13 }}>🎨 EDİTÖRÜ AÇ</button>

          <Row label="Buton yüksekliği" value={t.buttonHeightPx} min={64} max={240} step={2} unit="px" onChange={(v) => set({ buttonHeightPx: v })} />
          <Row label="Buton genişliği" value={t.buttonWidthPct} min={55} max={100} step={1} unit="%" onChange={(v) => set({ buttonWidthPct: v })} />
          <Row label="Butonlar arası boşluk" value={t.buttonGap} min={2} max={28} step={1} unit="px" onChange={(v) => set({ buttonGap: v })} />
          <Row label="Köşe yuvarlaklığı" value={t.buttonRadius} min={0} max={30} step={1} unit="px" onChange={(v) => set({ buttonRadius: v })} />
          <Row label="Kırpma konumu (dikey)" value={t.objPosY} min={0} max={100} step={1} unit="%" onChange={(v) => set({ objPosY: v })} />
          <Row label="Logo boyutu" value={t.logoWidth} min={60} max={260} step={2} unit="px" onChange={(v) => set({ logoWidth: v })} />
          <Row label="Arka plan karartma" value={Math.round(t.scrim * 100)} min={0} max={85} step={2} unit="%" onChange={(v) => set({ scrim: v / 100 })} />
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="glass"
        style={{
          width: '100%',
          padding: '8px 0',
          borderRadius: 12,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '0.06em',
          color: 'var(--color-ink-1)',
        }}
      >
        {open ? '▾ Ayarı Gizle' : '⚙ Ayar'}
      </button>
    </div>
  )
}
