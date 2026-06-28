// src/components/layout/sidebar.js
import permissionManager from '../../core/auth/permissionManager.js'

export function renderSidebar() {
  const currentHash = window.location.hash || '#/dashboard'
  
  const menus = [
    { icon: '🏠', label: 'Dashboard', href: '#/dashboard', show: true },
    { icon: '📝', label: 'Input Harian', href: '#/input', show: true },
    { icon: '📚', label: 'Academy', href: '#/academy', show: true },
    { icon: '💰', label: 'Finance', href: '#/finance', show: true },
    { icon: '📋', label: 'Secretary', href: '#/secretary', show: true },
    { icon: '🎉', label: 'Event', href: '#/event', show: true },
    { icon: '🧹', label: 'Cleanliness', href: '#/cleanliness', show: true },
    { icon: '🛠', label: 'Facilities', href: '#/facilities', show: true },
    { icon: '🚐', label: 'Transport', href: '#/transportation', show: true },
    { icon: '🍽', label: 'F&B', href: '#/fnb', show: true },
    { icon: '📷', label: 'Media', href: '#/media', show: true },
    { icon: '🩺', label: 'Medical', href: '#/medical', show: true },
    { type: 'divider' },
    { icon: '👤', label: 'Profil', href: '#/profile', show: true },
    { icon: '⚙️', label: 'Admin', href: '#/admin', show: permissionManager.canAccess('user_management') }
  ]
  
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <span>🕌</span>
        <span>PLBMS</span>
        <button class="sidebar-close icon-btn" id="sidebarClose" style="margin-left:auto;">✕</button>
      </div>
      
      <nav class="sidebar-nav">
        ${menus.map(m => {
          if (m.type === 'divider') return '<div class="sidebar-divider"></div>'
          if (!m.show) return ''
          const isActive = currentHash === m.href
          return `
            <a href="${m.href}" class="sidebar-item ${isActive ? 'active' : ''}">
              <span class="sidebar-icon">${m.icon}</span>
              <span class="sidebar-label">${m.label}</span>
            </a>
          `
        }).join('')}
      </nav>
      
      <div class="sidebar-footer">
        <small>PLBMS v1.0.0</small>
      </div>
    </aside>
  `
}

export function initSidebarEvents() {
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open')
  })
  
  // Close sidebar on click outside (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && e.target.id !== 'sidebarToggle') {
      sidebar.classList.remove('open')
    }
  })
}