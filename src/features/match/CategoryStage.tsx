import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Buzzer } from './Buzzer'
import { QuestionCard, OptionList, OutcomeBanner, type Side, type OptState, type Outcome } from './QuestionUI'
import { QUESTIONS, type Question } from '../../lib/questions'
import type { Fighter } from '../../lib/player'

const YOU_C = '#f0454f'
const FOE_C = '#3d7bff'
const CATS = ['Tarih', 'Coğrafya', 'Spor', 'Sinema', 'Müzik', 'Bilim']
const DIFFS: { label: string; value: number; a: string; b: string }[] = [
  { label: 'KOLAY', value: 100, a: '#38d9a3', b: '#12946a' },
  { label: 'ORTA', value: 200, a: '#f2ce6b', b: '#b8862a' },
  { label: 'ZOR', value: 300, a: '#f0454f', b: '#b31e2a' },
]

/** Etap 2 — Kategori: pick a category + difficulty, then a buzzer race for that value. */
export function CategoryStage({
  rounds,
  opponent,
  onScore,
  onDone,
}: {
  rounds: number
  opponent: Fighter
  onScore: (side: Side, delta: number) => void
  onDone: () => void
}) {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'pick' | 'diff' | 'live' | 'answer' | 'steal' | 'reveal'>('pick')
  const [cat, setCat] = useState<string | null>(null)
  const [value, setValue] = useState(100)
  const [q, setQ] = useState<Question | null>(null)
  const [buzzer, setBuzzer] = useState<Side | null>(null)
  const [reaction, setReaction] = useState<number | null>(null)
  const [turn, setTurn] = useState<Side | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const used = useRef<Set<string>>(new Set())
  const lock = useRef(false)
  const t0 = useRef(0)
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => clearTimers, [])

  function pickQ(category: string): Question {
    let pool = QUESTIONS.filter((x) => x.category === category && !used.current.has(x.q))
    if (!pool.length) pool = QUESTIONS.filter((x) => !used.current.has(x.q))
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    used.current.add(chosen.q)
    return chosen
  }

  function chooseCat(c: string) {
    setCat(c)
    setPhase('diff')
  }

  function chooseDiff(v: number) {
    if (!cat) return
    const question = pickQ(cat)
    setValue(v)
    setQ(question)
    setPicked(null)
    setBuzzer(null)
    setReaction(null)
    setTurn(null)
    setOutcome(null)
    lock.current = false
    setPhase('live')
    t0.current = performance.now()
    const botDelay = 1100 + Math.random() * 2500
    later(() => {
      if (!lock.current) doBuzz('foe', botDelay / 1000, question, v)
    }, botDelay)
  }

  function advance() {
    clearTimers()
    later(() => {
      if (round + 1 >= rounds) onDone()
      else {
        setRound((r) => r + 1)
        setCat(null)
        setQ(null)
        setPhase('pick')
      }
    }, 1700)
  }

  function wrongChoice(cur: Question) {
    const opts = [0, 1, 2, 3].filter((i) => i !== cur.correct)
    return opts[Math.floor(Math.random() * opts.length)]
  }
  function doBuzz(side: Side, reactionSec: number, cur: Question, v: number) {
    if (lock.current) return
    lock.current = true
    clearTimers()
    setBuzzer(side)
    setReaction(reactionSec)
    setTurn(side)
    setPhase('answer')
    if (side === 'foe') later(() => botAnswer(cur, v), 850)
    else later(() => resolve(wrongChoiceOrTimeout(cur), 'you', v, cur, true), 8000)
  }
  function wrongChoiceOrTimeout(cur: Question) {
    return wrongChoice(cur)
  }
  const onBuzz = () => {
    if (phase !== 'live' || lock.current || !q) return
    doBuzz('you', (performance.now() - t0.current) / 1000, q, value)
  }
  function botAnswer(cur: Question, v: number) {
    const good = Math.random() < 0.62
    resolve(good ? cur.correct : wrongChoice(cur), 'foe', v, cur, false)
  }
  function resolve(choice: number, side: Side, v: number, cur: Question, timeout: boolean) {
    clearTimers()
    setPicked(choice)
    if (!timeout && choice === cur.correct) {
      onScore(side, v)
      setOutcome({ label: 'DOĞRU', delta: v, good: true })
      setPhase('reveal')
      advance()
    } else {
      onScore(side, -Math.round(v / 2))
      setOutcome({ label: timeout ? 'SÜRE DOLDU' : 'YANLIŞ', delta: -Math.round(v / 2), good: false })
      startSteal(side === 'you' ? 'foe' : 'you', cur, v)
    }
  }
  function startSteal(side: Side, cur: Question, v: number) {
    clearTimers()
    setTurn(side)
    setPicked(null)
    setPhase('steal')
    if (side === 'foe') later(() => botSteal(cur, v), 950)
    else later(() => resolveSteal(null, 'you', v, cur), 4500)
  }
  function botSteal(cur: Question, v: number) {
    if (Math.random() < 0.4) return resolveSteal(null, 'foe', v, cur)
    const good = Math.random() < 0.6
    resolveSteal(good ? cur.correct : wrongChoice(cur), 'foe', v, cur)
  }
  function resolveSteal(choice: number | null, side: Side, v: number, cur: Question) {
    clearTimers()
    if (choice === null) {
      setOutcome({ label: 'PAS', delta: 0, good: false })
      setPhase('reveal')
      return advance()
    }
    setPicked(choice)
    const gain = Math.round(v * 0.5)
    const loss = Math.round(v * 0.25)
    if (choice === cur.correct) {
      onScore(side, gain)
      setOutcome({ label: 'ÇALMA BAŞARILI', delta: gain, good: true })
    } else {
      onScore(side, -loss)
      setOutcome({ label: 'ÇALMA BAŞARISIZ', delta: -loss, good: false })
    }
    setPhase('reveal')
    advance()
  }

  const myTurn = (phase === 'answer' && turn === 'you') || (phase === 'steal' && turn === 'you')
  const onPick = (i: number) => {
    if (!q) return
    if (phase === 'answer' && turn === 'you') resolve(i, 'you', value, q, false)
    else if (phase === 'steal' && turn === 'you') resolveSteal(i, 'you', value, q)
  }
  const stateOf = (i: number): OptState => {
    if (!q) return 'idle'
    if (phase === 'reveal') return i === q.correct ? 'correct' : picked === i ? 'wrong' : 'idle'
    return myTurn ? 'active' : 'idle'
  }

  // ---- Pick screens ----
  if (phase === 'pick' || phase === 'diff') {
    return (
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto px-5 py-4">
        <div className="text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '0.06em', color: 'var(--color-ink-1)' }}>
          {phase === 'pick' ? 'KATEGORİ SEÇ' : 'ZORLUK SEÇ'}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-3)', marginTop: 4 }}>
            {round + 1} / {rounds}
          </div>
        </div>

        {phase === 'pick' ? (
          <div className="grid grid-cols-2 gap-3">
            {CATS.map((c) => (
              <motion.button key={c} whileTap={{ scale: 0.96 }} onClick={() => chooseCat(c)} className="glass" style={{ padding: '18px 10px', borderRadius: 16, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.03em' }}>
                {c.toUpperCase()}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-center" style={{ color: 'var(--color-violet-bright)', fontWeight: 700, fontSize: 14 }}>{cat?.toUpperCase()}</div>
            {DIFFS.map((d) => (
              <motion.button key={d.label} whileTap={{ scale: 0.97 }} onClick={() => chooseDiff(d.value)} className="glass relative flex items-center justify-between" style={{ padding: '16px 18px', borderRadius: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: d.a }}>{d.label}</span>
                <span className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--color-ink-2)' }}>+{d.value} / -{d.value / 2}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---- Buzzer round ----
  if (!q) return null
  return (
    <>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
        <QuestionCard q={q} tag={`${cat} · ${value} PUAN`} index={round} total={rounds} />
        <OptionList q={q} stateOf={stateOf} onPick={onPick} />
      </div>
      <div className="flex flex-col items-center justify-end px-4 pb-safe" style={{ minHeight: 200, paddingTop: 6 }}>
        <AnimatePresence mode="wait">
          {phase === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
              <div style={{ color: 'var(--color-ink-3)', fontSize: 13, fontWeight: 600 }}>Rakip de basabilir — ilk basan cevaplar!</div>
              <Buzzer active onBuzz={onBuzz} />
            </motion.div>
          )}
          {(phase === 'answer' || phase === 'steal') && (
            <motion.div key="turn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2" style={{ paddingBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: buzzer === 'you' ? YOU_C : FOE_C }}>
                ⚡ {phase === 'steal' ? 'ÇALMA' : buzzer === 'you' ? 'SEN' : opponent.name.toUpperCase()}
                {reaction != null && phase === 'answer' && <span className="tnum" style={{ color: 'var(--color-ink-2)', fontWeight: 700 }}>{reaction.toFixed(2)} sn</span>}
              </div>
              <div style={{ color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600 }}>
                {myTurn ? (phase === 'steal' ? 'Çalma şansın — seç ya da PAS' : 'Cevabını seç!') : 'Rakip cevaplıyor...'}
              </div>
              {phase === 'steal' && turn === 'you' && (
                <motion.button onClick={() => resolveSteal(null, 'you', value, q)} whileTap={{ scale: 0.96 }} className="glass" style={{ marginTop: 6, padding: '10px 30px', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', color: 'var(--color-ink-1)' }}>
                  PAS
                </motion.button>
              )}
            </motion.div>
          )}
          {phase === 'reveal' && outcome && (
            <div key="reveal" style={{ paddingBottom: 24 }}>
              <OutcomeBanner outcome={outcome} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
