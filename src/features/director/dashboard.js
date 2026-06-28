// src/features/director/dashboard.js
// Director Dashboard - Tampilan Khusus Director
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import { renderHeader, initHeaderEvents } from '../../components/layout/header.js'

export async function renderDirectorDashboard() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user || user.role !== 'director') {
    window.location.hash = '#/unauthorized'
    return ''
  }
  
  const stats = await fetchDirectorStats()
  
  return `
    <div class="director-dashboard">
      ${renderHeader()}
      
      <main class="main-content">
        <div class="director-container">
          
          <!-- Header Director -->
          <div class="director-header">
            <div>
              <h1>👑 Director Dashboard</h1>
              <p>Selamat datang, ${user.name}</p>
            </div>
            <button id="directorLogout" class="btn btn-outline" style="color:#ef4444;">🚪 Logout</button>
          </div>
          
          <!-- Quick Stats -->
          <div class="director-stats">
            <div class="director-stat-card gold">
              <h3>👥 Total User</h3>
              <p>${stats.totalUsers}</p>
            </div>
            <div class="director-stat-card blue">
              <h3>🏢 Divisi Aktif</h3>
              <p>${stats.activeDivisions}</p>
            </div>
            <div class="director-stat-card green">
              <h3>✅ Checklist</h3>
              <p>${stats.checklistDone}%</p>
            </div>
            <div class="director-stat-card orange">
              <h3>📋 Laporan</h3>
              <p>${stats.newLaporans}</p>
            </div>
          </div>
          
          <!-- Menu Grid -->
          <div class="director-menu">
            <h2>⚡ Quick Access</h2>
            <div class="director-menu-grid">
              <a href="#/admin/users" class="director-menu-item">
                <span>👥</span>
                <strong>Manajemen User</strong>
                <small>Kelola semua user</small>
              </a>
              <a href="#/admin/monitoring" class="director-menu-item">
                <span>📊</span>
                <strong>Monitoring</strong>
                <small>Pantau semua divisi</small>
              </a>
              <a href="#/admin/ibadah" class="director-menu-item">
                <span>🕌</span>
                <strong>Rekap Ibadah</strong>
                <small>Sholat & Tilawah</small>
              </a>
              <a href="#/admin/laporan" class="director-menu-item">
                <span>📋</span>
                <strong>Laporan</strong>
                <small>Semua laporan</small>
              </a>
              <a href="#/divisions" class="director-menu-item">
                <span>🏢</span>
                <strong>Divisi</strong>
                <small>Kelola divisi</small>
              </a>
              <a href="#/dashboard" class="director-menu-item">
                <span>📱</span>
                <strong>User View</strong>
                <small>Lihat tampilan user</small>
              </a>
            </div>
          </div>
          
          <!-- Kondisi Divisi -->
          <div class="card" style="margin-top:1.5rem;">
            <h3>📊 Kondisi Seluruh Divisi</h3>
            <div class="monitoring-grid" id="directorDivisions" style="margin-top:1rem;">
              <p>Memuat...</p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `
}

async function fetchDirectorStats() {
  const supabase = initSupabase()
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeDivisions } = await supabase.from('divisions').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const today = new Date().toISOString().split('T')[0]
  const { count: newLaporans } = await supabase.from('laporan_kinerja').select('*', { count: 'exact', head: true }).gte('created_at', today)
  const { data: checklists } = await supabase.from('division_checklists').select('*')
  const total = checklists?.length || 0
  const checked = checklists?.filter(c => c.is_checked).length || 0
  const checklistDone = total > 0 ? Math.round((checked / total) * 100) : 0
  
  return { totalUsers: totalUsers || 0, activeDivisions: activeDivisions || 0, newLaporans: newLaporans || 0, checklistDone }
}

export function initDirectorDashboardEvents() {
  initHeaderEvents()
  
  document.getElementById('directorLogout')?.addEventListener('click', async () => {
    if (confirm('Yakin logout?')) {
      await userStore.logout()
      window.location.hash = '#/login'
    }
  })
  
  // Load divisi
  loadDirectorDivisions()
}

async function loadDirectorDivisions() {
  const supabase = initSupabase()
  const { data } = await supabase.from('divisions').select('*').eq('is_active', true)
  const container = document.getElementById('directorDivisions')
  if (!container) return
  
  const divisions = await Promise.all((data || []).map(async (d) => {
    const { count } = await supabase.from('user_divisions').select('*', { count: 'exact', head: true }).eq('division_id', d.id)
    return { ...d, memberCount: count || 0 }
  }))
  
  container.innerHTML = divisions.map(d => `
    <div class="monitoring-card">
      <div class="monitoring-status">🟢</div>
      <strong>${d.name}</strong>
      <small>👥 ${d.memberCount} anggota</small>
    </div>
  `).join('')
}