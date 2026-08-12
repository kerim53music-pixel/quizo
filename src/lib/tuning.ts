import { useSyncExternalStore } from 'react'

export type Tuning = {
  buttonHeightPx: number
  buttonWidthPct: number
  buttonGap: number
  buttonRadius: number
  objPosY: number
  logoWidth: number
  scrim: number
}

export const DEFAULT_TUNING: Tuning = {
  buttonHeightPx: 104,
  buttonWidthPct: 100,
  buttonGap: 12,
  buttonRadius: 15,
  objPosY: 42,
  logoWidth: 104,
  scrim: 0.32,
}

const KEY = 'quizo-tuning-v1'
const listeners = new Set<() => void>()

function load(): Tuning {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_TUNING, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_TUNING }
}

let state: Tuning = load()

export function getTuning(): Tuning {
  return state
}

export function setTuning(patch: Partial<Tuning>): void {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function resetTuning(): void {
  state = { ...DEFAULT_TUNING }
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useTuning(): Tuning {
  return useSyncExternalStore(subscribe, getTuning, getTuning)
}
