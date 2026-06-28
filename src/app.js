// src/app.js - PLBMS Application Entry Point
import { initRouter } from './core/router/router.js'
import { registerSW } from './pwa/register.js'
import appState from './core/store/appState.js'

console.log('🕌 PLBMS v1.0.0 - Pesantren Lansia Bahagia Management System')

// Init aplikasi saat DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📄 DOM loaded, initializing app...')
  
  // Register Service Worker (PWA)
  registerSW()
  
  // Restore theme
  const savedTheme = localStorage.getItem('plb-theme') || 'light'
  appState.setTheme(savedTheme)
  
  // Restore language
  const savedLang = localStorage.getItem('plb-lang') || 'id'
  appState.setLanguage(savedLang)
  
  // Init router
  initRouter()
  
  console.log('✅ App initialized successfully')
})