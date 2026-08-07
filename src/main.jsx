import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyThemeVars, loadPersistedThemeId } from './core/themeEngine/themeEngine'

applyThemeVars(loadPersistedThemeId());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
