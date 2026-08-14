import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { asset } from '../lib/asset'

type PlacedItem = { id: string; src: string; x: number; y: number; w: number; anim?: 'orbit' | 'seq4' }
type ScreenData = { bg: string | null; items: PlacedItem[] }

function loadScreenExtras(screen: string): ScreenData {
  try {
    const raw = localStorage.getItem(`quizo-screen-${screen}`)
    if (raw) {
      const d = JSON.parse(raw)
      if (d && Array.isArray(d.items)) return { bg: d.bg ?? null, items: d.items }
    }
  } catch {
    /* ignore */
  }
  return { bg: null, items: [] }
}

/** O ekran için editörde kaydedilmiş kendi tasarımı var mı? (varsa varsayılan sahne çizilmez) */
export function hasScreenExtras(screen: string): boolean {
  const d = loadScreenExtras(screen)
  return !!d.bg || d.items.length > 0
}

/** Editörde bir ekrana eklenen ekstra asset/arka plan — gerçek oyunda (editMode dışında) da gösterilir. */
export function ScreenExtras({ screen }: { screen: string }) {
  const data = useMemo(() => loadScreenExtras(screen), [screen])
  if (!data.bg && data.items.length === 0) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
      {data.bg && (
        <img src={asset(data.bg)} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {data.items.map((it) => (
        <img
          key={it.id}
          src={asset(it.src)}
          alt=""
          draggable={false}
          className={it.anim === 'orbit' ? 'qz-anim-orbit' : it.anim === 'seq4' ? 'qz-anim-seq4' : undefined}
          style={
            {
              position: 'absolute',
              left: `${it.x * 100}%`,
              top: `${it.y * 100}%`,
              width: `${it.w * 100}%`,
              height: 'auto',
              ['--qz-base-left' as string]: `${it.x * 100}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
