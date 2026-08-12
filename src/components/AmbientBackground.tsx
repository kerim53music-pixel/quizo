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
      style={{ background: 'radial-gradient(135% 95% at 50% -8%, #7059ec 0%, #4a34c2 46%, #2a1c7a 100%)' } as CSSProperties}
    >
      <div className="blob blob-violet" />
      <div className="blob blob-azure" />
      <div className="blob blob-gold" />
      <ParticleField count={16} />
    </div>
  )
}
