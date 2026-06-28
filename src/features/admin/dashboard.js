// src/features/admin/dashboard.js
// Admin Dashboard - Pusat Data Khusus Admin
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import permissionManager from '../../core/auth/permissionManager.js'
import { renderHeader, initHeaderEvents } from '../../components/layout/header.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

export async function renderAdminDashboard() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user || !['director', 'admin'].includes(user.role)) {
    window.location.hash = '#/unauthorized'
    return ''
  }
  
  // Fetch semua data
  const stats = await fetchAllStats()
  const users = await fetchUsers()
  const divisions = await fetchDivisions()
  
  return `
    <div class="admin-dashboard">
      ${renderHeader()}
      
      <main class="main-content">
        <div class="admin-db-container">
          
          <!-- Header -->
          <div class="admin-db-header">
            <div>
              <h1>⚙️ Admin Dashboard</h1>
              <p>Pusat Kendali PLBMS</p>
            </div>
            <div class="admin-db-actions">
              <a href="#/dashboard" class="btn btn-outline">📱 User View</a>
              <button id="adminLogoutBtn" class="btn btn-outline" style="color:#ef4444; border-color:#ef4444;">🚪 Logout</button>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="admin-stats-grid">
            <div class="admin-stat-card" style="border-top:3px solid #0f766e;">
              <div class="admin-stat-icon">👥</div>
              <div class="admin-stat-info">
                <h3>Total User</h3>
                <p class="admin-stat-value">${stats.totalUsers}</p>
              </div>
            </div>
            <div class="admin-stat-card" style="border-top:3px solid #2563eb;">
              <div class="admin-stat-icon">🏢</div>
              <div class="admin-stat-info">
                <h3>Divisi Aktif</h3>
                <p class="admin-stat-value">${stats.activeDivisions}</p>
              </div>
            </div>
            <div class="admin-stat-card" style="border-top:3px solid #f59e0b;">
              <div class="admin-stat-icon">📋</div>
              <div class="admin-stat-info">
                <h3>Laporan Baru</h3>
                <p class="admin-stat-value">${stats.newLaporans}</p>
              </div>
            </div>
            <div class="admin-stat-card" style="border-top:3px solid #22c55e;">
              <div class="admin-stat-icon">✅</div>
              <div class="admin-stat-info">
                <h3>Checklist Selesai</h3>
                <p class="admin-stat-value">${stats.checklistDone}%</p>
              </div>
            </div>
          </div>
          
          <!-- Menu Grid -->
          <div class="admin-menu-grid">
            <a href="#/admin/users" class="admin-menu-card">
              <span class="admin-menu-icon">👥</span>
              <strong>Manajemen User</strong>
              <small>Tambah, edit, hapus user</small>
            </a>
            <a href="#/admin/roles" class="admin-menu-card">
              <span class="admin-menu-icon">🔑</span>
              <strong>Role & Permission</strong>
              <small>Atur hak akses</small>
            </a>
            <a href="#/divisions" class="admin-menu-card">
              <span class="admin-menu-icon">🏢</span>
              <strong>Kelola Divisi</strong>
              <small>Tambah & atur divisi</small>
            </a>
            <a href="#/admin/monitoring" class="admin-menu-card">
              <span class="admin-menu-icon">📊</span>
              <strong>Monitoring</strong>
              <small>Pantau semua divisi</small>
            </a>
            <a href="#/admin/ibadah" class="admin-menu-card">
              <span class="admin-menu-icon">🕌</span>
              <strong>Rekap Ibadah</strong>
              <small>Sholat & Tilawah</small>
            </a>
            <a href="#/admin/laporan" class="admin-menu-card">
              <span class="admin-menu-icon">📋</span>
              <strong>Laporan Kinerja</strong>
              <small>Semua laporan masuk</small>
            </a>
          </div>
          
          <!-- User Terbaru -->
          <div class="card" style="margin-top:1.5rem;">
            <h3>👥 User Terbaru</h3>
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr><th>Nama</th><th>Email</th><th>Role</th><th>Divisi</th></tr>
                </thead>
                <tbody>
                  ${users.slice(0, 5).map(u => `
                    <tr>
                      <td><strong>${u.name}</strong></td>
                      <td>${u.email}</td>
                      <td><span class="badge badge-role">${u.role}</span></td>
                      <td>${u.division_names || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Divisi Aktif -->
          <div class="card" style="margin-top:1rem;">
            <h3>🏢 Divisi Aktif</h3>
            <div class="monitoring-grid" style="margin-top:0.5rem;">
              ${divisions.map(d => `
                <div class="monitoring-card">
                  <div class="monitoring-status">${d.statusIcon}</div>
                  <strong>${d.name}</strong>
                  <small>👥 ${d.memberCount} anggota</small>
                </div>
              `).join('')}
            </div>
          </div>
          
        </div>
      </main>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// FETCH
// =============================================
async function fetchAllStats() {
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

async function fetchUsers() {
  const supabase = initSupabase()
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
  if (!data) return []
  
  return await Promise.all(data.map(async (u) => {
    const { data: divs } = await supabase.from('user_divisions').select('division_id, divisions(name)').eq('user_id', u.id)
    return { ...u, division_names: divs?.map(d => d.divisions?.name).join(', ') || '-' }
  }))
}

async function fetchDivisions() {
  const supabase = initSupabase()
  const { data } = await supabase.from('divisions').select('*').eq('is_active', true)
  if (!data) return []
  
  return await Promise.all(data.map(async (d) => {
    const { count } = await supabase.from('user_divisions').select('*', { count: 'exact', head: true }).eq('division_id', d.id)
    const { data: checklists } = await supabase.from('division_checklists').select('*').eq('division_id', d.id)
    const total = checklists?.length || 0
    const checked = checklists?.filter(c => c.is_checked).length || 0
    const pct = total > 0 ? Math.round((checked / total) * 100) : 100
    let statusIcon = '🟢'
    if (pct < 50) statusIcon = '🔴'
    else if (pct < 80) statusIcon = '🟡'
    return { ...d, memberCount: count || 0, statusIcon }
  }))
}

// =============================================
// EVENTS
// =============================================
export function initAdminDashboardEvents() {
  initHeaderEvents()
  initBottomNavEvents()
  
  document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
    if (confirm('Yakin ingin logout?')) {
      await userStore.logout()
      window.location.hash = '#/login'
    }
  })
}

// =============================================
// CSS (tambah di main.css)
// =============================================
export const adminDashboardCSS = `
.admin-db-container { max-width:1000px; margin:0 auto; padding:1.5rem; padding-bottom:100px; }
.admin-db-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.admin-db-header h1 { font-size:1.5rem; }
.admin-db-actions { display:flex; gap:0.5rem; }
.admin-stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; margin-bottom:1.5rem; }
.admin-stat-card { background:var(--bg-card); padding:1.25rem; border-radius:var(--radius); box-shadow:var(--shadow); display:flex; align-items:center; gap:1rem; }
.admin-stat-icon { font-size:2rem; }
.admin-stat-info h3 { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; }
.admin-stat-value { font-size:1.8rem; font-weight:700; }
.admin-menu-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:0.75rem; }
.admin-menu-card { background:var(--bg-card); padding:1.25rem; border-radius:var(--radius); box-shadow:var(--shadow); text-decoration:none; color:var(--text); display:flex; flex-direction:column; gap:0.25rem; transition:all var(--transition); border:2px solid transparent; }
.admin-menu-card:hover { transform:translateY(-3px); border-color:var(--primary); box-shadow:var(--shadow-lg); }
.admin-menu-icon { font-size:2rem; }
.admin-menu-card strong { font-size:0.9rem; }
.admin-menu-card small { font-size:0.7rem; color:var(--text-muted); }
`;