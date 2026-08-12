import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { IconArrowLeft } from '../components/icons'

const EASE = [0.22, 1, 0.36, 1] as const

export function JoinRoomScene({ onBack, onJoin }: { onBack: () => void; onJoin: (code: string) => void }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const press = (d: string) => {
    if (code.length < 4) {
      setCode(code + d)
      setErr(false)
    }
  }
  const del = () => {
    setCode(code.slice(0, -1))
    setErr(false)
  }
  const submit = () => {
    if (code.length < 4) return
    if (code === '0000') {
      setErr(true)
      setAttempt((a) => a + 1)
      return
    }
    onJoin(`QZ-${code}`)
  }

  const digits = [0, 1, 2, 3].map((i) => (i < code.length ? code[i] : null))

  return (
    <motion.div className="stage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="relative z-[1] flex h-full flex-col">
        <header className="flex items-center gap-3 px-4 pt-safe" style={{ paddingBottom: 8 }}>
          <motion.button onClick={onBack} whileTap={{ scale: 0.9 }} aria-label="Geri" className="glass-soft grid place-items-center rounded-full" style={{ width: 40, height: 40, color: 'var(--color-ink-1)' }}>
            <IconArrowLeft size={20} />
          </motion.button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.04em' }}>ODAYA KATIL</h1>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-6">
          <div style={{ color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600, letterSpacing: '0.1em' }}>ODA KODUNU GİR</div>

          <motion.div
            key={attempt}
            animate={err ? { x: [0, -9, 9, -7, 7, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="glass flex items-center gap-2"
            style={{
              padding: '16px 20px',
              borderRadius: 18,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: err ? 'rgba(240,69,79,0.85)' : 'rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--color-ink-3)' }}>QZ</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--color-ink-3)' }}>—</span>
            {digits.map((d, i) => (
              <span
                key={i}
                className="tnum grid place-items-center"
                style={{
                  width: 40,
                  height: 52,
                  borderRadius: 10,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 30,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: d != null ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {d ?? ''}
              </span>
            ))}
          </motion.div>

          <AnimatePresence>
            {err && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: 'var(--color-wrong)', fontSize: 13.5, fontWeight: 700 }}>
                Oda bulunamadı.
              </motion.div>
            )}
          </AnimatePresence>

          {/* keypad */}
          <div className="grid grid-cols-3 gap-2.5" style={{ width: '100%', maxWidth: 280 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <motion.button key={d} onClick={() => press(d)} whileTap={{ scale: 0.94 }} className="glass tnum" style={{ height: 54, borderRadius: 14, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
                {d}
              </motion.button>
            ))}
            <div />
            <motion.button onClick={() => press('0')} whileTap={{ scale: 0.94 }} className="glass tnum" style={{ height: 54, borderRadius: 14, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
              0
            </motion.button>
            <motion.button onClick={del} whileTap={{ scale: 0.94 }} className="glass-soft" style={{ height: 54, borderRadius: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--color-ink-2)' }}>
              ⌫
            </motion.button>
          </div>
        </div>

        <div className="px-4 pb-safe" style={{ paddingTop: 8 }}>
          <motion.button
            onClick={submit}
            disabled={code.length < 4}
            whileTap={code.length === 4 ? { scale: 0.97 } : undefined}
            style={{
              height: 58,
              width: '100%',
              borderRadius: 16,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.05em',
              color: '#fff',
              background: code.length === 4 ? 'linear-gradient(120deg,#7c3aed,#3b82f6)' : 'rgba(255,255,255,0.05)',
              boxShadow: code.length === 4 ? '0 16px 40px -12px rgba(124,58,237,0.7)' : 'none',
              opacity: code.length === 4 ? 1 : 0.55,
            }}
          >
            KATIL
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
