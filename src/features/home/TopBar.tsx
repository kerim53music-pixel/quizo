import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { RankBadge } from '../../components/RankBadge'
import { IconBell, IconUsers, IconGear } from '../../components/icons'
import { formatNumber } from '../../lib/format'

function IconButton({
  children,
  label,
  badge,
}: {
  children: ReactNode
  label: string
  badge?: number
}) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="glass-soft relative grid shrink-0 place-items-center rounded-full"
      style={{ width: 38, height: 38, color: 'var(--color-ink-2)' }}
    >
      {children}
      {badge ? (
        <span
          className="tnum absolute grid place-items-center"
          style={{
            top: -3,
            right: -3,
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            borderRadius: 999,
            background: 'linear-gradient(180deg,#ff5a63,#e0242f)',
            color: '#fff',
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            border: '2px solid var(--color-bg-0)',
          }}
        >
          {badge}
        </span>
      ) : null}
    </motion.button>
  )
}

export function TopBar({
  name,
  rank,
  qp,
}: {
  name: string
  rank: string
  qp: number
}) {
  return (
    <header
      className="flex items-center justify-between gap-2 px-4 pt-safe"
      style={{ paddingBottom: 6 }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar name={name} size={44} />
        <div className="min-w-0 flex-1">
          <div
            className="truncate"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16.5,
              lineHeight: 1.12,
            }}
          >
            {name}
          </div>
          <div
            className="flex items-center gap-1.5 overflow-hidden"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-ink-2)',
              whiteSpace: 'nowrap',
            }}
          >
            <RankBadge size={13} />
            <span style={{ color: 'var(--color-cyan)' }}>{rank}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span className="tnum">{formatNumber(qp)} QP</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton label="Bildirimler" badge={3}>
          <IconBell size={19} />
        </IconButton>
        <IconButton label="Arkadaşlar">
          <IconUsers size={19} />
        </IconButton>
        <IconButton label="Ayarlar">
          <IconGear size={19} />
        </IconButton>
      </div>
    </header>
  )
}
