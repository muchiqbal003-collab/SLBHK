// src/core/router/router.js
// Hash Router - PLBMS Role-Based Views
import appState from '../store/appState.js'
import userStore from '../store/userStore.js'
import permissionManager from '../auth/permissionManager.js'
import { ROLES } from '../../config/permissions.js'

// =============================================
// ALL ROUTES
// =============================================
const routes = {
  // ===== AUTH =====
  login: { 
    path: '#/login', 
    title: 'Login', 
    requireAuth: false 
  },
  
  // ===== ROLE-BASED DASHBOARDS =====
  director: { 
    path: '#/director', 
    title: '👑 Director Dashboard', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR] 
  },
  admin: { 
    path: '#/admin', 
    title: '⚙️ Admin Dashboard', 
    requireAuth: true, 
    allowedRoles: [ROLES.ADMIN] 
  },
  koordinator: { 
    path: '#/koordinator', 
    title: '👨‍💼 Koordinator Dashboard', 
    requireAuth: true, 
    allowedRoles: [ROLES.KOORDINATOR] 
  },
  dashboard: { 
    path: '#/dashboard', 
    title: '📱 Dashboard', 
    requireAuth: true 
  },
  
  // ===== INPUT HARIAN =====
  input: { 
    path: '#/input', 
    title: '📝 Input Harian', 
    requireAuth: true 
  },
  inputSholat: { 
    path: '#/input/sholat', 
    title: '🕌 Absensi Sholat', 
    requireAuth: true 
  },
  inputTilawah: { 
    path: '#/input/tilawah', 
    title: '📖 Tilawah', 
    requireAuth: true 
  },
  inputLaporan: { 
    path: '#/input/laporan', 
    title: '📋 Laporan Kinerja', 
    requireAuth: true 
  },
  
  // ===== 10 DIVISI =====
  academy: { 
    path: '#/academy', 
    title: '📚 Academy', 
    requireAuth: true 
  },
  finance: { 
    path: '#/finance', 
    title: '💰 Finance', 
    requireAuth: true 
  },
  secretary: { 
    path: '#/secretary', 
    title: '📝 Secretary', 
    requireAuth: true 
  },
  event: { 
    path: '#/event', 
    title: '🎉 Event', 
    requireAuth: true 
  },
  cleanliness: { 
    path: '#/cleanliness', 
    title: '🧹 Cleanliness', 
    requireAuth: true 
  },
  facilities: { 
    path: '#/facilities', 
    title: '🛠 Facilities', 
    requireAuth: true 
  },
  transportation: { 
    path: '#/transportation', 
    title: '🚐 Transportation', 
    requireAuth: true 
  },
  fnb: { 
    path: '#/fnb', 
    title: '🍽 F&B', 
    requireAuth: true 
  },
  media: { 
    path: '#/media', 
    title: '📷 Media', 
    requireAuth: true 
  },
  medical: { 
    path: '#/medical', 
    title: '🩺 Medical', 
    requireAuth: true 
  },
  
  // ===== ADMIN SUB-MENUS =====
  adminUsers: { 
    path: '#/admin/users', 
    title: '👥 Manajemen User', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR, ROLES.ADMIN] 
  },
  adminDivisions: { 
    path: '#/divisions', 
    title: '🏢 Kelola Divisi', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR, ROLES.ADMIN] 
  },
  adminMonitoring: { 
    path: '#/admin/monitoring', 
    title: '📊 Monitoring', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR, ROLES.ADMIN] 
  },
  adminIbadah: { 
    path: '#/admin/ibadah', 
    title: '🕌 Rekap Ibadah', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR, ROLES.ADMIN] 
  },
  adminLaporan: { 
    path: '#/admin/laporan', 
    title: '📋 Laporan Kinerja', 
    requireAuth: true, 
    allowedRoles: [ROLES.DIRECTOR, ROLES.ADMIN] 
  },
  
  // ===== PROFILE =====
  profile: { 
    path: '#/profile', 
    title: '👤 Profil', 
    requireAuth: true 
  },
  
  // ===== ERROR =====
  unauthorized: { 
    path: '#/unauthorized', 
    title: '🚫 Akses Ditolak', 
    requireAuth: false 
  }
}

// =============================================
// ROUTER CLASS
// =============================================
class Router {
  constructor() {
    this.currentRoute = null
    this.isNavigating = false
    this.previousRoute = null
  }
  
  init() {
    window.addEventListener('hashchange', () => this.handleRoute())
    
    if (!window.location.hash) {
      window.location.hash = '#/login'
    } else {
      this.handleRoute()
    }
    
    console.log('🗺️ Router PLBMS initialized - Role-Based Views')
  }
  
  async handleRoute() {
    if (this.isNavigating) return
    
    const hash = window.location.hash || '#/login'
    const route = this.findRoute(hash)
    
    if (!route) {
      console.warn('Route tidak ditemukan:', hash)
      this.navigate('#/dashboard')
      return
    }
    
    this.isNavigating = true
    this.previousRoute = this.currentRoute
    
    appState.setLoading(true)
    document.title = `${route.title} - PLBMS`
    
    // Auth check
    if (route.requireAuth) {
      const isLoggedIn = await userStore.checkSession()
      
      if (!isLoggedIn) {
        this.navigate('#/login')
        this.isNavigating = false
        return
      }
      
      // Role check
      if (route.allowedRoles) {
        const user = appState.getState().currentUser
        if (!user || !route.allowedRoles.includes(user.role)) {
          this.navigate('#/unauthorized')
          this.isNavigating = false
          return
        }
      }
      
      const user = appState.getState().currentUser
      if (user) permissionManager.setUser(user)
    }
    
    await this.renderRoute(hash)
    
    this.currentRoute = hash
    appState.setLoading(false)
    this.isNavigating = false
    window.scrollTo(0, 0)
  }
  
  findRoute(hash) {
    // Exact match
    const exact = Object.values(routes).find(r => r.path === hash)
    if (exact) return exact
    
    // Prefix match
    const prefix = Object.values(routes).find(r => hash.startsWith(r.path + '/'))
    return prefix || null
  }
  
  // =============================================
  // RENDER SWITCH
  // =============================================
  async renderRoute(hash) {
    const app = document.getElementById('app')
    
    switch (hash) {
      // ===== AUTH =====
      case '#/login':
        await this.renderLogin(app)
        break
        
      // ===== ROLE-BASED DASHBOARDS =====
      case '#/director':
        await this.renderDirectorDashboard(app)
        break
      case '#/admin':
        await this.renderAdminDashboard(app)
        break
      case '#/koordinator':
        await this.renderKoordinatorDashboard(app)
        break
      case '#/dashboard':
        await this.renderUserDashboard(app)
        break
        
      // ===== INPUT HARIAN =====
      case '#/input':
        await this.renderInputMenu(app)
        break
      case '#/input/sholat':
        await this.renderInputSholat(app)
        break
      case '#/input/tilawah':
        await this.renderInputTilawah(app)
        break
      case '#/input/laporan':
        await this.renderInputLaporan(app)
        break
        
      // ===== 10 DIVISI =====
      case '#/academy':
        await this.renderAcademy(app)
        break
      case '#/finance':
        await this.renderFinance(app)
        break
      case '#/secretary':
        await this.renderSecretary(app)
        break
      case '#/event':
        await this.renderEvent(app)
        break
      case '#/cleanliness':
        await this.renderCleanliness(app)
        break
      case '#/facilities':
        await this.renderFacilities(app)
        break
      case '#/transportation':
        await this.renderTransportation(app)
        break
      case '#/fnb':
        await this.renderFNB(app)
        break
      case '#/media':
        await this.renderMedia(app)
        break
      case '#/medical':
        await this.renderMedical(app)
        break
        
      // ===== ADMIN SUB-MENUS =====
      case '#/admin/users':
        await this.renderAdminUsers(app)
        break
      case '#/divisions':
        await this.renderDivisions(app)
        break
      case '#/admin/monitoring':
        await this.renderMonitoring(app)
        break
      case '#/admin/ibadah':
        await this.renderIbadah(app)
        break
      case '#/admin/laporan':
        await this.renderLaporan(app)
        break
        
      // ===== PROFILE =====
      case '#/profile':
        await this.renderProfile(app)
        break
        
      // ===== ERROR =====
      case '#/unauthorized':
        this.renderUnauthorized(app)
        break
        
      default:
        this.render404(app, hash)
    }
  }
  
  // =============================================
  // AUTH
  // =============================================
  async renderLogin(app) {
    const { renderLoginPage, initLoginEvents } = await import('../../features/auth/login.js')
    app.innerHTML = renderLoginPage()
    initLoginEvents()
  }
  
  // =============================================
  // ROLE-BASED DASHBOARDS
  // =============================================
  
  // Director Dashboard (Khusus Director)
  async renderDirectorDashboard(app) {
    const { renderDirectorDashboard, initDirectorDashboardEvents } = await import('../../features/director/dashboard.js')
    app.innerHTML = await renderDirectorDashboard()
    initDirectorDashboardEvents()
  }
  
  // Admin Dashboard (Khusus Admin)
  async renderAdminDashboard(app) {
    const { renderAdminDashboard, initAdminDashboardEvents } = await import('../../features/admin/dashboard.js')
    app.innerHTML = await renderAdminDashboard()
    initAdminDashboardEvents()
  }
  
  // Koordinator Dashboard (Khusus Koordinator)
  async renderKoordinatorDashboard(app) {
    const { renderKoordinatorDashboard, initKoordinatorDashboardEvents } = await import('../../features/koordinator/dashboard.js')
    app.innerHTML = await renderKoordinatorDashboard()
    initKoordinatorDashboardEvents()
  }
  
  // User Dashboard (Anggota biasa)
  async renderUserDashboard(app) {
    const { renderDashboard, initDashboardEvents } = await import('../../features/dashboard/dashboard.js')
    app.innerHTML = await renderDashboard()
    initDashboardEvents()
  }
  
  // =============================================
  // INPUT HARIAN
  // =============================================
  async renderInputMenu(app) {
    const { renderInputMenu, initInputMenuEvents } = await import('../../features/shared/inputHarian.js')
    app.innerHTML = await renderInputMenu()
    initInputMenuEvents()
  }
  
  async renderInputSholat(app) {
    const { renderInputSholat, initInputSholatEvents } = await import('../../features/shared/inputHarian.js')
    app.innerHTML = await renderInputSholat()
    initInputSholatEvents()
  }
  
  async renderInputTilawah(app) {
    const { renderInputTilawah, initInputTilawahEvents } = await import('../../features/shared/inputHarian.js')
    app.innerHTML = await renderInputTilawah()
    initInputTilawahEvents()
  }
  
  async renderInputLaporan(app) {
    const { renderInputLaporan, initInputLaporanEvents } = await import('../../features/shared/inputHarian.js')
    app.innerHTML = await renderInputLaporan()
    initInputLaporanEvents()
  }
  
  // =============================================
  // 10 DIVISI
  // =============================================
  async renderAcademy(app) {
    const { renderAcademy, initAcademyEvents } = await import('../../features/divisions/academy.js')
    app.innerHTML = await renderAcademy()
    initAcademyEvents()
  }
  
  async renderFinance(app) {
    const { renderFinance, initFinanceEvents } = await import('../../features/divisions/finance.js')
    app.innerHTML = await renderFinance()
    initFinanceEvents()
  }
  
  async renderSecretary(app) {
    const { renderSecretary, initSecretaryEvents } = await import('../../features/divisions/secretary.js')
    app.innerHTML = await renderSecretary()
    initSecretaryEvents()
  }
  
  async renderEvent(app) {
    const { renderEvent, initEventEvents } = await import('../../features/divisions/event.js')
    app.innerHTML = await renderEvent()
    initEventEvents()
  }
  
  async renderCleanliness(app) {
    const { renderCleanliness, initCleanlinessEvents } = await import('../../features/divisions/cleanliness.js')
    app.innerHTML = await renderCleanliness()
    initCleanlinessEvents()
  }
  
  async renderFacilities(app) {
    const { renderFacilities, initFacilitiesEvents } = await import('../../features/divisions/facilities.js')
    app.innerHTML = await renderFacilities()
    initFacilitiesEvents()
  }
  
  async renderTransportation(app) {
    const { renderTransportation, initTransportationEvents } = await import('../../features/divisions/transportation.js')
    app.innerHTML = await renderTransportation()
    initTransportationEvents()
  }
  
  async renderFNB(app) {
    const { renderFNB, initFNBEvents } = await import('../../features/divisions/fnb.js')
    app.innerHTML = await renderFNB()
    initFNBEvents()
  }
  
  async renderMedia(app) {
    const { renderMedia, initMediaEvents } = await import('../../features/divisions/media.js')
    app.innerHTML = await renderMedia()
    initMediaEvents()
  }
  
  async renderMedical(app) {
    const { renderMedical, initMedicalEvents } = await import('../../features/divisions/medical.js')
    app.innerHTML = await renderMedical()
    initMedicalEvents()
  }
  
  // =============================================
  // ADMIN SUB-MENUS
  // =============================================
  async renderAdminUsers(app) {
    const { renderAdminPanel, initAdminEvents } = await import('../../features/admin/userManagement.js')
    app.innerHTML = await renderAdminPanel()
    initAdminEvents()
  }
  
  async renderDivisions(app) {
    const { renderDivisionManagement, initDivisionEvents } = await import('../../features/admin/divisionSetup.js')
    app.innerHTML = await renderDivisionManagement()
    initDivisionEvents()
  }
  
  async renderMonitoring(app) {
    const { renderAdminPanel, initAdminEvents } = await import('../../features/admin/userManagement.js')
    app.innerHTML = await renderAdminPanel()
    initAdminEvents()
    setTimeout(() => {
      document.querySelector('.tab[data-tab="monitoring"]')?.click()
    }, 100)
  }
  
  async renderIbadah(app) {
    const { renderAdminPanel, initAdminEvents } = await import('../../features/admin/userManagement.js')
    app.innerHTML = await renderAdminPanel()
    initAdminEvents()
    setTimeout(() => {
      document.querySelector('.tab[data-tab="ibadah"]')?.click()
    }, 100)
  }
  
  async renderLaporan(app) {
    const { renderAdminPanel, initAdminEvents } = await import('../../features/admin/userManagement.js')
    app.innerHTML = await renderAdminPanel()
    initAdminEvents()
    setTimeout(() => {
      document.querySelector('.tab[data-tab="laporan"]')?.click()
    }, 100)
  }
  
  // =============================================
  // PROFILE
  // =============================================
  async renderProfile(app) {
    const { renderProfile, initProfileEvents } = await import('../../features/shared/profile.js')
    app.innerHTML = await renderProfile()
    initProfileEvents()
  }
  
  // =============================================
  // ERROR PAGES
  // =============================================
  renderUnauthorized(app) {
    app.innerHTML = `
      <div class="error-page">
        <div class="error-content">
          <div class="error-icon">🚫</div>
          <h1>Akses Ditolak</h1>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button onclick="window.location.hash='#/dashboard'" class="btn btn-primary" style="margin-top:1.5rem; max-width:300px;">
            ← Kembali
          </button>
        </div>
      </div>
    `
  }
  
  render404(app, hash) {
    app.innerHTML = `
      <div class="error-page">
        <div class="error-content">
          <div class="error-icon">🔍</div>
          <h1>404</h1>
          <h2>Halaman Tidak Ditemukan</h2>
          <p style="font-family:monospace; background:var(--bg); padding:0.5rem; border-radius:8px;">${hash}</p>
          <button onclick="window.location.hash='#/dashboard'" class="btn btn-primary" style="margin-top:1.5rem; max-width:300px;">
            ← Kembali
          </button>
        </div>
      </div>
    `
  }
  
  // =============================================
  // NAVIGATION
  // =============================================
  navigate(hash) { 
    window.location.hash = hash 
  }
  
  back() {
    if (this.previousRoute) {
      this.navigate(this.previousRoute)
    } else {
      this.navigate('#/dashboard')
    }
  }
  
  getCurrentRoute() { 
    return this.currentRoute 
  }
  
  getRouteTitle() {
    const route = this.findRoute(this.currentRoute)
    return route?.title || 'PLBMS'
  }
}

// =============================================
// EXPORT
// =============================================
const router = new Router()

export function initRouter() { 
  router.init() 
}

export default router