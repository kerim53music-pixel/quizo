import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Buzzer } from './Buzzer'
import { QuestionCard, OptionList, OutcomeBanner, type Side, type OptState, type Outcome } from './QuestionUI'
import type { Question } from '../../lib/questions'
import type { Fighter } from '../../lib/player'

const YOU_C = '#f0454f'
const FOE_C = '#3d7bff'

/**
 * A full buzzer-race stage (Etap 1 "Hızlı Tur" & Etap 4 "Son Raunt").
 * Runs every question in `questions` with a buzzer race vs the bot, scoring +value
 * / -value/2, and a steal (+value*0.5 / -value*0.25 / pas) to the other side.
 */
export function BuzzerStage({
  questions,
  opponent,
  valueFor,
  onScore,
  onDone,
}: {
  questions: Question[]
  opponent: Fighter
  valueFor: (i: number) => number
  onScore: (side: Side, delta: number) => void
  onDone: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'live' | 'answer' | 'steal' | 'reveal'>('live')
  const [buzzer, setBuzzer] = useState<Side | null>(null)
  const [reaction, setReaction] = useState<number | null>(null)
  const [turn, setTurn] = useState<Side | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const q = questions[idx]
  const value = valueFor(idx)
  const lock = useRef(false)
  const t0 = useRef(0)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  useEffect(() => {
    lock.current = false
    setPhase('live')
    setBuzzer(null)
    setReaction(null)
    setTurn(null)
    setPicked(null)
    setOutcome(null)
    t0.current = performance.now()
    const cur = questions[idx]
    const botDelay = 1100 + Math.random() * 2500
    later(() => {
      if (!lock.current) doBuzz('foe', botDelay / 1000, cur)
    }, botDelay)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  function advance() {
    clearTimers()
    later(() => {
      if (idx + 1 >= questions.length) onDone()
      else setIdx((i) => i + 1)
    }, 1700)
  }

  function doBuzz(side: Side, reactionSec: number, cur: Question) {
    if (lock.current) return
    lock.current = true
    clearTimers()
    setBuzzer(side)
    setReaction(reactionSec)
    setTurn(side)
    setPhase('answer')
    if (side === 'foe') later(() => botAnswer(cur), 850)
    else later(() => forceTimeout('you', cur), 8000)
  }

  const onBuzz = () => {
    if (phase !== 'live' || lock.current) return
    doBuzz('you', (performance.now() - t0.current) / 1000, q)
  }

  function wrongChoice(cur: Question): number {
    const opts = [0, 1, 2, 3].filter((i) => i !== cur.correct)
    return opts[Math.floor(Math.random() * opts.length)]
  }

  function evaluate(choice: number, side: Side, cur: Question) {
    clearTimers()
    setPicked(choice)
    if (choice === cur.correct) {
      onScore(side, value)
      setOutcome({ label: 'DOĞRU', delta: value, good: true })
      setPhase('reveal')
      advance()
    } else {
      onScore(side, -Math.round(value / 2))
      setOutcome({ label: 'YANLIŞ', delta: -Math.round(value / 2), good: false })
      startSteal(side === 'you' ? 'foe' : 'you', cur)
    }
  }

  function forceTimeout(side: Side, cur: Question) {
    clearTimers()
    setPicked(null)
    onScore(side, -Math.round(value / 2))
    setOutcome({ label: 'SÜRE DOLDU', delta: -Math.round(value / 2), good: false })
    startSteal(side === 'you' ? 'foe' : 'you', cur)
  }

  function startSteal(side: Side, cur: Question) {
    clearTimers()
    setTurn(side)
    setPicked(null)
    setPhase('steal')
    if (side === 'foe') later(() => botSteal(cur), 950)
    else later(() => resolveSteal(null, 'you', cur), 4500)
  }

  function botAnswer(cur: Question) {
    const good = Math.random() < 0.65
    evaluate(good ? cur.correct : wrongChoice(cur), 'foe', cur)
  }
  function botSteal(cur: Question) {
    if (Math.random() < 0.4) {
      resolveSteal(null, 'foe', cur)
      return
    }
    const good = Math.random() < 0.6
    resolveSteal(good ? cur.correct : wrongChoice(cur), 'foe', cur)
  }

  function resolveSteal(choice: number | null, side: Side, cur: Question) {
    clearTimers()
    if (choice === null) {
      setOutcome({ label: 'PAS', delta: 0, good: false })
      setPhase('reveal')
      advance()
      return
    }
    setPicked(choice)
    const gain = Math.round(value * 0.5)
    const loss = Math.round(value * 0.25)
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
    if (phase === 'answer' && turn === 'you') evaluate(i, 'you', q)
    else if (phase === 'steal' && turn === 'you') resolveSteal(i, 'you', q)
  }

  const stateOf = (i: number): OptState => {
    if (phase === 'reveal') {
      if (i === q.correct) return 'correct'
      if (picked === i) return 'wrong'
      return 'idle'
    }
    return myTurn ? 'active' : 'idle'
  }

  return (
    <>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
        <QuestionCard q={q} index={idx} total={questions.length} />
        <OptionList q={q} stateOf={stateOf} onPick={onPick} />
      </div>

      <div className="flex flex-col items-center justify-end px-4 pb-safe" style={{ minHeight: 200, paddingTop: 6 }}>
        <AnimatePresence mode="wait">
          {phase === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
              <div style={{ color: 'var(--color-ink-3)', fontSize: 13, fontWeight: 600 }}>İlk basan cevaplar!</div>
              <Buzzer active onBuzz={onBuzz} />
            </motion.div>
          )}

          {(phase === 'answer' || phase === 'steal') && (
            <motion.div key="turn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2" style={{ paddingBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: buzzer === 'you' ? YOU_C : FOE_C }}>
                ⚡ {phase === 'steal' ? 'ÇALMA' : buzzer === 'you' ? 'SEN' : opponent.name.toUpperCase()}
                {reaction != null && phase === 'answer' && (
                  <span className="tnum" style={{ color: 'var(--color-ink-2)', fontWeight: 700 }}>{reaction.toFixed(2)} sn</span>
                )}
              </div>
              <div style={{ color: 'var(--color-ink-2)', fontSize: 14, fontWeight: 600 }}>
                {myTurn ? (phase === 'steal' ? 'Çalma şansın — seç ya da PAS' : 'Cevabını seç!') : 'Rakip cevaplıyor...'}
              </div>
              {phase === 'steal' && turn === 'you' && (
                <motion.button
                  onClick={() => resolveSteal(null, 'you', q)}
                  whileTap={{ scale: 0.96 }}
                  className="glass"
                  style={{ marginTop: 6, padding: '10px 30px', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', color: 'var(--color-ink-1)' }}
                >
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
