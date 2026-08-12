// Görsel yolu çözücü.
// Yerelde (npm run dev) → /public klasöründeki dosyalar.
// Canlıda (Vercel) → Supabase Storage CDN.
// Editörde kaydedilen yollar ("/board/b01.png") her iki yerde de çalışsın diye tek noktadan geçiyor.
const CDN = 'https://znonfsdvkylddgibzobs.supabase.co/storage/v1/object/public/assets'

export const ASSET_BASE: string =
  (import.meta.env.VITE_ASSET_BASE as string) ?? (import.meta.env.PROD ? CDN : '')

export function asset(p: string | null | undefined): string {
  if (!p) return ''
  // Yüklenen dosyalar (data:) ve tam adresler olduğu gibi kalır
  if (p.startsWith('data:') || p.startsWith('http://') || p.startsWith('https://') || p.startsWith('blob:')) return p
  if (!ASSET_BASE) return p
  return ASSET_BASE + (p.startsWith('/') ? p : '/' + p)
}
