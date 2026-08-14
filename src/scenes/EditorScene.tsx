import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { CareerScene } from './CareerScene'
import { VsScene } from './VsScene'
import { LobbyScene } from './LobbyScene'
import { QuizBoardScene } from './QuizBoardScene'
import { MatchmakingScene } from './MatchmakingScene'
import { ResultScene } from './ResultScene'
import { CreateRoomScene } from './CreateRoomScene'
import { JoinRoomScene } from './JoinRoomScene'
import { DiscoverScene } from './DiscoverScene'
import { ME, type Fighter } from '../lib/player'
import { makeRoom, DEFAULT_SETTINGS } from '../lib/room'
import { loadLayout, saveLayout, type ElemLayout, type EditProps } from '../lib/editable'
import { pushToCloud, supabase } from '../lib/cloud'
import { asset } from '../lib/asset'

type Anim = 'orbit' | 'seq4' | undefined
type Item = { id: string; src: string; x: number; y: number; w: number; anim?: Anim }
const ANIM_CYCLE: Anim[] = [undefined, 'orbit', 'seq4']
const ANIM_LABEL: Record<string, string> = { orbit: '🌀 Daire', seq4: '➡️ Sıra' }
type ScreenData = { bg: string | null; items: Item[] }
type Seed = { bg: string | null; items: { src: string; x: number; y: number; w: number }[] }

const pad = (n: number) => String(n).padStart(2, '0')
const BOARD_ASSETS = Array.from({ length: 30 }, (_, i) => `/board/b${pad(i + 1)}.png`)
const HOME_NAMES = ['logo', 'profile', 'coin', 'life', 'gear', 'gorev', 'odul', 'liderlik', 'vip', 'magaza', 'carki', 'mascot', 'trophy', 'nav', 'b-hizli', 'b-kesfet', 'b-odaya', 'b-oda', 'b-kariyer']
const HOME_ASSETS = HOME_NAMES.map((s) => `/home/${s}.png`)

const SCREENS = [
  { key: 'board', label: 'Oyun Tahtası' },
  { key: 'home', label: 'Ana Sayfa' },
  { key: 'lobby', label: 'Lobi' },
  { key: 'search', label: 'Rakip Aranıyor' },
  { key: 'vs', label: 'VS Ekranı' },
  { key: 'result', label: 'Sonuç' },
  { key: 'career', label: 'Kariyer' },
  { key: 'create', label: 'Oda Kur' },
  { key: 'join', label: 'Odaya Katıl' },
  { key: 'discover', label: 'Odaları Keşfet' },
]

// Ana Sayfa'nın gerçek yerleşimi (HomeScene base 1000x1520) → oran (0..1). Her parça taşınır/silinir.
const HOME_SEED: Seed = {
  bg: '/home-bg.png',
  items: [
    { src: '/home/profile.png', x: 0.014, y: 0.0171, w: 0.42 },
    { src: '/home/coin.png', x: 0.47, y: 0.0316, w: 0.196 },
    { src: '/home/life.png', x: 0.69, y: 0.0342, w: 0.15 },
    { src: '/home/gear.png', x: 0.905, y: 0.0316, w: 0.064 },
    { src: '/home/logo.png', x: 0.288, y: 0.0789, w: 0.424 },
    { src: '/home/gorev.png', x: 0.016, y: 0.2829, w: 0.152 },
    { src: '/home/odul.png', x: 0.016, y: 0.4513, w: 0.152 },
    { src: '/home/liderlik.png', x: 0.016, y: 0.6184, w: 0.152 },
    { src: '/home/vip.png', x: 0.832, y: 0.2829, w: 0.152 },
    { src: '/home/magaza.png', x: 0.832, y: 0.4513, w: 0.152 },
    { src: '/home/carki.png', x: 0.832, y: 0.6184, w: 0.152 },
    { src: '/home/mascot.png', x: 0.016, y: 0.7711, w: 0.158 },
    { src: '/home/trophy.png', x: 0.852, y: 0.7632, w: 0.132 },
    { src: '/home/b-hizli.png', x: 0.28, y: 0.3658, w: 0.44 },
    { src: '/home/b-kesfet.png', x: 0.28, y: 0.4434, w: 0.44 },
    { src: '/home/b-odaya.png', x: 0.28, y: 0.5211, w: 0.44 },
    { src: '/home/b-oda.png', x: 0.28, y: 0.5987, w: 0.44 },
    { src: '/home/b-kariyer.png', x: 0.28, y: 0.6763, w: 0.44 },
    { src: '/home/nav.png', x: 0.052, y: 0.9013, w: 0.896 },
  ],
}
const BLK_LABELS: Record<string, string> = {
  // Oyun Tahtası
  exit: 'Çıkış', logo: 'Logo', timer: 'Sayaç', qcount: 'Soru No', coin: 'Coin', gear: 'Ayar',
  'player-0': 'Oyuncu 1', 'player-1': 'Oyuncu 2', 'player-2': 'Oyuncu 3', 'player-3': 'Oyuncu 4',
  qcard: 'Soru Kartı', category: 'Kategori', question: 'Soru Metni',
  'ans-0': 'A Şık', 'ans-1': 'B Şık', 'ans-2': 'C Şık', 'ans-3': 'D Şık',
  'pu-time': '+10sn Joker', 'pu-fifty': '%50 Joker', 'pu-skip': 'Pas Geç', chat: 'Sohbet', buzzer: 'Buzzer',
  // Rakip Aranıyor
  title: 'Başlık', radar: 'Radar', mecard: 'Oyuncu Kartı', secs: 'Süre', cancel: 'İptal', steps: 'Işıklar',
  // VS
  'me-card': 'Sen', vs: 'VS', 'foe-card': 'Rakip',
  // Kariyer
  back: 'Geri', rankcard: 'Rütbe Kartı', mode1: '1v1 Mod', mode2: '2v2 Mod', cta: 'Eşleşme Bul',
  // Lobi
  code: 'Oda Kodu', mode: 'Mod', 'red-team': 'Kırmızı Takım', 'blue-team': 'Mavi Takım', voice: 'Sesli Sohbet', switch: 'Takım Değiştir', ready: 'Hazır', start: 'Başlat',
  // Sonuç
  panel: 'Sıralama', 'row-0': '1. Sıra', 'row-1': '2. Sıra', 'row-2': '3. Sıra', 'row-3': '4. Sıra', button: 'Ana Menü',
}

const SEEDS: Record<string, Seed> = { home: HOME_SEED }
const isSeeded = (s: string) => s === 'home'
const paletteFor = (s: string) => (s === 'home' ? HOME_ASSETS : BOARD_ASSETS)
// Parça-düzenleme (gerçek sahne, editMode) desteklenen ekranlar — home hariç hepsi
const EDITABLE_SCENES = ['board', 'lobby', 'search', 'vs', 'career', 'result', 'create', 'join', 'discover']
const UPLOADS_KEY = 'quizo-uploads'

const KEY = (s: string) => `quizo-screen-${s}`
const CELL = 24 // ızgara kare boyutu (px)
const uid = () => Math.random().toString(36).slice(2, 9)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const snapPx = (v: number) => Math.round(v / CELL) * CELL
const noop = () => {}

function seedData(screen: string): ScreenData {
  const s = SEEDS[screen]
  if (!s) return { bg: null, items: [] }
  return { bg: s.bg, items: s.items.map((it) => ({ ...it, id: uid() })) }
}

function load(screen: string): ScreenData {
  try {
    const raw = localStorage.getItem(KEY(screen))
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return seedData(screen)
}

function ScreenPreview({ screen, me, opponent, edit }: { screen: string; me: Fighter; opponent: Fighter; edit?: EditProps }) {
  const room = useMemo(() => makeRoom(4, DEFAULT_SETTINGS, me.name), [me.name])
  const roster = useMemo(() => [me.name, 'Can', 'Eren', 'Maya'], [me.name])
  const e = edit || {}
  let node: React.ReactNode = null
  if (screen === 'board') node = <QuizBoardScene me={me} roster={roster} onExit={noop} {...e} />
  else if (screen === 'search') node = <MatchmakingScene me={me} onCancel={noop} onFound={noop} {...e} />
  else if (screen === 'career') node = <CareerScene onBack={noop} onFind={noop} {...e} />
  else if (screen === 'vs') node = <VsScene me={me} opponent={opponent} onStart={noop} {...e} />
  else if (screen === 'lobby') node = <LobbyScene room={room} onLeave={noop} onStart={noop} {...e} />
  else if (screen === 'result') node = <ResultScene me={me} onExit={noop} {...e} />
  else if (screen === 'create') node = <CreateRoomScene onBack={noop} onCreate={noop} {...e} />
  else if (screen === 'join') node = <JoinRoomScene onBack={noop} onJoin={noop} {...e} />
  else if (screen === 'discover') node = <DiscoverScene onBack={noop} onJoin={noop} {...e} />
  if (!node) return null
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: e.editMode ? 'auto' : 'none', overflow: 'hidden' }}>{node}</div>
}

export function EditorScene({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState('home')
  const [items, setItems] = useState<Item[]>([])
  const [bg, setBg] = useState<string | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [showGrid, setShowGrid] = useState(true)
  const [palOpen, setPalOpen] = useState(true)
  const [snap, setSnap] = useState(true)
  const [elemLayout, setElemLayout] = useState<ElemLayout>({})
  const [selBlk, setSelBlk] = useState<string | null>(null)
  const [uploads, setUploads] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(UPLOADS_KEY) || '[]')
    } catch {
      return []
    }
  })
  const stageRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number } | null>(null)
  const blkDrag = useRef<{ id: string; sx: number; sy: number; dx0: number; dy0: number } | null>(null)

  const opponent: Fighter = { name: 'Mert', city: 'Ankara', qp: 2198, league: 'Elmas III' }
  const editComp = EDITABLE_SCENES.includes(screen)
  const seeded = isSeeded(screen)

  useEffect(() => {
    const d = load(screen)
    setItems(d.items || [])
    setBg(d.bg ?? null)
    setSel(null)
    setSelBlk(null)
    if (EDITABLE_SCENES.includes(screen)) setElemLayout(loadLayout(screen))
  }, [screen])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      // Board parça (blok) sürükleme — px cinsinden transform
      const b = blkDrag.current
      if (b) {
        let ndx = b.dx0 + (e.clientX - b.sx)
        let ndy = b.dy0 + (e.clientY - b.sy)
        if (snap) {
          ndx = snapPx(ndx)
          ndy = snapPx(ndy)
        }
        setElemLayout((l) => ({ ...l, [b.id]: { ...(l[b.id] || { dx: 0, dy: 0, s: 1 }), dx: ndx, dy: ndy } }))
        return
      }
      const d = drag.current
      const st = stageRef.current
      if (!d || !st) return
      const r = st.getBoundingClientRect()
      const dx = (e.clientX - d.sx) / r.width
      const dy = (e.clientY - d.sy) / r.height
      const fx = (v: number, dim: number) => (snap ? snapPx(v * dim) / dim : v)
      setItems((list) =>
        list.map((it) =>
          it.id !== d.id
            ? it
            : d.mode === 'move'
              ? { ...it, x: clamp(fx(d.ox + dx, r.width), -0.3, 1), y: clamp(fx(d.oy + dy, r.height), -0.2, 1) }
              : { ...it, w: clamp(fx(d.ow + dx, r.width), 0.04, 1.5) },
        ),
      )
    }
    const up = () => {
      drag.current = null
      blkDrag.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [snap])

  const onBlockDown = (id: string, e: React.PointerEvent) => {
    setSelBlk(id)
    setSel(null)
    const cur = elemLayout[id] || { dx: 0, dy: 0, s: 1 }
    blkDrag.current = { id, sx: e.clientX, sy: e.clientY, dx0: cur.dx, dy0: cur.dy }
  }
  const patchBlk = (patch: Partial<{ dx: number; dy: number; s: number; hidden: boolean }>) =>
    selBlk && setElemLayout((l) => ({ ...l, [selBlk]: { ...(l[selBlk] || { dx: 0, dy: 0, s: 1 }), ...patch } }))
  const restoreBlk = (id: string) =>
    setElemLayout((l) => ({ ...l, [id]: { ...(l[id] || { dx: 0, dy: 0, s: 1 }), hidden: false } }))
  const resetBlk = () => {
    if (!selBlk) return
    setElemLayout((l) => {
      const n = { ...l }
      delete n[selBlk]
      return n
    })
    setSelBlk(null)
  }
  const hiddenIds = Object.keys(elemLayout).filter((k) => elemLayout[k]?.hidden)

  const selItem = items.find((i) => i.id === sel) || null
  const updateSel = (patch: Partial<Item>) => setItems((l) => l.map((it) => (it.id === sel ? { ...it, ...patch } : it)))

  const addItem = (src: string) => {
    const it = { id: uid(), src, x: 0.34, y: 0.4, w: 0.32 }
    setItems((l) => [...l, it])
    setSel(it.id)
  }
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    files.forEach((f) => {
      const r = new FileReader()
      r.onload = () => {
        const url = String(r.result)
        setUploads((u) => {
          if (u.includes(url)) return u
          const nu = [url, ...u].slice(0, 80)
          try {
            localStorage.setItem(UPLOADS_KEY, JSON.stringify(nu))
          } catch {
            /* ignore */
          }
          void pushToCloud(UPLOADS_KEY, nu)
          return nu
        })
      }
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }
  const removeUpload = (url: string) =>
    setUploads((u) => {
      const nu = u.filter((x) => x !== url)
      try {
        localStorage.setItem(UPLOADS_KEY, JSON.stringify(nu))
      } catch {
        /* ignore */
      }
      void pushToCloud(UPLOADS_KEY, nu)
      return nu
    })
  const startDrag = (e: React.PointerEvent, id: string, mode: 'move' | 'resize') => {
    e.stopPropagation()
    const it = items.find((x) => x.id === id)
    if (!it) return
    setSel(id)
    drag.current = { id, mode, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, ow: it.w }
  }
  const del = (id: string) => {
    setItems((l) => l.filter((x) => x.id !== id))
    setSel(null)
  }
  const makeBg = (id: string) => {
    const it = items.find((x) => x.id === id)
    if (!it) return
    setBg(it.src)
    del(id)
  }
  const flash = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 1400)
  }
  const save = async () => {
    // Yüklenen görseller base64 (data:) olarak taşınıyor; tarayıcı deposunu (5MB) doldurup
    // kaydı imkânsız hâle getiriyor. Kaydederken bir kez Storage'a taşıyıp kısa URL'e çeviriyoruz.
    const conv = new Map<string, string>()
    const toUrl = async (dataUrl: string): Promise<string> => {
      const hit = conv.get(dataUrl)
      if (hit) return hit
      const blob = await (await fetch(dataUrl)).blob()
      const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'
      const path = `u/${uid()}${uid()}.${ext}`
      const { error } = await supabase.storage.from('assets').upload(path, blob, { upsert: true, contentType: blob.type || 'image/png' })
      if (error) throw error
      const url = supabase.storage.from('assets').getPublicUrl(path).data.publicUrl
      conv.set(dataUrl, url)
      return url
    }

    let nextItems = items
    let nextBg = bg
    let nextUploads = uploads
    const pending = items.filter((i) => i.src.startsWith('data:')).length
    if (pending) flash(`${pending} görsel buluta yükleniyor…`)
    try {
      nextItems = await Promise.all(items.map(async (it) => (it.src.startsWith('data:') ? { ...it, src: await toUrl(it.src) } : it)))
      if (nextBg?.startsWith('data:')) nextBg = await toUrl(nextBg)
      nextUploads = await Promise.all(uploads.map((u) => (u.startsWith('data:') ? toUrl(u) : Promise.resolve(u))))
    } catch {
      flash('Görseller yüklenemedi — internet?')
      return
    }
    setItems(nextItems)
    setBg(nextBg)
    setUploads(nextUploads)

    // ANA kayıt = bulut (tarayıcı deposundan bağımsız)
    const ok = await Promise.all([
      editComp ? pushToCloud(`quizo-layout-${screen}`, elemLayout) : Promise.resolve(true),
      pushToCloud(KEY(screen), { bg: nextBg, items: nextItems }),
      pushToCloud(UPLOADS_KEY, nextUploads),
    ])

    // Yerel kopya — dolu olsa bile kaydı bozmaz
    try {
      if (editComp) saveLayout(screen, elemLayout)
      localStorage.setItem(KEY(screen), JSON.stringify({ bg: nextBg, items: nextItems }))
      localStorage.setItem(UPLOADS_KEY, JSON.stringify(nextUploads))
    } catch {
      /* yerel depo dolu; bulut kaydı yeterli */
    }

    flash(ok.every(Boolean) ? 'Buluta kaydedildi ✓ (canlıda da görünür)' : 'BULUT KAYDI BAŞARISIZ ⚠')
  }
  const resetSeed = () => {
    if (editComp) {
      setElemLayout({})
      setSelBlk(null)
    }
    const d = seedData(screen)
    setItems(d.items)
    setBg(d.bg)
    setSel(null)
    flash('Varsayılana döndü')
  }
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ screen, bg, items }, null, 2))
      flash('JSON kopyalandı')
    } catch {
      flash('Kopyalanamadı')
    }
  }

  const btn: CSSProperties = { padding: '7px 11px', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.12)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.18)' }
  const numWrap: CSSProperties = { display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 9, padding: '3px 7px', color: '#9fd0ff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12 }
  const numInput: CSSProperties = { width: 42, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, textAlign: 'center', outline: 'none' }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0a0b16' }}>
      {/* Toolbar — aşağı açılan Türkçe menü + işlemler */}
      <div className="flex items-center gap-1.5 pt-safe" style={{ padding: '6px 8px', flexWrap: 'wrap', position: 'relative', zIndex: 40 }}>
        <button onClick={onExit} style={btn}>← Çık</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{ ...btn, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {SCREENS.find((s) => s.key === screen)?.label} ▾
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
              <div style={{ position: 'absolute', left: 0, top: 'calc(100% + 4px)', zIndex: 70, background: '#141830', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', minWidth: 172, boxShadow: '0 14px 34px rgba(0,0,0,0.55)' }}>
                {SCREENS.map((s) => (
                  <button key={s.key} onClick={() => { setScreen(s.key); setMenuOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: s.key === screen ? '#9fd0ff' : '#fff', background: s.key === screen ? 'rgba(124,58,237,0.28)' : 'transparent' }}>{s.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <button onClick={save} style={{ ...btn, background: 'linear-gradient(180deg,#34d399,#12946a)' }}>Kaydet</button>
        <button onClick={() => { setItems([]); setSel(null) }} style={btn}>Temizle</button>
        <button onClick={resetSeed} style={btn}>Sıfırla</button>
        <button onClick={copyJson} style={btn}>JSON</button>
        <button onClick={() => setShowGrid((g) => !g)} style={showGrid ? { ...btn, background: 'linear-gradient(180deg,#7c3aed,#3b82f6)' } : btn}>▦ Izgara</button>
        <button onClick={() => setSnap((s) => !s)} style={snap ? { ...btn, background: 'linear-gradient(180deg,#7c3aed,#3b82f6)' } : btn}>🧲 Yapış</button>
        <button onClick={() => setPalOpen((p) => !p)} style={btn}>{palOpen ? '▾ Paleti Gizle' : '▴ Palet'}</button>
      </div>

      {/* Canvas — gerçek telefon oranı (seçili-öğe barı yüzer, düzeni bozmaz) */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', padding: 8 }}>
        <div
          onPointerDown={() => { setSel(null); setSelBlk(null) }}
          style={{ position: 'relative', height: '100%', aspectRatio: '853 / 1844', maxWidth: '100%', overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.15)', background: '#0d1024' }}
        >
          {/* Düzenlenebilir gerçek sahne (Ana Sayfa hariç tüm ekranlar) */}
          {editComp && (
            <ScreenPreview screen={screen} me={ME} opponent={opponent} edit={{ editMode: true, layout: elemLayout, selectedId: selBlk, onBlockDown }} />
          )}

          {/* Background image (device-fill) */}
          {bg && <img src={asset(bg)} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />}

          {/* Stage — eklenen asset yerleşim düzlemi (board bloklarını engellemesin) */}
          <div
            ref={stageRef}
            style={
              seeded
                ? { position: 'absolute', left: 0, right: 0, top: '50%', width: '100%', aspectRatio: '1000 / 1520', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 20 }
                : { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }
            }
          >
            {items.map((it) => (
              <div
                key={it.id}
                onPointerDown={(e) => startDrag(e, it.id, 'move')}
                className={it.anim === 'orbit' ? 'qz-anim-orbit' : it.anim === 'seq4' ? 'qz-anim-seq4' : undefined}
                style={
                  {
                    position: 'absolute',
                    left: `${it.x * 100}%`,
                    top: `${it.y * 100}%`,
                    width: `${it.w * 100}%`,
                    cursor: 'move',
                    outline: sel === it.id ? '2px solid #38bdf8' : 'none',
                    touchAction: 'none',
                    pointerEvents: 'auto',
                    ['--qz-base-left' as string]: `${it.x * 100}%`,
                  } as CSSProperties
                }
              >
                <img src={asset(it.src)} alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }} />
                {sel === it.id && (
                  <div
                    onPointerDown={(e) => startDrag(e, it.id, 'resize')}
                    style={{ position: 'absolute', right: 2, bottom: 2, width: 26, height: 26, borderRadius: 8, background: '#38bdf8', borderWidth: 2, borderStyle: 'solid', borderColor: '#fff', cursor: 'nwse-resize', touchAction: 'none', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    ⤡
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hizalama ızgarası — kare kare + orta simetri çizgileri */}
          {showGrid && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 24 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(120,180,255,0.16) 0, rgba(120,180,255,0.16) 1px, transparent 1px, transparent ${CELL}px), repeating-linear-gradient(90deg, rgba(120,180,255,0.16) 0, rgba(120,180,255,0.16) 1px, transparent 1px, transparent ${CELL}px)`,
                }}
              />
              {/* Orta dikey (simetri) */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-0.5px)', background: 'rgba(255,90,110,0.55)' }} />
              {/* Orta yatay */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-0.5px)', background: 'rgba(255,90,110,0.35)' }} />
            </div>
          )}
        </div>

      </div>

      {/* Kontrol şeridi — tuvalin DIŞINDA, ekranın üstüne binmez */}
      <div style={{ padding: '0 8px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Seçili asset */}
        {selItem && (
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', padding: '6px 8px', borderRadius: 12, background: 'rgba(56,189,248,0.10)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(56,189,248,0.45)' }}>
            <div style={numWrap}>Gen<input type="number" style={numInput} value={Math.round(selItem.w * 100)} onChange={(e) => updateSel({ w: clamp((Number(e.target.value) || 0) / 100, 0.02, 1.5) })} /></div>
            <div style={numWrap}>X<input type="number" style={numInput} value={Math.round(selItem.x * 100)} onChange={(e) => updateSel({ x: (Number(e.target.value) || 0) / 100 })} /></div>
            <div style={numWrap}>Y<input type="number" style={numInput} value={Math.round(selItem.y * 100)} onChange={(e) => updateSel({ y: (Number(e.target.value) || 0) / 100 })} /></div>
            <button
              onClick={() => {
                const next = ANIM_CYCLE[(ANIM_CYCLE.indexOf(selItem.anim) + 1) % ANIM_CYCLE.length]
                updateSel({ anim: next })
              }}
              style={{ ...btn, flex: '0 0 auto', background: selItem.anim ? 'linear-gradient(180deg,#7c3aed,#3b82f6)' : btn.background }}
            >
              {selItem.anim ? ANIM_LABEL[selItem.anim] : 'Anim: Yok'}
            </button>
            <button onClick={() => makeBg(selItem.id)} style={{ ...btn, flex: '0 0 auto' }}>Arka Plan</button>
            <button onClick={() => del(selItem.id)} style={{ ...btn, flex: '0 0 auto', background: 'linear-gradient(180deg,#ff5b64,#d51e2f)' }}>Sil</button>
          </div>
        )}

        {/* Seçili parça (sahnenin kendi parçası) */}
        {editComp && selBlk && (
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', padding: '6px 8px', borderRadius: 12, background: 'rgba(56,189,248,0.10)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(56,189,248,0.45)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, color: '#9fd0ff', whiteSpace: 'nowrap' }}>{BLK_LABELS[selBlk] || selBlk}</span>
            <div style={numWrap}>
              <button onClick={() => patchBlk({ s: clamp((elemLayout[selBlk]?.s ?? 1) - 0.1, 0.3, 3) })} style={{ ...btn, padding: '2px 9px' }}>−</button>
              <span className="tnum" style={{ minWidth: 34, textAlign: 'center', color: '#fff' }}>{Math.round((elemLayout[selBlk]?.s ?? 1) * 100)}%</span>
              <button onClick={() => patchBlk({ s: clamp((elemLayout[selBlk]?.s ?? 1) + 0.1, 0.3, 3) })} style={{ ...btn, padding: '2px 9px' }}>+</button>
            </div>
            <button onClick={() => { patchBlk({ hidden: true }); setSelBlk(null) }} style={{ ...btn, flex: '0 0 auto', background: 'linear-gradient(180deg,#ff5b64,#d51e2f)' }}>Sil</button>
            <button onClick={resetBlk} style={{ ...btn, flex: '0 0 auto' }}>Sıfırla</button>
          </div>
        )}

        {/* Gizlenenler — geri getir */}
        {editComp && hiddenIds.length > 0 && (
          <div className="no-scrollbar flex items-center gap-1.5" style={{ overflowX: 'auto', padding: '5px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>Gizli:</span>
            {hiddenIds.map((id) => (
              <button key={id} onClick={() => restoreBlk(id)} style={{ ...btn, flex: '0 0 auto', padding: '5px 9px', fontSize: 11.5 }}>↩ {BLK_LABELS[id] || id}</button>
            ))}
          </div>
        )}
      </div>

      {/* Palette */}
      <div className="pb-safe" style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: palOpen ? undefined : 'none' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
          <label style={{ ...btn, background: 'linear-gradient(180deg,#7c3aed,#3b82f6)', cursor: 'pointer' }}>
            + Yükle
            <input type="file" accept="image/*" multiple onChange={onUpload} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Dokun → ekle · köşeden büyüt/küçült</span>
        </div>
        <div className="no-scrollbar flex gap-2" onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY }} style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {uploads.map((src) => (
            <div key={src} style={{ position: 'relative', flex: '0 0 auto' }}>
              <button onClick={() => addItem(src)} style={{ width: 54, height: 54, borderRadius: 10, background: 'rgba(124,58,237,0.14)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(139,92,246,0.5)', display: 'grid', placeItems: 'center', padding: 4 }}>
                <img src={asset(src)} alt="" draggable={false} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </button>
              <button onClick={() => removeUpload(src)} aria-label="Kaldır" style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, background: '#d51e2f', color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: '14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#fff' }}>×</button>
            </div>
          ))}
          {paletteFor(screen).map((src) => (
            <button key={src} onClick={() => addItem(src)} style={{ flex: '0 0 auto', width: 54, height: 54, borderRadius: 10, background: 'rgba(255,255,255,0.06)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', padding: 4 }}>
              <img src={asset(src)} alt="" draggable={false} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 16px', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
