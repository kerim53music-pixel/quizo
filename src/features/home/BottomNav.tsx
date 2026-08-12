import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  type IconProps,
  IconHome,
  IconRanking,
  IconTasks,
  IconBag,
  IconUser,
} from '../../components/icons'

type Tab = { key: string; label: string; Icon: (p: IconProps) => ReactNode }

const TABS: Tab[] = [
  { key: 'home', label: 'Ana Sayfa', Icon: IconHome },
  { key: 'ranking', label: 'Liderlik', Icon: IconRanking },
  { key: 'tasks', label: 'Görevler', Icon: IconTasks },
  { key: 'shop', label: 'Mağaza', Icon: IconBag },
  { key: 'profile', label: 'Profil', Icon: IconUser },
]

export function BottomNav({
  active = 'home',
  onChange,
}: {
  active?: string
  onChange?: (key: string) => void
}) {
  return (
    <nav
      className="glass relative flex items-stretch justify-around px-1 pb-safe"
      style={{ paddingTop: 8, borderRadius: 0, borderInline: 'none', borderBottom: 'none' }}
    >
      {TABS.map((t) => {
        const on = t.key === active
        const { Icon } = t
        return (
          <motion.button
            key={t.key}
            onClick={() => onChange?.(t.key)}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-1 flex-col items-center gap-1 py-1"
            style={{ color: on ? 'var(--color-violet-bright)' : 'var(--color-ink-3)' }}
          >
            {on && (
              <motion.span
                layoutId="navind"
                className="absolute"
                style={{
                  top: -8,
                  width: 30,
                  height: 3,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
                  boxShadow: '0 0 12px rgba(139,92,246,0.85)',
                }}
              />
            )}
            <Icon size={22} strokeWidth={on ? 2 : 1.8} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.02em',
                filter: on ? 'drop-shadow(0 0 8px rgba(139,92,246,0.6))' : undefined,
              }}
            >
              {t.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
