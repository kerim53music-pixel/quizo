import type { CSSProperties } from 'react'

const GEM_CLIP = 'polygon(29% 15%, 71% 15%, 88% 36%, 50% 88%, 13% 36%)'

/** Faceted diamond emblem (Elmas rank) with a sweeping shine — not the 💎 emoji. */
export function RankBadge({ size = 18 }: { size?: number }) {
  return (
    <span
      style={
        {
          position: 'relative',
          display: 'inline-block',
          width: size,
          height: size,
          clipPath: GEM_CLIP,
          filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.55))',
        } as CSSProperties
      }
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gem-fill" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bae6fd" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M7 3.5h10l4 5.1L12 21 3 8.6 7 3.5Z" fill="url(#gem-fill)" />
        <path
          d="M3 8.6h18M9.3 3.5 7.6 8.6 12 21M14.7 3.5 16.4 8.6 12 21"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.7"
          fill="none"
        />
      </svg>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '55%',
          height: '100%',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
          animation: 'shine-x 3.6s ease-in-out infinite',
        }}
      />
    </span>
  )
}
