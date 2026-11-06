import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PublicSite from './PublicSite.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicSite />
  </StrictMode>,
)
