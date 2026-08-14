import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { QuizoLogo } from '../components/QuizoLogo'
import { IconGear, IconGlobe, IconUsers, IconTrophy, IconArrowLeft } from '../components/icons'
import { pickQuestions, type Question } from '../lib/questions'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type ElemLayout, type BlkProps, type BpFn } from '../lib/editable'
import { ScreenExtras } from '../components/ScreenExtras'
import { asset } from '../lib/asset'
import type { Fighter } from '../lib/player'

const TOTAL = 10
const BUZZ_TIME = 12 // buzzer'a basmak için süre
const ANSWER_TIME = 7 // buzzer'a bastıktan sonra cevap süresi
const LETTERS = ['A', 'B', 'C', 'D']
const ANS = [
  { g: 'linear-gradient(180deg,#4a95ff,#1f5fd6)', c: '#4a95ff' },
  { g: 'linear-gradient(180deg,#ff5b78,#d51e46)', c: '#ff5b78' },
  { g: 'linear-gradient(180deg,#ffae43,#e0740a)', c: '#ffae43' },
  { g: 'linear-gradient(180deg,#49da67,#1f9e42)', c: '#49da67' },
]
const BOT_POOL = ['Eren', 'Maya', 'Alp', 'Berk', 'Deniz', 'Kaan', 'Efe', 'Ada']

type Player = { name: string; score: number; you: boolean }
type Phase = 'buzz' | 'answer' | 'reveal'

function IconClock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9 2h6" />
    </svg>
  )
}
function IconSkip({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a8 8 0 1 1-1 4" />
      <path d="M4 4v4h4" />
    </svg>
  )
}

function Pill({ children, blk }: { children: ReactNode; blk?: BlkProps }) {
  return (
    <div {...blk} className="board-panel flex items-center gap-1.5" style={{ borderRadius: 999, padding: '5px 11px', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, ...(blk?.style || {}) }}>
      {children}
    </div>
  )
}

function TimerRing({ left, total, danger }: { left: number; total: number; danger: boolean }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const frac = Math.max(0, left) / total
  const color = danger ? '#ff5b64' : left / total > 0.45 ? '#3ee07f' : '#ffcf5c'
  return (
    <div style={{ position: 'relative', width: 68, height: 68, display: 'grid', placeItems: 'center' }}>
      <svg width={68} height={68} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={34} cy={34} r={r} stroke="rgba(0,0,0,0.45)" strokeWidth={7} fill="none" />
        <circle cx={34} cy={34} r={r} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="board-panel" style={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
        <span className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff' }}>{Math.max(0, left)}</span>
      </div>
    </div>
  )
}

function PowerUp({ icon, label, count, onUse, blk, disabled }: { icon: ReactNode; label: string; count: number; onUse: () => void; blk?: BlkProps; disabled?: boolean }) {
  const off = count <= 0 || disabled
  return (
    <button onClick={off ? undefined : onUse} onPointerDown={blk?.onPointerDown} className="board-panel press flex items-center gap-2" style={{ borderRadius: 14, padding: '9px 10px', width: '100%', opacity: off ? 0.4 : 1, color: '#fff', ...(blk?.style || {}) } as CSSProperties}>
      <span className="grid place-items-center" style={{ width: 32, height: 32, minWidth: 32, borderRadius: 10, background: 'linear-gradient(150deg,#ffd05e,#f59e0b)', color: '#7a4a00', boxShadow: '0 4px 12px -4px rgba(245,158,11,0.8), inset 0 2px 0 rgba(255,255,255,0.5)' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12 }}>{label}</span>
      <span className="tnum grid place-items-center" style={{ minWidth: 22, height: 22, borderRadius: 7, background: 'rgba(0,0,0,0.4)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#ffd05e' }}>{count}</span>
    </button>
  )
}

function Standings({ players, bp, editMode, buzzed }: { players: Player[]; bp: BpFn; editMode: boolean; buzzed: string | null }) {
  const ranked = editMode ? players : [...players].sort((a, b) => b.score - a.score)
  return (
    <div className="flex gap-1.5" style={{ flexShrink: 0 }}>
      {ranked.map((p, i) => {
        const first = i === 0
        const isBuzz = buzzed === p.name
        const blk = bp(`player-${i}`, {
          flex: '1 1 0',
          minWidth: 0,
          borderRadius: 13,
          padding: '5px 6px',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: isBuzz ? '#43ff87' : first ? '#ffd05e' : p.you ? 'rgba(255,255,255,0.35)' : 'transparent',
          boxShadow: isBuzz ? '0 0 18px -2px rgba(67,255,135,0.9)' : first ? '0 0 14px -4px rgba(245,158,11,0.8)' : 'none',
        })
        return (
          <div key={p.name} {...blk} className="board-panel flex items-center gap-1.5">
            <div style={{ position: 'relative' }}>
              <Avatar name={p.name} size={26} ring={false} />
              <span className="tnum grid place-items-center" style={{ position: 'absolute', top: -4, left: -4, width: 15, height: 15, borderRadius: 5, background: first ? 'linear-gradient(150deg,#ffd05e,#f59e0b)' : 'rgba(0,0,0,0.6)', color: first ? '#7a4a00' : '#cfd6f0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 9 }}>{i + 1}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{p.name}{p.you ? ' •' : ''}</div>
              <div className="tnum" style={{ fontSize: 10.5, fontWeight: 800, color: '#ffd05e' }}>{formatNumber(p.score)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function initPlayers(roster: string[], meName: string): Player[] {
  const names = roster.length ? [...roster] : [meName]
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
  const [left, setLeft] = useState(BUZZ_TIME)
  const [phase, setPhase] = useState<Phase>('buzz')
  const [buzzed, setBuzzed] = useState<string | null>(null)
  const [myPick, setMyPick] = useState<number | null>(null)
  const [hidden, setHidden] = useState<number[]>([])
  const [pu, setPu] = useState({ time: 2, fifty: 2, skip: 1 })
  const [done, setDone] = useState(false)
  const [coins] = useState(200)
  const [confirmExit, setConfirmExit] = useState(false)
  const [gain, setGain] = useState<{ n: number; k: number } | null>(null)
  const [streak, setStreak] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [savedLayout] = useState<ElemLayout>(() => (editMode ? {} : loadLayout('board')))
  const layout = editMode ? layoutProp : savedLayout
  const bp = makeBp(layout, editMode, selectedId, onBlockDown)

  const revealed = useRef(false)
  const buzzRef = useRef<string | null>(null)
  const buzzAt = useRef(0)
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t) })
    timers.current = []
  }

  // Soru döngüsü: buzzer fazı → bot veya sen basarsın
  useEffect(() => {
    if (editMode) return
    if (qi >= TOTAL) { setDone(true); return }
    const cur = questions[qi]
    revealed.current = false
    buzzRef.current = null
    setQ(cur)
    setLeft(BUZZ_TIME)
    setPhase('buzz')
    setBuzzed(null)
    setMyPick(null)
    setHidden([])

    // botların buzzer'a basma zamanları
    const bots = players.filter((p) => !p.you)
    bots.forEach((b) => {
      const delay = (2.5 + Math.random() * 8) * 1000
      timers.current.push(
        window.setTimeout(() => {
          if (buzzRef.current) return
          buzzRef.current = b.name
          setBuzzed(b.name)
          const ok = Math.random() < 0.55
          const botScore = ok ? 100 + Math.round(Math.random() * 40) : 0
          setPlayers((prev) => prev.map((p) => (p.name === b.name && ok ? { ...p, score: p.score + botScore } : p)))
          setPhase('reveal')
          timers.current.push(window.setTimeout(() => setQi((i) => i + 1), 2100))
        }, delay),
      )
    })

    const iv = window.setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000)
    timers.current.push(iv)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi])

  // Süre bitti
  useEffect(() => {
    if (editMode || left !== 0 || revealed.current) return
    if (phase === 'buzz') { revealed.current = true; clearTimers(); setPhase('reveal'); timers.current.push(window.setTimeout(() => setQi((i) => i + 1), 1800)) }
    else if (phase === 'answer') doReveal(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase])

  // Buzzer'a bas → cevap hakkı
  const buzz = () => {
    if (phase !== 'buzz' || buzzRef.current) return
    buzzRef.current = me.name
    setBuzzed(me.name)
    buzzAt.current = performance.now()
    clearTimers()
    setPhase('answer')
    setLeft(ANSWER_TIME)
    const iv = window.setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000)
    timers.current.push(iv)
  }

  function doReveal(pick: number | null) {
    if (revealed.current) return
    revealed.current = true
    clearTimers()
    setPhase('reveal')
    const hit = pick === q.correct
    const speed = Math.max(0, ANSWER_TIME - (performance.now() - buzzAt.current) / 1000)
    const pts = hit ? 150 + Math.round(speed * 10) + streak * 25 : 0
    if (hit) { setStreak((s) => s + 1); setGain({ n: pts, k: Date.now() }); setPlayers((prev) => prev.map((p) => (p.you ? { ...p, score: p.score + pts } : p))) }
    else { setStreak(0); setWrong((w) => w + 1) }
    timers.current.push(window.setTimeout(() => setQi((i) => i + 1), 2200))
  }

  const pick = (i: number) => {
    if (phase !== 'answer' || myPick !== null || hidden.includes(i)) return
    setMyPick(i)
    timers.current.push(window.setTimeout(() => doReveal(i), 700))
  }

  const useTime = () => { if (pu.time <= 0 || phase === 'reveal') return; setPu((p) => ({ ...p, time: p.time - 1 })); setLeft((t) => t + 10) }
  const useFifty = () => {
    if (pu.fifty <= 0 || phase !== 'answer' || hidden.length) return
    const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct).sort(() => Math.random() - 0.5).slice(0, 2)
    setHidden(wrongs); setPu((p) => ({ ...p, fifty: p.fifty - 1 }))
  }
  const useSkip = () => { if (pu.skip <= 0 || phase === 'reveal') return; setPu((p) => ({ ...p, skip: p.skip - 1 })); revealed.current = true; clearTimers(); setQi((i) => i + 1) }

  if (done) {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    const myRank = ranked.findIndex((p) => p.you) + 1
    return (
      <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <img src={asset('/board/b17.png')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-6 px-6">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: '#fff', textShadow: '0 0 30px rgba(245,158,11,0.9)' }}>
            {myRank === 1 ? '🏆 BİRİNCİ!' : `${myRank}. OLDUN`}
          </div>
          <div className="board-panel flex w-full flex-col gap-2" style={{ maxWidth: 340, padding: 14 }}>
            {ranked.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5" style={{ padding: '6px 4px' }}>
                <span className="tnum" style={{ width: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: i === 0 ? '#ffd05e' : '#9aa3cf' }}>{i + 1}</span>
                <Avatar name={p.name} size={34} ring={p.you} />
                <div className="flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>{p.name}</div>
                <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#ffd05e' }}>{formatNumber(p.score)}</div>
              </div>
            ))}
          </div>
          <button onClick={onExit} className="btn-primary press" style={{ height: 54, width: '100%', maxWidth: 300, fontSize: 17 }}>ANA MENÜ</button>
        </div>
      </motion.div>
    )
  }

  const canAnswer = phase === 'answer' || editMode
  const answerState = (i: number): 'correct' | 'wrong' | 'normal' | 'hidden' => {
    if (hidden.includes(i)) return 'hidden'
    if (phase === 'reveal') { if (i === q.correct) return 'correct'; if (myPick === i) return 'wrong' }
    return 'normal'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
      {/* ARENA arka planı */}
      <img src={asset('/board/b17.png')} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,6,16,0.55) 0%, rgba(4,6,16,0.15) 38%, rgba(4,6,16,0.7) 100%)', pointerEvents: 'none' }} />

      <div className="relative flex h-full flex-col" style={{ zIndex: 3, padding: '8px 10px', gap: 8 }}>
        {/* Üst bar */}
        <div className="flex items-center justify-between gap-2 pt-safe">
          <div className="flex items-center gap-2">
            <button {...bp('exit')} onClick={editMode ? undefined : () => setConfirmExit(true)} className="board-panel press grid place-items-center" style={{ width: 38, height: 38, borderRadius: 12, color: '#fff', ...bp('exit').style }} aria-label="Çık">
              <IconArrowLeft size={19} />
            </button>
            <div {...bp('logo')}><QuizoLogo width={84} /></div>
          </div>
          <div {...bp('timer')}><TimerRing left={left} total={phase === 'answer' ? ANSWER_TIME : BUZZ_TIME} danger={phase === 'answer'} /></div>
          <div className="flex items-center gap-1.5">
            <Pill blk={bp('qcount')}><IconTrophy size={14} /><span className="tnum">{qi + 1}/{TOTAL}</span></Pill>
            <Pill blk={bp('coin')}><span style={{ color: '#ffd05e' }}>◉</span><span className="tnum">{coins}</span></Pill>
            <button {...bp('gear')} className="board-panel press grid place-items-center" style={{ width: 36, height: 36, borderRadius: 12, color: '#fff', ...bp('gear').style }} aria-label="Ayarlar"><IconGear size={17} /></button>
          </div>
        </div>

        {/* Oyuncular */}
        <Standings players={players} bp={bp} editMode={editMode} buzzed={buzzed} />

        {/* Soru + buzzer/şıklar — boş alan bırakmadan yayılır */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 8 }}>
          <div {...bp('qcard')} key={`q-${wrong}`} className={wrong > 0 ? 'qz-shake' : undefined} style={{ borderRadius: 24, padding: 3, background: 'linear-gradient(135deg,#a855f7,#3b82f6,#22d3ee)', boxShadow: '0 0 40px -8px rgba(59,130,246,0.85)', ...bp('qcard').style }}>
            <div className="board-panel" style={{ borderRadius: 21, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div {...bp('category')} className="flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: '4px 13px', color: '#7dd3fc', ...bp('category').style }}>
                <IconGlobe size={15} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, color: '#fff' }}>{q.category}</span>
              </div>
              <div {...bp('question')} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, lineHeight: 1.25, color: '#fff', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.6)', ...bp('question').style }}>{q.q}</div>
            </div>
          </div>

          {/* BUZZER — cevap hakkı için bas */}
          {(phase === 'buzz' || editMode) && (
            <div className="grid place-items-center" {...bp('buzzer')} style={{ ...bp('buzzer').style }}>
              <button
                onClick={editMode ? undefined : buzz}
                className="press"
                style={{
                  width: 132,
                  height: 132,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 30%, #ff8a95 0%, #ef2b3d 42%, #a10f1d 100%)',
                  border: '5px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 12px 0 #7c0a15, 0 26px 40px -12px rgba(239,43,61,0.85), inset 0 6px 14px rgba(255,255,255,0.45), inset 0 -12px 22px rgba(0,0,0,0.4)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 21,
                  color: '#fff',
                  letterSpacing: '0.04em',
                  textShadow: '0 3px 8px rgba(0,0,0,0.6)',
                  animation: 'logo-breath 2.2s ease-in-out infinite',
                }}
              >
                BAS!
              </button>
              <span style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11.5, letterSpacing: '0.1em', color: '#ffd05e', textShadow: '0 0 12px rgba(245,158,11,0.9)' }}>
                {buzzed ? `${buzzed} BASTI!` : 'İLK BASAN CEVAPLAR'}
              </span>
            </div>
          )}

          {/* Şıklar — sadece buzzer'a bastıktan sonra aktif */}
          {(phase !== 'buzz' || editMode) && (
            <div className="grid grid-cols-2 gap-2.5" style={{ flexShrink: 0 }}>
              {q.options.map((opt, i) => {
                const st = answerState(i)
                const c = ANS[i]
                const ab = bp(`ans-${i}`)
                return (
                  <button
                    key={i}
                    className="ans"
                    disabled={!canAnswer || myPick !== null || st === 'hidden'}
                    onClick={editMode ? undefined : () => pick(i)}
                    onPointerDown={ab.onPointerDown}
                    style={{
                      background: c.g,
                      color: c.c,
                      visibility: st === 'hidden' && !editMode ? 'hidden' : 'visible',
                      outline: st === 'correct' ? '3px solid #43ff87' : undefined,
                      boxShadow: st === 'correct' ? '0 0 0 3px #43ff87, 0 0 30px rgba(67,255,135,0.9), 0 7px 0 rgba(0,0,0,0.38)' : undefined,
                      opacity: phase === 'reveal' && st === 'normal' ? 0.45 : 1,
                      fontSize: 15,
                      ...ab.style,
                    } as CSSProperties}
                  >
                    <span className="ans-sheen" />
                    <span className="ans-letter" style={{ borderColor: 'rgba(255,255,255,0.65)', color: '#fff', width: 32, height: 32, minWidth: 32, fontSize: 15 }}>{LETTERS[i]}</span>
                    <span style={{ position: 'relative', color: '#fff' }}>{opt}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Jokerler */}
        <div className="flex gap-2" style={{ flexShrink: 0 }}>
          <div className="flex-1"><PowerUp icon={<IconClock />} label="+10 sn" count={pu.time} onUse={useTime} blk={bp('pu-time')} disabled={editMode} /></div>
          <div className="flex-1"><PowerUp icon={<IconUsers size={18} />} label="%50" count={pu.fifty} onUse={useFifty} blk={bp('pu-fifty')} disabled={editMode || phase !== 'answer'} /></div>
          <div className="flex-1"><PowerUp icon={<IconSkip />} label="Pas" count={pu.skip} onUse={useSkip} blk={bp('pu-skip')} disabled={editMode} /></div>
        </div>

        {/* Sohbet */}
        <div {...bp('chat')} className="board-panel flex items-center gap-2 pb-safe" style={{ borderRadius: 14, padding: '7px 9px', ...bp('chat').style }}>
          <input placeholder="Mesaj yaz..." disabled={editMode} style={{ flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '8px 13px', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13.5, outline: 'none' }} />
          <div className="flex items-center gap-1.5">
            {['😂', '👏', '🔥', '👑'].map((e) => (
              <button key={e} className="grid place-items-center" style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,0,0,0.35)', fontSize: 16 }}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Uçan puan + seri */}
      {gain && (
        <div key={gain.k} className="qz-score-fly tnum" style={{ position: 'absolute', left: '50%', top: '44%', zIndex: 30, pointerEvents: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: '#43ff87', textShadow: '0 0 20px rgba(67,255,135,0.95), 0 3px 6px rgba(0,0,0,0.7)' }}>
          +{gain.n}
        </div>
      )}
      {streak >= 2 && (
        <div style={{ position: 'absolute', left: '50%', top: '1.5%', transform: 'translateX(-50%)', zIndex: 25, pointerEvents: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, letterSpacing: '0.06em', color: '#ffd05e', background: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: '3px 12px', textShadow: '0 0 12px rgba(245,158,11,0.9)' }}>
          🔥 {streak} SERİ
        </div>
      )}

      {!editMode && <ScreenExtras screen="board" />}

      {confirmExit && !editMode && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'grid', placeItems: 'center', background: 'rgba(4,5,10,0.75)', backdropFilter: 'blur(4px)' }}>
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
