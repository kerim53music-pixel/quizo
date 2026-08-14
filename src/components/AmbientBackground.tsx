import type { CSSProperties } from 'react'
import { ParticleField } from './ParticleField'

/**
 * Friendly full-bleed backdrop: a vibrant violet→indigo gradient with soft
 * drifting light blobs and gentle particles. Bright, modern, playful.
 */
export function AmbientBackground() {
  return (
    <div
      className="ambient"
      aria-hidden="true"
      style={{ background: 'radial-gradient(130% 95% at 50% -8%, #0c1024 0%, #070a16 48%, #04050a 100%)' } as CSSProperties}
    >
      <ParticleField count={12} />
    </div>
  )
}
