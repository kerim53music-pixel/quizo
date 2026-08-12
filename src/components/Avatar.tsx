import type { CSSProperties } from 'react'

export function Avatar({
  name,
  size = 44,
  ring = true,
}: {
  name: string
  size?: number
  ring?: boolean
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const maskRing =
    'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))'

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        minWidth: size,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {ring && (
        <span
          aria-hidden="true"
          style={
            {
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              background:
                'conic-gradient(from var(--angle), #a78bfa, #60a5fa, #38bdf8, #a78bfa)',
              animation: 'spin-border 6s linear infinite',
              WebkitMask: maskRing,
              mask: maskRing,
              filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.6))',
            } as CSSProperties
          }
        />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: size * 0.42,
          color: '#fff',
          background: 'linear-gradient(150deg,#6d28d9,#3b82f6)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 20px -8px rgba(59,130,246,0.65)',
        }}
      >
        {initial}
      </div>
    </div>
  )
}
