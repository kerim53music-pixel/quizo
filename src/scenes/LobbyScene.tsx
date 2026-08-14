import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { IconArrowLeft, IconCopy, IconCheck, IconMic, IconMicOff, IconPlay } from '../components/icons'
import { makeBp, loadLayout, type EditProps, type BlkProps } from '../lib/editable'
import { ScreenExtras } from '../components/ScreenExtras'
import { patchMe, startCloudRoom } from '../lib/rooms'
import type { Member, Room } from '../lib/room'

const RED = '#f0454f'
const BLUE = '#3d7bff'
const EASE = [0.22, 1, 0.36, 1] as const

function MemberRow({ m, color }: { m: Member; color: string }) {
  return (
    <motion.div layout className="flex items-center gap-2.5" style={{ padding: '7px 2px' }}>
      <Avatar name={m.name} size={34} ring={m.you} />
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: m.you ? color : 'var(--color-ink-1)' }}>
          {m.name}
          {m.you ? ' (Sen)' : ''}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: m.ready ? 'var(--color-correct)' : 'var(--color-ink-3)' }}>
          {m.ready ? 'Hazır' : 'Bekleniyor...'}
        </div>
      </div>
      <span style={{ color: m.mic ? 'var(--color-ink-2)' : 'var(--color-ink-3)', opacity: m.mic ? 1 : 0.5 }}>
        {m.mic ? <IconMic size={16} /> : <IconMicOff size={16} />}
      </span>
      {m.ready && (
        <span className="grid place-items-center" style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(52,214,122,0.18)', color: 'var(--color-correct)' }}>
          <IconCheck size={13} strokeWidth={3} />
        </span>
      )}
    </motion.div>
  )
}

function TeamColumn({ title, color, members, blk }: { title: string; color: string; members: Member[]; blk?: BlkProps }) {
  return (
    <div className="glass relative flex-1" onPointerDown={blk?.onPointerDown} style={{ borderRadius: 16, padding: '12px 12px', borderColor: `${color}44`, ...(blk?.style || {}) } as CSSProperties}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5, letterSpacing: '0.06em', color, marginBottom: 6 }}>
        {title}
      </div>
      <div className="flex flex-col">
        {members.map((m, i) => (
          <MemberRow key={m.name + i} m={m} color={color} />
        ))}
      </div>
    </div>
  )
}

export function LobbyScene({
  room,
  onLeave,
  onStart,
  cloudCode,
  editMode = false,
  layout,
  selectedId,
  onBlockDown,
}: {
  room: Room
  onLeave: () => void
  onStart: (opponentName: string) => void
  cloudCode?: string
} & EditProps) {
  const [red, setRed] = useState<Member[]>(room.red)
  const [blue, setBlue] = useState<Member[]>(room.blue)
  const [copied, setCopied] = useState(false)
  const timers = useRef<number[]>([])
  const bp = makeBp(editMode ? layout : loadLayout('lobby'), editMode, selectedId, onBlockDown)

  // Bulut odası: üye listesi dışarıdan (realtime) gelir
  useEffect(() => {
    if (!cloudCode) return
    setRed(room.red)
    setBlue(room.blue)
  }, [cloudCode, room])

  useEffect(() => {
    if (editMode || cloudCode) return
    room.red.forEach((m, i) => {
      if (!m.you) timers.current.push(window.setTimeout(() => setRed((l) => l.map((x, j) => (j === i && !x.you ? { ...x, ready: true } : x))), 800 + Math.random() * 3200))
    })
    room.blue.forEach((m, i) => {
      if (!m.you) timers.current.push(window.setTimeout(() => setBlue((l) => l.map((x, j) => (j === i && !x.you ? { ...x, ready: true } : x))), 800 + Math.random() * 3200))
    })
    return () => timers.current.forEach((t) => clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meOnRed = red.some((m) => m.you)
  const allReady = red.every((m) => m.ready) && blue.every((m) => m.ready)

  const toggleReady = () => {
    const cur = (meOnRed ? red : blue).find((m) => m.you)?.ready ?? false
    if (cloudCode) {
      void patchMe(cloudCode, { ready: !cur })
      return
    }
    const upd = (l: Member[]) => l.map((m) => (m.you ? { ...m, ready: !m.ready } : m))
    if (meOnRed) setRed(upd)
    else setBlue(upd)
  }

  const toggleMic = () => {
    const upd = (l: Member[]) => l.map((m) => (m.you ? { ...m, mic: !m.mic } : m))
    if (meOnRed) setRed(upd)
    else setBlue(upd)
  }
  const myMic = (meOnRed ? red : blue).find((m) => m.you)?.mic ?? true

  const switchTeam = () => {
    if (meOnRed) {
      const meIdx = red.findIndex((m) => m.you)
      const botIdx = blue.findIndex((m) => !m.you)
      if (botIdx < 0) return
      const meM = red[meIdx]
      const botM = blue[botIdx]
      setRed((l) => l.map((m, i) => (i === meIdx ? botM : m)))
      setBlue((l) => l.map((m, i) => (i === botIdx ? meM : m)))
    } else {
      const meIdx = blue.findIndex((m) => m.you)
      const botIdx = red.findIndex((m) => !m.you)
      if (botIdx < 0) return
      const meM = blue[meIdx]
      const botM = red[botIdx]
      setBlue((l) => l.map((m, i) => (i === meIdx ? botM : m)))
      setRed((l) => l.map((m, i) => (i === botIdx ? meM : m)))
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
    } catch {
      /* ignore */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const start = () => {
    if (cloudCode) {
      void startCloudRoom(cloudCode) // herkes aynı anda maça geçer
      return
    }
    const foes = meOnRed ? blue : red
    onStart(foes[0]?.name ?? 'Rakip')
  }

  const meReady = (meOnRed ? red : blue).find((m) => m.you)?.ready ?? false

  return (
    <motion.div className="stage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="relative z-[1] flex h-full flex-col">
        {/* header */}
        <header className="flex items-center gap-3 px-4 pt-safe" style={{ paddingBottom: 8 }}>
          <motion.button onClick={editMode ? undefined : onLeave} onPointerDown={bp('back').onPointerDown} whileTap={editMode ? undefined : { scale: 0.9 }} aria-label="Geri" className="glass-soft grid place-items-center rounded-full" style={{ width: 40, height: 40, color: 'var(--color-ink-1)', ...bp('back').style }}>
            <IconArrowLeft size={20} />
          </motion.button>
          <motion.button onClick={editMode ? undefined : copyCode} onPointerDown={bp('code').onPointerDown} whileTap={editMode ? undefined : { scale: 0.97 }} className="glass flex items-center gap-2" style={{ padding: '8px 14px', borderRadius: 12, ...bp('code').style }}>
            <span className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '0.04em' }}>{room.code}</span>
            <span style={{ color: 'var(--color-violet-bright)' }}><IconCopy size={16} /></span>
          </motion.button>
          <div onPointerDown={bp('mode').onPointerDown} style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--color-ink-2)', letterSpacing: '0.06em', ...bp('mode').style }}>{room.mode}</div>
        </header>

        <AnimatePresence>
          {copied && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: 66, left: 0, right: 0, textAlign: 'center', color: 'var(--color-correct)', fontSize: 12.5, fontWeight: 700, zIndex: 5 }}>
              Kod kopyalandı ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* teams */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
          <div className="flex gap-3">
            <TeamColumn title="KIRMIZI TAKIM" color={RED} members={red} blk={bp('red-team')} />
            <TeamColumn title="MAVİ TAKIM" color={BLUE} members={blue} blk={bp('blue-team')} />
          </div>

          {/* voice bar */}
          <div className="glass flex items-center gap-3" onPointerDown={bp('voice').onPointerDown} style={{ borderRadius: 14, padding: '10px 14px', ...bp('voice').style }}>
            <span style={{ color: room.settings.voice ? 'var(--color-violet-bright)' : 'var(--color-ink-3)' }}>
              <IconMic size={18} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-2)' }}>
              Sesli Sohbet: {room.settings.voice ? 'Takım' : 'Kapalı'}
            </span>
            {room.settings.voice && (
              <motion.button onClick={toggleMic} whileTap={{ scale: 0.92 }} className="glass-soft grid place-items-center rounded-full" style={{ marginLeft: 'auto', width: 36, height: 36, color: myMic ? 'var(--color-correct)' : 'var(--color-ink-3)' }} aria-label="Mikrofon">
                {myMic ? <IconMic size={17} /> : <IconMicOff size={17} />}
              </motion.button>
            )}
          </div>
        </div>

        {/* controls */}
        <div className="flex flex-col gap-2.5 px-4 pb-safe" style={{ paddingTop: 8 }}>
          <div className="flex gap-2.5">
            <motion.button onClick={editMode ? undefined : switchTeam} onPointerDown={bp('switch').onPointerDown} whileTap={editMode ? undefined : { scale: 0.97 }} className="glass" style={{ height: 50, flex: 1, borderRadius: 14, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--color-ink-1)', ...bp('switch').style }}>
              TAKIM DEĞİŞTİR
            </motion.button>
            <motion.button
              onClick={editMode ? undefined : toggleReady}
              onPointerDown={bp('ready').onPointerDown}
              whileTap={editMode ? undefined : { scale: 0.97 }}
              style={{
                height: 50,
                flex: 1,
                borderRadius: 14,
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 14,
                color: '#fff',
                background: meReady ? 'linear-gradient(150deg,#34d399,#12946a)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: meReady ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.12)',
                boxShadow: meReady ? '0 10px 26px -10px rgba(52,211,153,0.6)' : 'none',
                ...bp('ready').style,
              }}
            >
              {meReady ? '✓ HAZIR' : 'HAZIRIM'}
            </motion.button>
          </div>
          <motion.button
            onClick={editMode ? undefined : allReady ? start : undefined}
            onPointerDown={bp('start').onPointerDown}
            whileTap={!editMode && allReady ? { scale: 0.97 } : undefined}
            disabled={editMode ? false : !allReady}
            className="flex items-center justify-center gap-2"
            style={{
              height: 58,
              borderRadius: 16,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.04em',
              color: '#fff',
              background: allReady ? 'linear-gradient(120deg,#7c3aed,#3b82f6)' : 'rgba(255,255,255,0.05)',
              boxShadow: allReady ? '0 16px 40px -12px rgba(124,58,237,0.7)' : 'none',
              opacity: allReady ? 1 : 0.55,
              ...bp('start').style,
            }}
          >
            <IconPlay size={20} />
            {allReady ? 'OYUNU BAŞLAT' : 'OYUNCULAR BEKLENİYOR...'}
          </motion.button>
        </div>
      </div>
      {!editMode && <ScreenExtras screen="lobby" />}
    </motion.div>
  )
}
