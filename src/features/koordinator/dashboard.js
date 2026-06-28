// src/features/koordinator/dashboard.js
// Koordinator Dashboard
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import { renderHeader, initHeaderEvents } from '../../components/layout/header.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

export async function renderKoordinatorDashboard() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user || user.role !== 'koordinator_divisi') {
    window.location.hash = '#/unauthorized'
    return ''
  }
  
  const anggotaData = await fetchAnggotaDivisi(user.id)
  
  return `
    <div class="koordinator-dashboard">
      ${renderHeader()}
      
      <main class="main-content">
        <div style="max-width:800px; margin:0 auto; padding:1.5rem; padding-bottom:100px;">
          
          <div style="background:linear-gradient(135deg,#0f766e,#2dd4bf); color:white; padding:2rem; border-radius:20px; margin-bottom:1.5rem;">
            <h1>👨‍💼 Koordinator Dashboard</h1>
            <p style="color:rgba(255,255,255,0.9);">${user.divisions?.name || 'Divisi Anda'}</p>
          </div>
          
          <div class="card" style="margin-bottom:1rem;">
            <h3>👥 Anggota Divisi</h3>
            <div id="anggotaList">
              ${renderAnggotaList(anggotaData)}
            </div>
          </div>
          
          <div class="card" style="margin-bottom:1rem;">
            <h3>🕌 Ibadah Anggota (7 Hari)</h3>
            <div id="ibadahAnggota">
              <p style="text-align:center; color:var(--text-muted);">Memuat...</p>
            </div>
          </div>
          
          <div class="card">
            <h3>📋 Menu</h3>
            <div class="quick-menu-grid" style="margin-top:0.5rem;">
              <a href="#/input" class="quick-menu-card" style="background:#e0f2fe;">
                <span style="font-size:2rem;">📝</span>
                <span style="font-weight:600;">Input Harian</span>
              </a>
              <a href="#/dashboard" class="quick-menu-card" style="background:#f0fdf4;">
                <span style="font-size:2rem;">📱</span>
                <span style="font-weight:600;">User View</span>
              </a>
              <a href="#/profile" class="quick-menu-card" style="background:#fef3c7;">
                <span style="font-size:2rem;">👤</span>
                <span style="font-weight:600;">Profil</span>
              </a>
            </div>
          </div>
          
        </div>
      </main>
      
      ${renderBottomNav()}
    </div>
  `
}

function renderAnggotaList(data) {
  if (!data || data.length === 0) return '<p style="text-align:center;">Tidak ada anggota</p>'
  return data.map(a => `
    <div class="division-card" style="margin-bottom:0.5rem;">
      <div>
        <strong>${a.name}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${a.email}</p>
      </div>
      <span class="status-dot ${a.is_active ? 'active' : 'inactive'}"></span>
    </div>
  `).join('')
}

async function fetchAnggotaDivisi(userId) {
  const supabase = initSupabase()
  // Ambil divisi koordinator
  const { data: userDivs } = await supabase.from('user_divisions').select('division_id').eq('user_id', userId)
  if (!userDivs || userDivs.length === 0) return []
  
  const divIds = userDivs.map(d => d.division_id)
  // Ambil semua user di divisi tersebut
  const { data: userDivisions } = await supabase.from('user_divisions').select('user_id').in('division_id', divIds)
  const userIds = [...new Set(userDivisions?.map(u => u.user_id) || [])]
  
  const { data } = await supabase.from('profiles').select('*').in('id', userIds)
  return data || []
}

export function initKoordinatorDashboardEvents() {
  initHeaderEvents()
  initBottomNavEvents()
  
  loadIbadahAnggota()
}

async function loadIbadahAnggota() {
  const supabase = initSupabase()
  const state = appState.getState()
  const user = state.currentUser
  
  const { data: userDivs } = await supabase.from('user_divisions').select('division_id').eq('user_id', user.id)
  const divIds = userDivs?.map(d => d.division_id) || []
  const { data: members } = await supabase.from('user_divisions').select('user_id').in('division_id', divIds)
  const memberIds = members?.map(m => m.user_id) || []
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  
  const { data: sholatData } = await supabase
    .from('sholat_records')
    .select('*, profiles(name)')
    .in('user_id', memberIds)
    .gte('tanggal', startDate.toISOString().split('T')[0])
  
  const container = document.getElementById('ibadahAnggota')
  
  if (!sholatData || sholatData.length === 0) {
    container.innerHTML = '<p style="text-align:center;">Belum ada data</p>'
    return
  }
  
  const stats = {}
  sholatData.forEach(d => {
    if (!stats[d.user_id]) stats[d.user_id] = { name: d.profiles?.name || '-', total: 0, count: 0 }
    stats[d.user_id].total += [d.subuh, d.dzuhur, d.ashar, d.maghrib, d.isya].filter(s => s !== 'belum').length
    stats[d.user_id].count += 5
  })
  
  container.innerHTML = Object.values(stats).map(s => {
    const pct = s.count > 0 ? Math.round((s.total / s.count) * 100) : 0
    return `
      <div class="ibadah-row">
        <span>${s.name}</span>
        <div class="progress-bar-mini" style="flex:1; margin:0 1rem;">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
        <span>${pct}%</span>
      </div>
    `
  }).join('')
}