import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { installMockApi, openDemoSession } from './api-mock'

if (!(window as any).api) {
  installMockApi()
  ;(window as any).__PREVIEW_MODE__ = true
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Auto-open a demo terminal session in preview mode
if ((window as any).__PREVIEW_MODE__) {
  setTimeout(openDemoSession, 600)
}
