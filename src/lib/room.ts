export type Member = { name: string; you: boolean; ready: boolean; mic: boolean }

export type RoomSettings = {
  visibility: 'private' | 'public'
  teamMode: 'auto' | 'manual'
  difficulty: 'Karışık' | 'Normal' | 'Zor'
  category: string
  voice: boolean
  steal: boolean
  stages: boolean[] // length 4
}

export type Room = {
  code: string
  size: number
  mode: string
  settings: RoomSettings
  red: Member[]
  blue: Member[]
}

export const MODE_BY_SIZE: Record<number, string> = { 2: '1v1', 4: '2v2', 6: '3v3', 8: '4v4' }

const BOTS = ['Mert', 'Berk', 'Can', 'Emre', 'Deniz', 'Kaan', 'Efe', 'Burak', 'Arda', 'Ege', 'Poyraz', 'Kuzey']

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function genCode(): string {
  let s = ''
  for (let i = 0; i < 4; i++) s += Math.floor(Math.random() * 10)
  return `QZ-${s}`
}

export const DEFAULT_SETTINGS: RoomSettings = {
  visibility: 'private',
  teamMode: 'auto',
  difficulty: 'Karışık',
  category: 'Tümü',
  voice: true,
  steal: true,
  stages: [true, true, true, true],
}

export function makeRoom(size: number, settings: RoomSettings, meName: string, code = genCode()): Room {
  const per = size / 2
  const bots = shuffle(BOTS)
  let bi = 0
  const red: Member[] = [{ name: meName, you: true, ready: false, mic: settings.voice }]
  for (let i = 1; i < per; i++) red.push({ name: bots[bi++], you: false, ready: false, mic: settings.voice })
  const blue: Member[] = []
  for (let i = 0; i < per; i++) blue.push({ name: bots[bi++], you: false, ready: false, mic: settings.voice })
  return { code, size, mode: MODE_BY_SIZE[size] ?? `${per}v${per}`, settings, red, blue }
}

export type OpenRoom = {
  code: string
  name: string
  size: number
  players: number
  category: string
  voice: boolean
  difficulty: string
}

const ROOM_NAMES = ['Gece QUIZO', 'Bilgi Arenası', 'Zirve Ligi', 'Kafa Dengi', 'Hız Kralları', 'Elmas Masası', 'Şampiyonlar', 'Bilgiçler']
const CATS = ['Genel Kültür', 'Tarih', 'Spor', 'Bilim', 'Karışık']
const DIFFS = ['Karışık', 'Normal', 'Zor']

export function mockOpenRooms(): OpenRoom[] {
  const names = shuffle(ROOM_NAMES)
  const sizes = [4, 8, 6, 2, 4, 8]
  return names.slice(0, 6).map((name, i) => {
    const size = sizes[i % sizes.length]
    return {
      code: genCode(),
      name,
      size,
      players: Math.max(1, Math.floor(Math.random() * (size - 1)) + 1),
      category: CATS[Math.floor(Math.random() * CATS.length)],
      voice: Math.random() > 0.4,
      difficulty: DIFFS[Math.floor(Math.random() * DIFFS.length)],
    }
  })
}
