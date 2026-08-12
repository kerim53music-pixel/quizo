import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted game typography (no external CDN)
import '@fontsource-variable/oxanium'
import '@fontsource/rajdhani/300.css'
import '@fontsource/rajdhani/400.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'

import './index.css'
import App from './App.tsx'
import { hydrateFromCloud } from './lib/cloud'

// Buluttaki yerleşimleri indir, SONRA uygulamayı çiz (sahneler yerleşimi senkron okuyor).
async function boot() {
  await hydrateFromCloud()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot()
