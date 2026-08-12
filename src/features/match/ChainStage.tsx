import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { QuestionCard, OptionList, OutcomeBanner, type Side, type OptState, type Outcome } from './QuestionUI'
import { QUESTIONS, type Question } from '../../lib/questions'
import { formatNumber } from '../../lib/format'
import type { Fighter } from '../../lib/player'

const CHAIN = [100, 200, 400, 800, 1600]

/** Etap 3 — Zincir: turn-based risk chain. You take a run, then the opponent does. */
export function ChainStage({
  opponent,
  onScore,
  onDone,
}: {
  opponent: Fighter
  onScore: (side: Side, delta: number) => void
  onDone: () => void
}) {
  const [side, setSide] = useState<Side>('you')
  const [step, setStep] = useState(0)
  const [pot, setPot] = useState(0)
  const [phase, setPhase] = useState<'q' | 'decide' | 'reveal'>('q')
  const [q, setQ] = useState<Question | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const used = useRef<Set<string>>(new Set())
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  function pickQ(): Question {
    let pool = QUESTIONS.filter((x) => !used.current.has(x.q))
    if (!pool.length) {
      used.current.clear()
      pool = QUESTIONS
    }
    const c = pool[Math.floor(Math.random() * pool.length)]
    used.current.add(c.q)
    return c
  }
  function wrongChoice(cur: Question) {
    const opts = [0, 1, 2, 3].filter((i) => i !== cur.correct)
    return opts[Math.floor(Math.random() * opts.length)]
  }

  function beginRun(runSide: Side) {
    clearTimers()
    setSide(runSide)
    setStep(0)
    setPot(0)
    setPicked(null)
    setOutcome(null)
    const question = pickQ()
    setQ(question)
    setPhase('q')
    if (runSide === 'foe') later(() => botAnswer(runSide, 0, 0, question), 1300)
  }

  useEffect(() => {
    beginRun('you')
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answer(runSide: Side, choice: number, curStep: number, curPot: number, cur: Question) {
    clearTimers()
    setPicked(choice)
    if (choice === cur.correct) {
      const newPot = curPot + CHAIN[curStep]
      const newStep = curStep + 1
      setPot(newPot)
      setStep(newStep)
      setPhase('decide')
      if (newStep >= CHAIN.length) {
        later(() => bank(runSide, newPot), 1000)
      } else if (runSide === 'foe') {
        later(() => botDecide(runSide, newStep, newPot), 1200)
      }
    } else {
      setPhase('reveal')
      setOutcome({ label: 'ZİNCİR KIRILDI', delta: 0, good: false })
      later(() => endRun(runSide), 1800)
    }
  }

  function bank(runSide: Side, curPot: number) {
    clearTimers()
    onScore(runSide, curPot)
    setPhase('reveal')
    setOutcome({ label: 'KASAYA KOYULDU', delta: curPot, good: true })
    later(() => endRun(runSide), 1800)
  }

  function continueRun(runSide: Side, curStep: number, curPot: number) {
    clearTimers()
    const nq = pickQ()
    setQ(nq)
    setPicked(null)
    setOutcome(null)
    setPhase('q')
    if (runSide === 'foe') later(() => botAnswer(runSide, curStep, curPot, nq), 1300)
  }

  function botAnswer(runSide: Side, curStep: number, curPot: number, cur: Question) {
    const good = Math.random() < 0.6
    answer(runSide, good ? cur.correct : wrongChoice(cur), curStep, curPot, cur)
  }
  function botDecide(runSide: Side, curStep: number, curPot: number) {
    const bankProb = Math.min(0.85, 0.15 * curStep)
    if (Math.random() < bankProb) bank(runSide, curPot)
    else continueRun(runSide, curStep, curPot)
  }

  function endRun(runSide: Side) {
    clearTimers()
    if (runSide === 'you') later(() => beginRun('foe'), 300)
    else later(() => onDone(), 300)
  }

  const myTurn = side === 'you' && phase === 'q'
  const onPick = (i: number) => {
    if (myTurn && q) answer('you', i, step, pot, q)
  }
  const stateOf = (i: number): OptState => {
    if (!q) return 'idle'
    if (phase === 'decide' || phase === 'reveal') return i === q.correct ? 'correct' : picked === i ? 'wrong' : 'idle'
    return myTurn ? 'active' : 'idle'
  }

  const nextReward = step < CHAIN.length ? CHAIN[step] : null

  return (
    <>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
        {/* Chain header */}
        <div className="flex flex-col items-center gap-2" style={{ paddingTop: 2 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', color: side === 'you' ? '#f0454f' : '#3d7bff' }}>
            SIRA: {side === 'you' ? 'SEN' : opponent.name.toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5">
            {CHAIN.map((v, i) => (
              <div
                key={i}
                className="grid place-items-center tnum"
                style={{
                  minWidth: 44,
                  height: 30,
                  padding: '0 6px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 12,
                  color: i < step ? '#fff' : 'var(--color-ink-3)',
                  background: i < step ? 'linear-gradient(150deg,#34d399,#12946a)' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: i === step ? 'rgba(52,211,153,0.7)' : 'rgba(255,255,255,0.08)',
                  boxShadow: i < step ? '0 0 12px rgba(52,211,153,0.5)' : 'none',
                }}
              >
                {v >= 1000 ? `${v / 1000}K` : v}
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={pot} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: 'var(--color-emerald)', textShadow: '0 0 24px rgba(52,211,153,0.5)' }}>
              {formatNumber(pot)}
            </motion.div>
          </AnimatePresence>
          {nextReward != null && phase !== 'reveal' && (
            <div style={{ color: 'var(--color-ink-2)', fontSize: 13, fontWeight: 600 }}>
              Sonraki doğru: <span style={{ color: 'var(--color-gold)' }}>+{nextReward}</span>
            </div>
          )}
        </div>

        {q && <QuestionCard q={q} tag="ZİNCİR" />}
        {q && <OptionList q={q} stateOf={stateOf} onPick={onPick} />}
      </div>

      <div className="flex flex-col items-center justify-end px-4 pb-safe" style={{ minHeight: 120, paddingTop: 6 }}>
        <AnimatePresence mode="wait">
          {phase === 'q' && !myTurn && (
            <motion.div key="botq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600, paddingBottom: 20 }}>
              Rakip cevaplıyor...
            </motion.div>
          )}
          {phase === 'q' && myTurn && (
            <motion.div key="youq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--color-ink-3)', fontSize: 13, fontWeight: 600, paddingBottom: 20 }}>
              Doğru bil, zinciri büyüt!
            </motion.div>
          )}

          {phase === 'decide' && side === 'you' && step < CHAIN.length && (
            <motion.div key="decide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex w-full gap-3" style={{ paddingBottom: 14, maxWidth: 420, marginInline: 'auto' }}>
              <motion.button onClick={() => bank('you', pot)} whileTap={{ scale: 0.96 }} className="flex-1" style={{ height: 58, borderRadius: 16, background: 'linear-gradient(150deg,#34d399,#12946a)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', boxShadow: '0 12px 28px -10px rgba(52,211,153,0.6)' }}>
                <div style={{ fontSize: 15 }}>KASAYA KOY</div>
                <div className="tnum" style={{ fontSize: 12, opacity: 0.9 }}>+{formatNumber(pot)}</div>
              </motion.button>
              <motion.button onClick={() => continueRun('you', step, pot)} whileTap={{ scale: 0.96 }} className="glass flex-1" style={{ height: 58, borderRadius: 16, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-ink-1)' }}>
                <div style={{ fontSize: 15 }}>DEVAM ET</div>
                <div className="tnum" style={{ fontSize: 12, color: 'var(--color-gold)' }}>+{CHAIN[step]} riskte</div>
              </motion.button>
            </motion.div>
          )}
          {phase === 'decide' && side === 'foe' && (
            <motion.div key="botdecide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600, paddingBottom: 20 }}>
              Rakip karar veriyor...
            </motion.div>
          )}

          {phase === 'reveal' && outcome && (
            <div key="reveal" style={{ paddingBottom: 22 }}>
              <OutcomeBanner outcome={outcome} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
