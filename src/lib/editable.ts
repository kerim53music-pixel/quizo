// Ekran parça-düzenleme sistemi (tüm ekranlar): her parçaya kimlik ver,
// editörde taşı/boyutlandır/gizle, Kaydet → oyuna işler, oyun aynı kaydı okur.
import type * as React from 'react'
import type { CSSProperties } from 'react'

export type Blk = { dx: number; dy: number; s: number; hidden?: boolean }
export type ElemLayout = Record<string, Blk>
export type BlkProps = { style: CSSProperties; onPointerDown?: (e: React.PointerEvent) => void }
export type BpFn = (id: string, base?: CSSProperties) => BlkProps
export type EditProps = {
  editMode?: boolean
  layout?: ElemLayout
  selectedId?: string | null
  onBlockDown?: (id: string, e: React.PointerEvent) => void
}

export const LAYOUT_KEY = (screen: string) => `quizo-layout-${screen}`

export function loadLayout(screen: string): ElemLayout {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY(screen))
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return {}
}

export function saveLayout(screen: string, l: ElemLayout): boolean {
  try {
    localStorage.setItem(LAYOUT_KEY(screen), JSON.stringify(l))
    return true
  } catch {
    return false
  }
}

// Bir parçanın props'unu üretir. Sil → tamamen gizle (editörde de görünmez, şeffaf değil).
export function makeBp(
  layout: ElemLayout | undefined,
  editMode: boolean,
  selectedId: string | null | undefined,
  onBlockDown?: (id: string, e: React.PointerEvent) => void,
): BpFn {
  return (id, base) => {
    const t = layout?.[id]
    const style: CSSProperties = { ...(base || {}) }
    if (t?.hidden) return { style: { ...style, display: 'none' } }
    if (t) {
      style.transform = `translate(${t.dx}px, ${t.dy}px)` + (t.s && t.s !== 1 ? ` scale(${t.s})` : '')
    }
    if (editMode) {
      style.outline = selectedId === id ? '3px solid #38bdf8' : undefined
      style.outlineOffset = 2
      style.cursor = 'move'
      style.touchAction = 'none'
      return { style, onPointerDown: (e) => { e.stopPropagation(); onBlockDown?.(id, e) } }
    }
    return { style }
  }
}
