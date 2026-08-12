import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { cn } from '../lib/cn'
import { asset } from '../lib/asset'

/**
 * QUIZO brand logo — real game asset (transparent PNG in /public).
 * `width` sizes it; drop-shadow "breath" adds living energy; optional float.
 */
export function QuizoLogo({
  width = 240,
  glow = true,
  float = false,
  className,
}: {
  width?: number
  glow?: boolean
  float?: boolean
  className?: string
}) {
  const img = (
    <img
      src={asset("/quizo-logo.png")}
      alt="QUIZO"
      draggable={false}
      className={cn('block select-none', className)}
      style={
        {
          width,
          height: 'auto',
          pointerEvents: 'none',
          animation: glow ? 'logo-breath 4.5s ease-in-out infinite' : undefined,
        } as CSSProperties
      }
    />
  )

  if (!float) return img
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {img}
    </motion.div>
  )
}
