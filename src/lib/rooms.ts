// Gerçek online oda: Supabase tablosu + realtime. İki telefon aynı odayı canlı görür.
import { supabase } from './cloud'
import { MODE_BY_SIZE, type Room, type RoomSettings } from './room'

export type RMember = { id: string; name: string; team: 'red' | 'blue'; ready: boolean; mic: boolean }
export type CloudRoom = {
  code: string
  host_id: string
  size: number
  settings: RoomSettings
  members: RMember[]
  status: 'lobby' | 'playing'
}

const CID = 'quizo-client-id'
/** Bu cihazın kimliği (aynı odada iki telefonu ayırt etmek için) */
export function clientId(): string {
  try {
    let v = localStorage.getItem(CID)
    if (!v) {
      v = Math.random().toString(36).slice(2, 8)
      localStorage.setItem(CID, v)
    }
    return v
  } catch {
    return 'anon'
  }
}

const four = () => String(Math.floor(1000 + Math.random() * 9000))

export async function createCloudRoom(size: number, settings: RoomSettings, name: string): Promise<CloudRoom | null> {
  const me: RMember = { id: clientId(), name, team: 'red', ready: false, mic: true }
  for (let i = 0; i < 6; i++) {
    const code = `QZ-${four()}`
    const { data, error } = await supabase
      .from('rooms')
      .insert({ code, host_id: me.id, size, settings, members: [me], status: 'lobby' })
      .select()
      .single()
    if (!error && data) return data as CloudRoom
  }
  return null
}

export async function joinCloudRoom(code: string, name: string): Promise<{ room?: CloudRoom; error?: string }> {
  const { data } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle()
  if (!data) return { error: 'Oda bulunamadı' }
  const room = data as CloudRoom
  if (room.status !== 'lobby') return { error: 'Oyun başladı' }
  const id = clientId()
  if (room.members.some((m) => m.id === id)) return { room }
  if (room.members.length >= room.size) return { error: 'Oda dolu' }
  const reds = room.members.filter((m) => m.team === 'red').length
  const blues = room.members.filter((m) => m.team === 'blue').length
  const me: RMember = { id, name, team: reds <= blues ? 'red' : 'blue', ready: false, mic: true }
  const members = [...room.members, me]
  const { data: upd } = await supabase
    .from('rooms')
    .update({ members, updated_at: new Date().toISOString() })
    .eq('code', code)
    .select()
    .single()
  return { room: (upd as CloudRoom) || { ...room, members } }
}

export async function patchMe(code: string, patch: Partial<RMember>): Promise<void> {
  const { data } = await supabase.from('rooms').select('members').eq('code', code).maybeSingle()
  if (!data) return
  const id = clientId()
  const members = (data.members as RMember[]).map((m) => (m.id === id ? { ...m, ...patch } : m))
  await supabase.from('rooms').update({ members, updated_at: new Date().toISOString() }).eq('code', code)
}

export async function leaveCloudRoom(code: string): Promise<void> {
  const { data } = await supabase.from('rooms').select('members').eq('code', code).maybeSingle()
  if (!data) return
  const id = clientId()
  const members = (data.members as RMember[]).filter((m) => m.id !== id)
  await supabase.from('rooms').update({ members, updated_at: new Date().toISOString() }).eq('code', code)
}

export async function startCloudRoom(code: string): Promise<void> {
  await supabase.from('rooms').update({ status: 'playing', updated_at: new Date().toISOString() }).eq('code', code)
}

/** Odadaki her değişikliği canlı dinle (üye girdi/çıktı, hazır oldu, oyun başladı) */
export function subscribeRoom(code: string, cb: (r: CloudRoom) => void): () => void {
  const ch = supabase
    .channel(`room-${code}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, (p) => {
      if (p.new && Object.keys(p.new).length) cb(p.new as CloudRoom)
    })
    .subscribe()
  // yedek: realtime düşerse 3 sn'de bir tazele
  const iv = window.setInterval(async () => {
    const { data } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle()
    if (data) cb(data as CloudRoom)
  }, 3000)
  return () => {
    window.clearInterval(iv)
    void supabase.removeChannel(ch)
  }
}

/** Bulut odasını mevcut ekranların anladığı biçime çevir */
export function toRoom(r: CloudRoom): Room {
  const id = clientId()
  const conv = (t: 'red' | 'blue') =>
    r.members.filter((m) => m.team === t).map((m) => ({ name: m.name, you: m.id === id, ready: m.ready, mic: m.mic }))
  return {
    code: r.code,
    size: r.size,
    mode: MODE_BY_SIZE[r.size] ?? `${r.size / 2}v${r.size / 2}`,
    settings: r.settings,
    red: conv('red'),
    blue: conv('blue'),
  }
}
