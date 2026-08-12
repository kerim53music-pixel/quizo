import { motion } from 'framer-motion'
import { MenuButton } from './MenuButton'
import { useTuning } from '../../lib/tuning'

const ITEMS = [
  { key: 'career', src: '/btn-kariyer.png', label: 'Kariyer' },
  { key: 'create', src: '/btn-oda-kur.png', label: 'Oda Kur' },
  { key: 'join', src: '/btn-odaya-katil.png', label: 'Odaya Katıl' },
  { key: 'discover', src: '/btn-odalari-kesfet.png', label: 'Odaları Keşfet' },
]

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function MainMenu({ onSelect }: { onSelect?: (key: string) => void }) {
  const t = useTuning()
  return (
    <motion.div
      className="flex w-full flex-col items-center"
      style={{ gap: t.buttonGap }}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
    >
      {ITEMS.map((it) => (
        <motion.div
          key={it.key}
          variants={item}
          className="flex w-full justify-center"
        >
          <MenuButton src={it.src} label={it.label} onClick={() => onSelect?.(it.key)} />
        </motion.div>
      ))}
    </motion.div>
  )
}
