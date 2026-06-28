// src/components/layout/header.js
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import permissionManager from '../../core/auth/permissionManager.js'

export function renderHeader() {
  const state = appState.getState()
  const user = state.currentUser
  const division = state.currentDivision
  
  if (!user) return ''
  
  const roleLabel = permissionManager.getRoleLabel()
  const divisionName = division?.name || 'Pesantren'
  
  return `
    <header class="app-header">
      <div class="header-left">
        <button id="sidebarToggle" class="icon-btn sidebar-toggle" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="app-logo">
          <span class="logo-icon">🕌</span>
          <span class="logo-text">PLBMS</span>
        </h1>
      </div>
      
      <div class="header-center">
        <span class="badge badge-role">${roleLabel}</span>
        <span class="badge badge-division">${divisionName}</span>
      </div>
      
      <div class="header-right">
        <button id="themeToggle" class="icon-btn" title="Tema" aria-label="Ganti tema">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button id="headerMenuBtn" class="icon-btn" title="Menu" aria-label="Menu pengguna">
          <div class="dash-avatar" style="width:32px;height:32px;font-size:0.8rem;">
            ${user.avatar_url ? `<img src="${user.avatar_url}" alt="Foto">` : '<span>👤</span>'}
          </div>
        </button>
      </div>
    </header>
    
    <!-- Dropdown Menu -->
    <div id="headerDropdown" class="header-dropdown" style="display:none;">
      <div class="dropdown-user">
        <div class="dropdown-avatar">👤</div>
        <div>
          <strong>${user.name}</strong>
          <p style="font-size:0.75rem;color:var(--text-muted);">${user.email}</p>
        </div>
      </div>
      <hr>
      <a href="#/profile" class="dropdown-item">👤 Profil Saya</a>
      <a href="#/dashboard" class="dropdown-item">🏠 Dashboard</a>
      <hr>
      <button id="headerLogoutBtn" class="dropdown-item" style="width:100%;text-align:left;background:none;border:none;color:#ef4444;font-size:0.9rem;cursor:pointer;padding:0.75rem;">
        🚪 Keluar
      </button>
    </div>
  `
}

export function initHeaderEvents() {
  // Sidebar toggle
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open')
  })
  
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const state = appState.getState()
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    appState.setTheme(newTheme)
  })
  
  // Dropdown toggle
  const menuBtn = document.getElementById('headerMenuBtn')
  const dropdown = document.getElementById('headerDropdown')
  
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
  })
  
  document.addEventListener('click', () => {
    if (dropdown) dropdown.style.display = 'none'
  })
  
  // Logout
  document.getElementById('headerLogoutBtn')?.addEventListener('click', async () => {
    if (confirm('Yakin ingin keluar?')) {
      await userStore.logout()
      window.location.hash = '#/login'
    }
  })
}