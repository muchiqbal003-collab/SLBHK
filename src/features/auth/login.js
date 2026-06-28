// src/features/auth/login.js
import userStore from '../../core/store/userStore.js'
import appState from '../../core/store/appState.js'

export function renderLoginPage() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">🕌</div>
          <h1>Pesantren Lansia Bahagia</h1>
          <p>Silakan masuk untuk melanjutkan</p>
        </div>
        
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="nama@email.com" 
              required 
              autocomplete="email"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Masukkan password" 
              required 
              minlength="8"
            >
          </div>
          
          <div id="loginError" class="error-message" style="display:none;"></div>
          
          <button type="submit" class="btn btn-primary" id="loginBtn">
            <span class="btn-text">Masuk</span>
            <span class="btn-loading" style="display:none;">Memproses...</span>
          </button>
        </form>
        
        <div class="login-footer">
          <button id="themeToggle" class="btn-text">🌙 Mode Gelap</button>
          <button id="langToggle" class="btn-text">🇸🇦 العربية</button>
        </div>
      </div>
    </div>
  `
}

export function initLoginEvents() {
  const form = document.getElementById('loginForm')
  const errorDiv = document.getElementById('loginError')
  const loginBtn = document.getElementById('loginBtn')
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    // Validasi
    if (!email || !password) {
      showError('Email dan password wajib diisi')
      return
    }
    
    if (password.length < 8) {
      showError('Password minimal 8 karakter')
      return
    }
    
    // Loading state
    setLoading(true)
    hideError()
    
    try {
      await userStore.login(email, password)
      
      // Redirect ke dashboard
      window.location.hash = '#/dashboard'
      
    } catch (error) {
      let message = 'Login gagal, coba lagi'
      
      if (error.message.includes('Invalid login')) {
        message = 'Email atau password salah'
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Email belum dikonfirmasi'
      }
      
      showError(message)
    } finally {
      setLoading(false)
    }
  })
  
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = appState.getState().theme
    appState.setTheme(current === 'light' ? 'dark' : 'light')
  })
  
  function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
  }
  
  function hideError() {
    errorDiv.style.display = 'none'
  }
  
  function setLoading(loading) {
    loginBtn.disabled = loading
    loginBtn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline'
    loginBtn.querySelector('.btn-loading').style.display = loading ? 'inline' : 'none'
  }
}