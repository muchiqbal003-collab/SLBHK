// src/config/app.config.js
// Konfigurasi umum aplikasi

const appConfig = {
    name: import.meta.env.VITE_APP_NAME || 'Pesantren Lansia Bahagia',
    version: '1.0.0',
    
    // Bahasa default
    defaultLang: import.meta.env.VITE_DEFAULT_LANG || 'id',
    supportedLangs: ['id', 'ar'],
    
    // Tema default
    defaultTheme: 'light',
    
    // Timeout session (detik)
    sessionTimeout: 3600,
    
    // Max login attempts
    maxLoginAttempts: 5,
    
    // Password minimal
    passwordMinLength: 8,
    
    // PWA
    pwa: {
      enabled: true,
      cacheName: 'plb-v1'
    }
  }
  
  export default Object.freeze(appConfig)