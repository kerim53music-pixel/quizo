import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { QuizoLogo } from '../components/QuizoLogo'
import { IconGear, IconGlobe, IconUsers, IconTrophy, IconArrowLeft } from '../components/icons'
import { pickQuestions, type Question } from '../lib/questions'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type ElemLayout, type BlkProps, type BpFn } from '../lib/editable'
import type { Fighter } from '../lib/player'

const TOTAL = 10
const QTIME = 15
const LETTERS = ['A', 'B', 'C', 'D']
const ANS = [
  { g: 'linear-gradient(180deg,#4a95ff,#1f5fd6)', ring: '#123f96' },
  { g: 'linear-gradient(180deg,#ff5b78,#d51e46)', ring: '#8f1435' },
  { g: 'linear-gradient(180deg,#ffae43,#e0740a)', ring: '#a85606' },
  { g: 'linear-gradient(180deg,#49da67,#1f9e42)', ring: '#127033' },
]
const BOT_POOL = ['Eren', 'Maya', 'Alp', 'Berk', 'Deniz', 'Kaan', 'Efe', 'Ada']

type Player = { name: string; score: number; you: boolean }

function IconClock({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9 2h6" />
    </svg>
  )
}
function IconSkip({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a8 8 0 1 1-1 4" />
      <path d="M4 4v4h4" />
    </svg>
  )
}

function Pill({ children, blk }: { children: ReactNode; blk?: BlkProps }) {
  return (
    <div {...blk} className="board-panel flex items-center gap-1.5" style={{ borderRadius: 999, padding: '5px 12px', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, ...(blk?.style || {}) }}>
      {children}
    </div>
  )
}

function TimerRing({ left }: { left: number }) {
  const r = 30
  const circ = 2 * Math.PI * r
  const frac = Math.max(0, left) / QTIME
  const color = left > 7 ? '#3ee07f' : left > 3 ? '#ffcf5c' : '#ff5b64'
  return (
    <div style={{ position: 'relative', width: 74, height: 74, display: 'grid', placeItems: 'center' }}>
      <svg width={74} height={74} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={37} cy={37} r={r} stroke="rgba(0,0,0,0.35)" strokeWidth={7} fill="none" />
        <circle cx={37} cy={37} r={r} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="board-panel" style={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
        <span className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff' }}>{Math.max(0, left)}</span>
      </div>
    </div>
  )
}

function PowerUp({ icon, label, count, onUse, blk, editMode }: { icon: ReactNode; label: string; count: number; onUse: () => void; blk?: BlkProps; editMode?: boolean }) {
  const disabled = count <= 0
  return (
    <button onClick={editMode ? undefined : disabled ? undefined : onUse} disabled={editMode ? false : disabled} onPointerDown={blk?.onPointerDown} className="board-panel press flex items-center gap-2.5" style={{ borderRadius: 16, padding: '10px 12px', width: '100%', opacity: disabled ? 0.45 : 1, color: '#fff', ...(blk?.style || {}) } as CSSProperties}>
      <span className="grid place-items-center" style={{ width: 38, height: 38, minWidth: 38, borderRadius: 12, background: 'linear-gradient(150deg,#ffd05e,#f59e0b)', color: '#7a4a00', boxShadow: '0 4px 12px -4px rgba(245,158,11,0.7)' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13.5 }}>{label}</span>
      <span className="tnum grid place-items-center" style={{ minWidth: 24, height: 24, borderRadius: 8, background: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#ffd05e' }}>{count}</span>
    </button>
  )
}

function Standings({ players, bp, editMode }: { players: Player[]; bp: BpFn; editMode: boolean }) {
  const ranked = editMode ? players : [...players].sort((a, b) => b.score - a.score)
  return (
    <div className="no-scrollbar flex gap-2" style={{ overflowX: 'auto', flexShrink: 0 }}>
      {ranked.map((p, i) => {
        const first = i === 0
        const blk = bp(`player-${i}`, {
          flex: '1 1 0',
          minWidth: 0,
          borderRadius: 14,
          padding: '6px 8px',
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: first ? '#ffd05e' : p.you ? 'rgba(255,255,255,0.3)' : 'transparent',
          boxShadow: first ? '0 0 14px -4px rgba(245,158,11,0.7)' : 'none',
        })
        return (
          <div key={p.name} {...blk} className="board-panel flex items-center gap-2">
            <div style={{ position: 'relative' }}>
              <Avatar name={p.name} size={30} ring={false} />
              <span className="tnum grid place-items-center" style={{ position: 'absolute', top: -5, left: -5, width: 17, height: 17, borderRadius: 6, background: first ? 'linear-gradient(150deg,#ffd05e,#f59e0b)' : 'rgba(0,0,0,0.55)', color: first ? '#7a4a00' : '#cfd6f0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10 }}>{i + 1}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{p.name}{p.you ? ' •' : ''}</div>
              <div className="tnum" style={{ fontSize: 11, fontWeight: 700, color: '#ffd05e' }}>{formatNumber(p.score)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function initPlayers(roster: string[], meName: string): Player[] {
  let names = roster.length ? [...roster] : [meName]
  const pool = BOT_POOL.filter((b) => !names.includes(b))
  let pi = 0
  while (names.length < 4) names.push(pool[pi++] ?? `Bot${names.length}`)
  return names.slice(0, 8).map((name) => ({ name, score: 0, you: name === meName }))
}

export function QuizBoardScene({
  me,
  roster,
  onExit,
  editMode = false,
  layout: layoutProp,
  selectedId,
  onBlockDown,
}: {
  me: Fighter
  roster: string[]
  onExit: () => void
  editMode?: boolean
  layout?: ElemLayout
  selectedId?: string | null
  onBlockDown?: (id: string, e: React.PointerEvent) => void
}) {
  const [questions] = useState<Question[]>(() => pickQuestions(TOTAL))
  const [players, setPlayers] = useState<Player[]>(() => initPlayers(roster, me.name))
  const [qi, setQi] = useState(0)
  const [q, setQ] = useState<Question>(questions[0])
  const [left, setLeft] = useState(QTIME)
  const [phase, setPhase] = useState<'live' | 'reveal'>('live')
  const [myPick, setMyPick] = useState<number | null>(null)
  const [hidden, setHidden] = useState<number[]>([])
  const [pu, setPu] = useState({ time: 2, fifty: 2, skip: 1 })
  const [done, setDone] = useState(false)
  const [coins] = useState(200)
  const [confirmExit, setConfirmExit] = useState(false)
  // Oyunda kayıtlı yerleşimi oku; editörde prop'tan gelen canlı yerleşim
  const [savedLayout] = useState<ElemLayout>(() => (editMode ? {} : loadLayout('board')))
  const layout = editMode ? layoutProp : savedLayout
  const bp = makeBp(layout, editMode, selectedId, onBlockDown)

  const revealed = useRef(false)
  const myPickRef = useRef<number | null>(null)
  const qStart = useRef(0)
  const botPlan = useRef<({ choice: number; t: number } | null)[]>([])
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current.forEach((t) => clearInterval(t))
    timers.current = []
  }

  const wrongChoice = (cur: Question) => {
    const o = [0, 1, 2, 3].filter((i) => i !== cur.correct)
    return o[Math.floor(Math.random() * o.length)]
  }

  useEffect(() => {
    if (editMode) return // editörde sayaç/otomatik ilerleme donuk
    if (qi >= TOTAL) {
      setDone(true)
      return
    }
    const cur = questions[qi]
    revealed.current = false
    myPickRef.current = null
    qStart.current = performance.now()
    setQ(cur)
    setLeft(QTIME)
    setPhase('live')
    setMyPick(null)
    setHidden([])
    botPlan.current = players.map((p) =>
      p.you ? null : { choice: Math.random() < 0.6 ? cur.correct : wrongChoice(cur), t: 2 + Math.random() * 11 },
    )
    const iv = window.setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000)
    timers.current.push(iv)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi])

  useEffect(() => {
    if (editMode) return
    if (phase === 'live' && left === 0 && !revealed.current) doReveal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase])

  function doReveal() {
    if (revealed.current) return
    revealed.current = true
    clearTimers()
    setPhase('reveal')
    const cur = q
    const mySecs = Math.max(0, QTIME - (performance.now() - qStart.current) / 1000)
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (p.you) {
          if (myPickRef.current === cur.correct) return { ...p, score: p.score + 100 + Math.round(mySecs * 5) }
          return p
        }
        const plan = botPlan.current[idx]
        if (plan && plan.choice === cur.correct) return { ...p, score: p.score + 100 + Math.round(plan.t * 5) }
        return p
      }),
    )
    timers.current.push(window.setTimeout(() => setQi((i) => i + 1), 2300))
  }

  const pick = (i: number) => {
    if (phase !== 'live' || myPickRef.current !== null || hidden.includes(i)) return
    myPickRef.current = i
    setMyPick(i)
    clearTimers()
    timers.current.push(window.setTimeout(() => doReveal(), 1100))
  }

  const useTime = () => {
    if (pu.time <= 0 || phase !== 'live') return
    setPu((p) => ({ ...p, time: p.time - 1 }))
    setLeft((t) => Math.min(30, t + 10))
  }
  const useFifty = () => {
    if (pu.fifty <= 0 || phase !== 'live' || hidden.length) return
    const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct)
    const shuffled = wrongs.sort(() => Math.random() - 0.5).slice(0, 2)
    setHidden(shuffled)
    setPu((p) => ({ ...p, fifty: p.fifty - 1 }))
  }
  const useSkip = () => {
    if (pu.skip <= 0 || phase !== 'live') return
    setPu((p) => ({ ...p, skip: p.skip - 1 }))
    clearTimers()
    revealed.current = true
    setQi((i) => i + 1)
  }

  if (done) {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    const myRank = ranked.findIndex((p) => p.you) + 1
    return (
      <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-6 px-6">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: '#fff', textShadow: '0 0 26px rgba(245,158,11,0.7)' }}>
            {myRank === 1 ? '🏆 BİRİNCİ!' : `${myRank}. OLDUN`}
          </div>
          <div className="board-panel flex w-full flex-col gap-2" style={{ maxWidth: 340, borderRadius: 18, padding: 12 }}>
            {ranked.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5" style={{ padding: '6px 4px' }}>
                <span className="tnum" style={{ width: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: i === 0 ? '#ffd05e' : '#9aa3cf' }}>{i + 1}</span>
                <Avatar name={p.name} size={34} ring={p.you} />
                <div className="flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>{p.name}</div>
                <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#ffd05e' }}>{formatNumber(p.score)}</div>
              </div>
            ))}
          </div>
          <button onClick={onExit} className="btn-primary press" style={{ height: 54, width: '100%', maxWidth: 300, fontSize: 17, letterSpacing: '0.04em' }}>
            ANA MENÜ
          </button>
        </div>
      </motion.div>
    )
  }

  const answerState = (i: number): 'correct' | 'wrong' | 'normal' | 'hidden' => {
    if (hidden.includes(i)) return 'hidden'
    if (phase === 'reveal') {
      if (i === q.correct) return 'correct'
      if (myPick === i) return 'wrong'
      return 'normal'
    }
    return 'normal'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', padding: '10px 12px', gap: 10 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 pt-safe">
        <div className="flex items-center gap-2">
          <button {...bp('exit')} onClick={editMode ? undefined : () => setConfirmExit(true)} className="board-panel press grid place-items-center" style={{ width: 40, height: 40, borderRadius: 12, color: '#fff', ...bp('exit').style }} aria-label="Çık">
            <IconArrowLeft size={20} />
          </button>
          <div {...bp('logo')}><QuizoLogo width={92} /></div>
        </div>
        <div {...bp('timer')}><TimerRing left={left} /></div>
        <div className="flex items-center gap-1.5">
          <Pill blk={bp('qcount')}><IconTrophy size={15} /><span className="tnum">Soru {qi + 1}/{TOTAL}</span></Pill>
          <Pill blk={bp('coin')}><span style={{ color: '#ffd05e' }}>◉</span><span className="tnum">{coins}</span></Pill>
          <button {...bp('gear')} onClick={undefined} className="board-panel press grid place-items-center" style={{ width: 38, height: 38, borderRadius: 12, color: '#fff', ...bp('gear').style }} aria-label="Ayarlar"><IconGear size={18} /></button>
        </div>
      </div>

      {/* Standings strip (top, horizontal) */}
      <Standings players={players} bp={bp} editMode={editMode} />

      {/* Question + answers */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div {...bp('qcard')} style={{ borderRadius: 26, padding: 3, background: 'linear-gradient(135deg,#a855f7,#3b82f6,#22d3ee)', boxShadow: '0 0 30px -6px rgba(59,130,246,0.6)', ...bp('qcard').style }}>
            <div className="board-panel" style={{ borderRadius: 23, padding: '16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div {...bp('category')} className="flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: '5px 14px', color: '#7dd3fc', ...bp('category').style }}>
                <IconGlobe size={16} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff' }}>{q.category}</span>
              </div>
              <div {...bp('question')} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.25, color: '#fff', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.4)', ...bp('question').style }}>
                {q.q}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3" style={{ flexShrink: 0 }}>
            {q.options.map((opt, i) => {
              const st = answerState(i)
              const c = ANS[i]
              const ab = bp(`ans-${i}`)
              return (
                <button
                  key={i}
                  className="ans"
                  disabled={editMode ? false : phase !== 'live' || myPick !== null || st === 'hidden'}
                  onClick={editMode ? undefined : () => pick(i)}
                  onPointerDown={ab.onPointerDown}
                  style={
                    {
                      background: c.g,
                      visibility: st === 'hidden' && !editMode ? 'hidden' : 'visible',
                      outline: st === 'correct' ? '3px solid #43ff87' : undefined,
                      boxShadow:
                        st === 'correct'
                          ? '0 0 0 3px #43ff87, 0 0 26px rgba(67,255,135,0.8), 0 6px 0 rgba(0,0,0,0.3)'
                          : undefined,
                      opacity: phase === 'reveal' && st === 'normal' ? 0.5 : 1,
                      ...ab.style,
                    } as CSSProperties
                  }
                >
                  <span className="ans-sheen" />
                  <span className="ans-letter" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>{LETTERS[i]}</span>
                  <span style={{ position: 'relative' }}>{opt}</span>
                </button>
              )
            })}
          </div>
        </div>

      {/* Power-ups (bottom, horizontal row) */}
      <div className="flex gap-2" style={{ flexShrink: 0 }}>
        <div className="flex-1"><PowerUp icon={<IconClock size={20} />} label="+10 sn" count={pu.time} onUse={useTime} blk={bp('pu-time')} editMode={editMode} /></div>
        <div className="flex-1"><PowerUp icon={<IconUsers size={20} />} label="%50" count={pu.fifty} onUse={useFifty} blk={bp('pu-fifty')} editMode={editMode} /></div>
        <div className="flex-1"><PowerUp icon={<IconSkip size={20} />} label="Pas Geç" count={pu.skip} onUse={useSkip} blk={bp('pu-skip')} editMode={editMode} /></div>
      </div>

      {/* Chat bar */}
      <div {...bp('chat')} className="board-panel flex items-center gap-2 pb-safe" style={{ borderRadius: 16, padding: '8px 10px', ...bp('chat').style }}>
        <input placeholder="Mesaj yaz..." disabled={editMode} style={{ flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '9px 14px', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
        <div className="flex items-center gap-1.5">
          {['😂', '👏', '🔥', '👑'].map((e) => (
            <button key={e} className="grid place-items-center" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.28)', fontSize: 18 }}>{e}</button>
          ))}
        </div>
      </div>

      {confirmExit && !editMode && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'grid', placeItems: 'center', background: 'rgba(4,5,10,0.72)', backdropFilter: 'blur(4px)' }}>
          <div className="board-panel" style={{ borderRadius: 20, padding: '22px 20px', width: '86%', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>Oyundan çık?</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 600, marginTop: 6, marginBottom: 18 }}>Bu maçtaki puanların kaybolur.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmExit(false)} className="press" style={{ flex: 1, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.14)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>DEVAM ET</button>
              <button onClick={onExit} className="press" style={{ flex: 1, height: 50, borderRadius: 14, background: 'linear-gradient(180deg,#ff5b64,#d51e2f)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, boxShadow: '0 6px 0 #a5121c' }}>ÇIK</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
