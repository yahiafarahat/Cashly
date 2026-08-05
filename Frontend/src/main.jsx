import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/SharedShell.css'
import './styles/Theme.css'
import App from './App.jsx'

let initialTheme = 'light'
try {
  initialTheme = JSON.parse(localStorage.getItem('cashlyAppearance'))?.theme || 'light'
} catch {
  initialTheme = 'light'
}
document.documentElement.classList.toggle('dark', initialTheme === 'dark')
document.documentElement.classList.toggle('light', initialTheme === 'light')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
