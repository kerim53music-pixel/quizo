import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { BuzzerStage } from '../features/match/BuzzerStage'
import { CategoryStage } from '../features/match/CategoryStage'
import { ChainStage } from '../features/match/ChainStage'
import type { Side } from '../features/match/QuestionUI'
import { pickQuestions } from '../lib/questions'
import { formatNumber } from '../lib/format'
import type { Fighter } from '../lib/player'
import type { Member } from '../lib/room'

const RED = '#ff5964'
const BLUE = '#4d8bff'
const EASE = [0.22, 1, 0.36, 1] as const
const FINAL_VALUES = [200, 300, 400, 500, 750]

const STAGES = [
  { title: 'HIZLI TUR', sub: 'Saf bilgi + hız' },
  { title: 'KATEGORİ', sub: 'Kategori + zorluk + strateji' },
  { title: 'ZİNCİR', sub: 'Risk + ödül' },
  { title: 'SON RAUNT', sub: 'Artan puanlı final' },
]

function TeamHud({ members, score, color, teamName, mirror }: { members: Member[]; score: number; color: string; teamName: string; mirror?: boolean }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ flexDirection: mirror ? 'row-reverse' : 'row', background: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: '4px 12px 4px 6px', borderWidth: 1, borderStyle: 'solid', borderColor: `${color}66`, minWidth: 0 }}
    >
      <div className="flex" style={{ flexDirection: mirror ? 'row-reverse' : 'row' }}>
        {members.map((m, i) => (
          <div
            key={i}
            style={{
              marginLeft: !mirror && i ? -9 : 0,
              marginRight: mirror && i ? -9 : 0,
              borderRadius: '50%',
              boxShadow: m.you ? `0 0 0 2px ${color}` : '0 0 0 2px rgba(0,0,0,0.4)',
            }}
          >
            <Avatar name={m.name} size={26} ring={false} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: mirror ? 'right' : 'left', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 9.5, letterSpacing: '0.06em', color }}>{teamName}</div>
        <AnimatePresence mode="popLayout">
          <motion.div key={score} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.22 }} className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, lineHeight: 1, color: '#fff' }}>
            {formatNumber(score)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function StageCard({ n, title, sub, onDone }: { n: number; title: string; sub: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'grid', placeItems: 'center', background: 'rgba(20,10,50,0.72)', backdropFilter: 'blur(6px)' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, ease: EASE }} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.4em', color: '#fff' }}>
          ETAP {n}
        </motion.div>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, letterSpacing: '0.02em', margin: '6px 0', color: '#fff', textShadow: '0 0 30px rgba(139,92,246,0.7)' }}>
          {title}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600 }}>
          {sub}
        </motion.div>
      </div>
    </motion.div>
  )
}

function TeamResultCol({ members, score, color, teamName }: { members: Member[]; score: number; color: string; teamName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, letterSpacing: '0.06em', color }}>{teamName}</div>
      <div className="flex" >
        {members.map((m, i) => (
          <div key={i} style={{ marginLeft: i ? -10 : 0, borderRadius: '50%', boxShadow: m.you ? `0 0 0 2px ${color}` : '0 0 0 2px rgba(0,0,0,0.4)' }}>
            <Avatar name={m.name} size={40} ring={false} />
          </div>
        ))}
      </div>
      <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: '#fff' }}>{formatNumber(score)}</div>
    </div>
  )
}

function Result({ red, blue, redScore, blueScore, onExit, onRematch }: { red: Member[]; blue: Member[]; redScore: number; blueScore: number; onExit: () => void; onRematch: () => void }) {
  const win = redScore > blueScore
  const draw = redScore === blueScore
  return (
    <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(125% 80% at 50% 0%, #4f6bff 0%, #5a34cf 46%, #2c1a70 100%)' }} />
      <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-6 px-6">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, letterSpacing: '0.04em', color: '#fff', textShadow: `0 0 30px ${draw ? 'rgba(255,255,255,0.4)' : win ? 'rgba(52,214,122,0.7)' : 'rgba(240,69,79,0.7)'}` }}>
          {draw ? 'BERABERE' : win ? 'KAZANDIN!' : 'KAYBETTİN'}
        </motion.div>

        <div className="flex w-full items-center justify-around" style={{ maxWidth: 360, background: 'rgba(0,0,0,0.28)', borderRadius: 22, padding: '20px 12px' }}>
          <TeamResultCol members={red} score={redScore} color={RED} teamName="KIRMIZI" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>VS</div>
          <TeamResultCol members={blue} score={blueScore} color={BLUE} teamName="MAVİ" />
        </div>

        <div className="flex w-full flex-col gap-3" style={{ maxWidth: 300 }}>
          <motion.button onClick={onRematch} whileTap={{ scale: 0.97 }} style={{ height: 54, borderRadius: 16, background: 'linear-gradient(120deg,#7c3aed,#3b82f6)', boxShadow: '0 14px 34px -12px rgba(124,58,237,0.7)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '0.04em', color: '#fff' }}>
            YENİ MAÇ
          </motion.button>
          <motion.button onClick={onExit} whileTap={{ scale: 0.97 }} style={{ height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.1)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>
            ANA MENÜ
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export function MatchScene({ me, red, blue, onExit, onRematch }: { me: Fighter; red: Member[]; blue: Member[]; onExit: () => void; onRematch: () => void }) {
  void me
  const [{ q1, q4 }] = useState(() => {
    const p = pickQuestions(10)
    return { q1: p.slice(0, 5), q4: p.slice(5, 10) }
  })
  const [redScore, setRedScore] = useState(0)
  const [blueScore, setBlueScore] = useState(0)
  const [stage, setStage] = useState(0)
  const [showCard, setShowCard] = useState(true)
  const [done, setDone] = useState(false)

  const oppName = blue.find((m) => !m.you)?.name ?? blue[0]?.name ?? 'Rakip'
  const opponent: Fighter = { name: oppName, city: '', qp: 0, league: '' }

  const onScore = (side: Side, delta: number) => {
    if (side === 'you') setRedScore((s) => s + delta)
    else setBlueScore((s) => s + delta)
  }
  const nextStage = () => {
    if (stage >= STAGES.length - 1) setDone(true)
    else {
      setStage((s) => s + 1)
      setShowCard(true)
    }
  }

  if (done) return <Result red={red} blue={blue} redScore={redScore} blueScore={blueScore} onExit={onExit} onRematch={onRematch} />

  const renderStage = () => {
    switch (stage) {
      case 0:
        return <BuzzerStage questions={q1} opponent={opponent} valueFor={() => 100} onScore={onScore} onDone={nextStage} />
      case 1:
        return <CategoryStage rounds={3} opponent={opponent} onScore={onScore} onDone={nextStage} />
      case 2:
        return <ChainStage opponent={opponent} onScore={onScore} onDone={nextStage} />
      case 3:
        return <BuzzerStage questions={q4} opponent={opponent} valueFor={(i) => FINAL_VALUES[i] ?? 200} onScore={onScore} onDone={nextStage} />
      default:
        return null
    }
  }

  return (
    <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(125% 80% at 50% 0%, #4f6bff 0%, #5a34cf 46%, #2c1a70 100%)' }} />

      <div className="relative z-[1] flex h-full flex-col">
        <div className="flex items-start justify-between gap-2 px-3 pt-safe" style={{ paddingBottom: 8 }}>
          <TeamHud members={red} score={redScore} color={RED} teamName="KIRMIZI" />
          <div style={{ textAlign: 'center', paddingTop: 2 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, letterSpacing: '0.12em', color: '#fff' }}>ETAP {stage + 1}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>{STAGES[stage].title}</div>
          </div>
          <TeamHud members={blue} score={blueScore} color={BLUE} teamName="MAVİ" mirror />
        </div>

        {!showCard && renderStage()}
      </div>

      <AnimatePresence>
        {showCard && <StageCard n={stage + 1} title={STAGES[stage].title} sub={STAGES[stage].sub} onDone={() => setShowCard(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
