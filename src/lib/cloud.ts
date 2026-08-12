// QUIZO bulut kaydı (Supabase). Editörde yaptığın her şey buluta yazılır,
// canlı sitede ve her tarayıcıda aynısı görünür. Tarayıcı temizlense bile kaybolmaz.
import { createClient } from '@supabase/supabase-js'

const URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://znonfsdvkylddgibzobs.supabase.co'
const KEY =
  (import.meta.env.VITE_SUPABASE_KEY as string) || 'sb_publishable_FdUx5yfcUcaPk1hMynSVoQ_9XyGqxN2'

export const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

// Buluta senkronlanan localStorage anahtarları
export const isSyncedKey = (k: string) =>
  k.startsWith('quizo-layout-') || k.startsWith('quizo-screen-') || k === 'quizo-uploads'

export type CloudStatus = 'idle' | 'saving' | 'saved' | 'error'

/** Uygulama açılışında bulutu localStorage'a indir (sahneler senkron okuduğu için render'dan ÖNCE çağrılır). */
export async function hydrateFromCloud(): Promise<{ ok: boolean; count: number }> {
  try {
    const { data, error } = await supabase.from('editor_state').select('key,value')
    if (error || !data) return { ok: false, count: 0 }
    for (const row of data) {
      if (!isSyncedKey(row.key)) continue
      try {
        localStorage.setItem(row.key, JSON.stringify(row.value))
      } catch {
        /* kota dolu olabilir, yoksay */
      }
    }
    return { ok: true, count: data.length }
  } catch {
    return { ok: false, count: 0 }
  }
}

/** Tek bir anahtarı buluta yaz (upsert). Her yazım ayrıca editor_history'ye yedeklenir (DB trigger). */
export async function pushToCloud(key: string, value: unknown): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('editor_state')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    return !error
  } catch {
    return false
  }
}

/** Yerel kayıtların tamamını buluta gönder (ilk taşıma / kurtarma için). */
export async function pushAllLocalToCloud(): Promise<number> {
  let n = 0
  for (const key of Object.keys(localStorage)) {
    if (!isSyncedKey(key)) continue
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      if (await pushToCloud(key, JSON.parse(raw))) n++
    } catch {
      /* bozuk JSON, atla */
    }
  }
  return n
}
