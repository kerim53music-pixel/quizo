import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { asset } from '../lib/asset'
import type { Fighter } from '../lib/player'

const BASE_W = 1000
const BASE_H = 1520
const A = '/home/'

type Item = { src: string; x: number; y: number; w: number; key?: string }
type Saved = { bg: string | null; items: { src: string; x: number; y: number; w: number }[] }

const IMAGES: Item[] = [
  { src: 'gorev', x: 16, y: 430, w: 152 },
  { src: 'odul', x: 16, y: 686, w: 152 },
  { src: 'liderlik', x: 16, y: 940, w: 152 },
  { src: 'vip', x: 832, y: 430, w: 152 },
  { src: 'magaza', x: 832, y: 686, w: 152 },
  { src: 'carki', x: 832, y: 940, w: 152 },
  { src: 'mascot', x: 16, y: 1172, w: 158 },
  { src: 'trophy', x: 852, y: 1160, w: 132 },
]

const BUTTONS: Item[] = [
  { src: 'b-hizli', x: 280, y: 556, w: 440, key: 'quick' },
  { src: 'b-kesfet', x: 280, y: 674, w: 440, key: 'discover' },
  { src: 'b-odaya', x: 280, y: 792, w: 440, key: 'join' },
  { src: 'b-oda', x: 280, y: 910, w: 440, key: 'create' },
  { src: 'b-kariyer', x: 280, y: 1028, w: 440, key: 'career' },
]

// Editörde kaydedilen yerleşim (varsa oyunda onu göster)
const KEY_BY_SRC: Record<string, string> = { 'b-hizli': 'quick', 'b-kesfet': 'discover', 'b-odaya': 'join', 'b-oda': 'create', 'b-kariyer': 'career' }
const baseName = (src: string) => (src.split('/').pop() || '').replace(/\.[a-z]+$/i, '')

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem('quizo-screen-home')
    if (!raw) return null
    const d = JSON.parse(raw) as Saved
    if (!d || !Array.isArray(d.items) || d.items.length === 0) return null
    return d
  } catch {
    return null
  }
}

function Img({ src, x, y, w }: Item) {
  return <img src={asset(`${A}${src}.png`)} alt="" draggable={false} style={{ position: 'absolute', left: x, top: y, width: w, height: 'auto', pointerEvents: 'none' }} />
}

export function HomeScene({ me, onSelect }: { me: Fighter; onSelect?: (key: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const [saved] = useState<Saved | null>(loadSaved)

  useEffect(() => {
    const calc = () => {
      const el = rootRef.current
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      setScale(Math.min(w / BASE_W, h / BASE_H))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {/* Background */}
      <img src={saved?.bg || '/home-bg.png'} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Scaled base canvas */}
      <div
        style={{ position: 'absolute', left: '50%', top: '50%', width: BASE_W, height: BASE_H, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: 'center' } as CSSProperties}
      >
        {saved ? (
          /* ——— Editörde kaydedilen yerleşim ——— */
          saved.items.map((it, i) => {
            const key = KEY_BY_SRC[baseName(it.src)]
            const x = it.x * BASE_W
            const y = it.y * BASE_H
            const w = it.w * BASE_W
            if (key) {
              return (
                <motion.button
                  key={`${it.src}-${i}`}
                  onClick={() => onSelect?.(key)}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.03, type: 'spring', stiffness: 320, damping: 18 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92, y: 7 }}
                  style={{ position: 'absolute', left: x, top: y, width: w, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <img src={asset(it.src)} alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))' }} />
                </motion.button>
              )
            }
            return <img key={`${it.src}-${i}`} src={asset(it.src)} alt="" draggable={false} style={{ position: 'absolute', left: x, top: y, width: w, height: 'auto', pointerEvents: 'none' }} />
          })
        ) : (
          /* ——— Varsayılan yerleşim ——— */
          <>
            {/* Top bar frames */}
            <Img src="profile" x={14} y={26} w={420} />
            <Img src="coin" x={470} y={48} w={196} />
            <Img src="life" x={690} y={52} w={150} />
            <Img src="gear" x={905} y={48} w={64} />
            {/* Logo */}
            <Img src="logo" x={288} y={120} w={424} />
            {/* Side panels + mascot + trophy */}
            {IMAGES.map((it) => (
              <Img key={it.src} {...it} />
            ))}
            {/* Menu buttons */}
            {BUTTONS.map((b, i) => (
              <motion.button
                key={b.src}
                onClick={() => onSelect?.(b.key!)}
                initial={{ opacity: 0, scale: 0.7, x: 80 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.09, type: 'spring', stiffness: 320, damping: 18 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92, y: 7 }}
                style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.6 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                >
                  <img src={asset(`${A}${b.src}.png`)} alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))' }} />
                </motion.div>
              </motion.button>
            ))}
            {/* Bottom nav */}
            <Img src="nav" x={52} y={1370} w={896} />
          </>
        )}

        {/* Profile overlays (yazılar — her zaman) */}
        <div style={{ position: 'absolute', left: 34, top: 42, width: 84, height: 84, borderRadius: '50%', overflow: 'hidden' }}>
          <Avatar name={me.name} size={84} ring={false} />
        </div>
        <div style={{ position: 'absolute', left: 150, top: 40, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{me.name}</div>
        <div className="tnum" style={{ position: 'absolute', left: 168, top: 96, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff' }}>15</div>
        <div className="tnum" style={{ position: 'absolute', left: 235, top: 96, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#fff' }}>2450/3000</div>
        <div className="tnum" style={{ position: 'absolute', left: 505, top: 62, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff', textShadow: '0 2px 3px rgba(0,0,0,0.5)' }}>20.350</div>
        <div className="tnum" style={{ position: 'absolute', left: 748, top: 64, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#fff', textShadow: '0 2px 3px rgba(0,0,0,0.5)' }}>5</div>
      </div>
    </motion.div>
  )
}
