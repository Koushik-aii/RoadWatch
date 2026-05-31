import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.jsx'
import { CountryProvider } from './context/CountryContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <CountryProvider>
        <Router />
      </CountryProvider>
    </LanguageProvider>
  </StrictMode>,
)

// Service Worker registration is handled automatically by vite-plugin-pwa
// (registerType: 'autoUpdate' in vite.config.js).
// The old manual /sw.js registration has been removed.
