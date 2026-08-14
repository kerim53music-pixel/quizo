import { motion } from 'framer-motion'
import { Avatar } from '../components/Avatar'
import { formatNumber } from '../lib/format'
import { makeBp, loadLayout, type EditProps } from '../lib/editable'
import { ScreenExtras } from '../components/ScreenExtras'
import type { Fighter } from '../lib/player'

type Row = { name: string; score: number; you: boolean }

const SAMPLE: Row[] = [
  { name: 'Kerim', score: 1240, you: true },
  { name: 'Eren', score: 980, you: false },
  { name: 'Maya', score: 760, you: false },
  { name: 'Alp', score: 540, you: false },
]

export function ResultScene({
  me,
  rows = SAMPLE,
  onExit,
  editMode = false,
  layout,
  selectedId,
  onBlockDown,
}: {
  me?: Fighter
  rows?: Row[]
  onExit?: () => void
} & EditProps) {
  void me
  const bp = makeBp(editMode ? layout : loadLayout('result'), editMode, selectedId, onBlockDown)
  const ranked = [...rows].sort((a, b) => b.score - a.score)
  const myRank = ranked.findIndex((p) => p.you) + 1

  return (
    <motion.div className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0 }}>
      <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-6 px-6">
        <div onPointerDown={bp('title').onPointerDown} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: '#fff', textShadow: '0 0 26px rgba(245,158,11,0.7)', ...bp('title').style }}>
          {myRank === 1 ? '🏆 BİRİNCİ!' : `${myRank}. OLDUN`}
        </div>
        <div onPointerDown={bp('panel').onPointerDown} className="board-panel flex w-full flex-col gap-2" style={{ maxWidth: 340, borderRadius: 18, padding: 12, ...bp('panel').style }}>
          {ranked.map((p, i) => (
            <div key={p.name} onPointerDown={bp(`row-${i}`).onPointerDown} className="flex items-center gap-2.5" style={{ padding: '6px 4px', ...bp(`row-${i}`).style }}>
              <span className="tnum" style={{ width: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: i === 0 ? '#ffd05e' : '#9aa3cf' }}>{i + 1}</span>
              <Avatar name={p.name} size={34} ring={p.you} />
              <div className="flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>{p.name}</div>
              <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#ffd05e' }}>{formatNumber(p.score)}</div>
            </div>
          ))}
        </div>
        <button onClick={editMode ? undefined : onExit} onPointerDown={bp('button').onPointerDown} className="btn-primary press" style={{ height: 54, width: '100%', maxWidth: 300, fontSize: 17, letterSpacing: '0.04em', ...bp('button').style }}>
          ANA MENÜ
        </button>
      </div>
      {!editMode && <ScreenExtras screen="result" />}
    </motion.div>
  )
}
