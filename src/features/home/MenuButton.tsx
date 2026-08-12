import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useTuning } from '../../lib/tuning'

/** A full banner asset used as a menu button (icon/text/arrow baked into the art). */
export function MenuButton({
  src,
  label,
  onClick,
}: {
  src: string
  label: string
  onClick?: () => void
}) {
  const t = useTuning()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.975, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={
        {
          display: 'block',
          width: `${t.buttonWidthPct}%`,
          height: t.buttonHeightPx,
          position: 'relative',
          borderRadius: t.buttonRadius,
          overflow: 'hidden',
          borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.09)',
          boxShadow: '0 14px 30px -14px rgba(0,0,0,0.85)',
        } as CSSProperties
      }
    >
      <img
        src={src}
        alt={label}
        draggable={false}
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `center ${t.objPosY}%`,
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </motion.button>
  )
}
