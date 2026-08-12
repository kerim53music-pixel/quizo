import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

/** The signature QUIZO buzzer — 3D red dome, glowing ring, physical press. */
export function Buzzer({ active, onBuzz }: { active: boolean; onBuzz: () => void }) {
  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'grid', placeItems: 'center' }}>
      {active && (
        <>
          <motion.div
            aria-hidden="true"
            style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(240,69,79,0.6)' }}
            animate={{ scale: [1, 1.28], opacity: [0.7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            aria-hidden="true"
            style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(240,69,79,0.5)' }}
            animate={{ scale: [1, 1.28], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          />
        </>
      )}
      <motion.button
        onClick={active ? onBuzz : undefined}
        disabled={!active}
        whileTap={active ? { scale: 0.9 } : undefined}
        transition={{ type: 'spring', stiffness: 600, damping: 18 }}
        aria-label="Buzzer"
        style={
          {
            position: 'relative',
            width: 138,
            height: 138,
            borderRadius: '50%',
            background: active
              ? 'radial-gradient(circle at 50% 30%, #ff7178, #e0242f 55%, #7c0f16 100%)'
              : 'radial-gradient(circle at 50% 30%, #363b4d, #202433 60%, #14161f 100%)',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: active ? 'rgba(255,150,156,0.7)' : 'rgba(255,255,255,0.08)',
            boxShadow: active
              ? '0 20px 46px -10px rgba(240,69,79,0.75), inset 0 3px 9px rgba(255,255,255,0.4), inset 0 -9px 20px rgba(0,0,0,0.5)'
              : 'inset 0 2px 6px rgba(255,255,255,0.06), inset 0 -6px 14px rgba(0,0,0,0.5)',
            cursor: active ? 'pointer' : 'default',
          } as CSSProperties
        }
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 27,
            letterSpacing: '0.05em',
            color: '#fff',
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            opacity: active ? 1 : 0.45,
          }}
        >
          BAS!
        </span>
      </motion.button>
    </div>
  )
}
