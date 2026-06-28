// src/components/layout/bottomNav.js
import permissionManager from '../../core/auth/permissionManager.js'

export function renderBottomNav() {
  const currentHash = window.location.hash || '#/dashboard'
  
  const menus = [
    { id: 'home', icon: 'home', label: 'Beranda', href: '#/dashboard', show: true },
    { id: 'input', icon: 'edit', label: 'Input', href: '#/input', show: true },
    { id: 'divisions', icon: 'grid', label: 'Divisi', href: '#/divisions', show: permissionManager.canManageDivisions() },
    { id: 'profile', icon: 'user', label: 'Profil', href: '#/profile', show: true },
    { id: 'admin', icon: 'settings', label: 'Admin', href: '#/admin', show: permissionManager.canAccess('user_management') }
  ]
  
  const visibleMenus = menus.filter(m => m.show).slice(0, 5)
  
  return `
    <nav class="bottom-nav">
      ${visibleMenus.map(m => {
        const isActive = currentHash === m.href || (m.href === '#/dashboard' && currentHash === '#/')
        return `
          <a href="${m.href}" class="nav-item ${isActive ? 'active' : ''}" data-nav="${m.id}">
            <span class="nav-icon">${getIconSVG(m.icon, isActive)}</span>
            <span class="nav-label">${m.label}</span>
          </a>
        `
      }).join('')}
    </nav>
  `
}

function getIconSVG(name, isActive) {
  const color = isActive ? '#0f766e' : '#94a3b8'
  
  const icons = {
    home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    edit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    grid: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  }
  
  return icons[name] || icons.home
}

export function initBottomNavEvents() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const ripple = document.createElement('span')
      ripple.className = 'nav-ripple'
      this.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    })
  })
}