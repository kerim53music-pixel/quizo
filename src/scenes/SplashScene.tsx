import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { QuizoLogo } from '../components/QuizoLogo'
import { ParticleField } from '../components/ParticleField'

const EASE = [0.22, 1, 0.36, 1] as const

export function SplashScene({ onDone }: { onDone: () => void }) {
  const done = useRef(false)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true
        onDone()
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="absolute inset-0 z-[3] flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(circle at 50% 44%, #0b0e1e 0%, #04050a 72%)' }}
      exit={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="absolute inset-0">
        <ParticleField count={42} />
      </div>

      {[0, 0.35].map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 230, height: 230, borderWidth: 1.5, borderStyle: 'solid', borderColor: 'rgba(139,92,246,0.5)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.85] }}
          transition={{ duration: 1.6, delay: 0.5 + d, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="absolute rounded-full"
        style={
          {
            width: 270,
            height: 270,
            background:
              'conic-gradient(from var(--angle), transparent, rgba(139,92,246,0.4), transparent 60%)',
            animation: 'spin-border 3s linear infinite',
            filter: 'blur(26px)',
          } as CSSProperties
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 1.15, filter: 'blur(18px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, ease: EASE }}
      >
        <QuizoLogo width={300} />
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          bottom: '31%',
          height: 2,
          borderRadius: 999,
          background: 'linear-gradient(90deg, transparent, #60a5fa, #a78bfa, transparent)',
          boxShadow: '0 0 12px rgba(96,165,250,0.8)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 190, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
      />

      <motion.div
        className="absolute"
        style={{
          bottom: '25%',
          color: 'var(--color-ink-3)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.4em',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1] }}
        transition={{ duration: 1.2, delay: 0.9 }}
      >
        YÜKLENİYOR
      </motion.div>
    </motion.div>
  )
}
