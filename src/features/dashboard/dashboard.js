// src/features/dashboard/dashboard.js
// Command Center - PLBMS
import { renderHeader, initHeaderEvents } from '../../components/layout/header.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'
import { renderSidebar, initSidebarEvents } from '../../components/layout/sidebar.js'
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import permissionManager from '../../core/auth/permissionManager.js'
import { initSupabase } from '../../supabase/client.js'

// =============================================
// RENDER DASHBOARD
// =============================================
export async function renderDashboard() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return '<p>Redirecting...</p>'
  }
  
  const roleLabel = permissionManager.getRoleLabel()
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  
  return `
    <div class="app-layout">
      ${renderSidebar()}
      ${renderHeader()}
      
      <main class="main-content">
        <div class="dashboard-cc">
          
          <!-- ===== HEADER PROFILE ===== -->
          <div class="dash-header">
            <div class="dash-header-left">
              <div class="dash-avatar" id="dashAvatar">
                ${user.avatar_url 
                  ? `<img src="${user.avatar_url}" alt="Foto">` 
                  : '<span>👤</span>'}
              </div>
              <div>
                <h2>Selamat datang, ${user.name} 👋</h2>
                <p>${roleLabel} • ${today}</p>
              </div>
            </div>
            <div class="dash-header-right">
              <span class="badge badge-role">${roleLabel}</span>
            </div>
          </div>
          
          <!-- ===== AGENDA HARI INI ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>📅 Agenda Hari Ini</h3>
            </div>
            <div class="agenda-list" id="agendaList">
              <p class="text-muted" style="text-align:center; padding:1rem;">Memuat agenda...</p>
            </div>
          </div>
          
          <!-- ===== PENGUMUMAN ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>📢 Pengumuman</h3>
            </div>
            <div class="pengumuman-list" id="pengumumanList">
              <p class="text-muted" style="text-align:center; padding:1rem;">Belum ada pengumuman</p>
            </div>
          </div>
          
          <!-- ===== KONDISI SELURUH DIVISI ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>📊 Kondisi Seluruh Divisi</h3>
            </div>
            <div class="division-status-grid" id="divisionStatusGrid">
              <p class="text-muted" style="text-align:center; padding:1rem;">Memuat data divisi...</p>
            </div>
          </div>
          
          <!-- ===== PROGRESS PERSIAPAN ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>📈 Progress Persiapan</h3>
            </div>
            <div class="progress-card" id="progressCard">
              <div class="progress-bar-large">
                <div class="progress-fill-large" id="progressFill" style="width:0%">0%</div>
              </div>
              <p class="text-muted" id="progressText">Menghitung kesiapan...</p>
            </div>
          </div>
          
          <!-- ===== TUGAS SAYA ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>📋 Tugas Saya</h3>
            </div>
            <div class="tugas-list" id="tugasList">
              <p class="text-muted" style="text-align:center; padding:1rem;">Tidak ada tugas</p>
            </div>
          </div>
          
          <!-- ===== AKTIVITAS TERBARU ===== -->
          <div class="dash-section">
            <div class="section-header">
              <h3>🔔 Aktivitas Terbaru</h3>
            </div>
            <div class="aktivitas-list" id="aktivitasList">
              <p class="text-muted" style="text-align:center; padding:1rem;">Memuat aktivitas...</p>
            </div>
          </div>
          
          <!-- ===== QUOTES ===== -->
          <div class="dash-section">
            <div class="quote-card">
              <p class="quote-text" id="quoteText">"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia."</p>
              <p class="quote-source" id="quoteSource">— HR. Ahmad</p>
            </div>
          </div>
          
        </div>
      </main>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// INIT EVENTS
// =============================================
export function initDashboardEvents() {
  initHeaderEvents()
  initBottomNavEvents()
  initSidebarEvents()
  
  // Load semua data
  loadAgendaHariIni()
  loadDivisionStatus()
  loadProgressPersiapan()
  loadTugasSaya()
  loadAktivitasTerbaru()
  loadRandomQuote()
}

// =============================================
// LOAD FUNCTIONS
// =============================================

async function loadAgendaHariIni() {
  const supabase = initSupabase()
  const today = new Date().toISOString().split('T')[0]
  
  // Ambil agenda dari laporan atau tabel agenda (fallback: data dummy)
  const container = document.getElementById('agendaList')
  
  // Coba ambil dari laporan_kinerja hari ini
  const { data } = await supabase
    .from('laporan_kinerja')
    .select('*')
    .eq('tanggal_acara', today)
    .order('created_at', { ascending: true })
  
  if (data && data.length > 0) {
    container.innerHTML = data.map((a, i) => `
      <div class="agenda-item">
        <span class="agenda-time">${i + 1}</span>
        <div>
          <strong>${a.nama_acara}</strong>
          <p class="text-muted" style="font-size:0.8rem;">${a.deskripsi?.substring(0, 80)}...</p>
        </div>
      </div>
    `).join('')
  } else {
    container.innerHTML = `
      <div class="agenda-item"><span class="agenda-time">1</span><div><strong>Pembukaan</strong></div></div>
      <div class="agenda-item"><span class="agenda-time">2</span><div><strong>Kajian Utama</strong></div></div>
      <div class="agenda-item"><span class="agenda-time">3</span><div><strong>Ishoma</strong></div></div>
      <div class="agenda-item"><span class="agenda-time">4</span><div><strong>Sesi Diskusi</strong></div></div>
      <div class="agenda-item"><span class="agenda-time">5</span><div><strong>Penutupan</strong></div></div>
    `
  }
}

async function loadDivisionStatus() {
  const supabase = initSupabase()
  const { data: divisions } = await supabase.from('divisions').select('*').eq('is_active', true)
  const container = document.getElementById('divisionStatusGrid')
  
  if (!divisions || divisions.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;">Belum ada divisi</p>'
    return
  }
  
  const statuses = await Promise.all(divisions.map(async (d) => {
    const { data: checklists } = await supabase
      .from('division_checklists')
      .select('*')
      .eq('division_id', d.id)
    
    const total = checklists?.length || 0
    const checked = checklists?.filter(c => c.is_checked).length || 0
    const pct = total > 0 ? Math.round((checked / total) * 100) : 100
    
    let status = '🟢'
    let statusText = 'Aman'
    if (pct < 50) { status = '🔴'; statusText = 'Butuh Bantuan' }
    else if (pct < 80) { status = '🟡'; statusText = 'Persiapan' }
    
    return { ...d, status, statusText, pct }
  }))
  
  container.innerHTML = statuses.map(d => `
    <div class="division-status-item" onclick="window.location.hash='#/divisions'">
      <span class="status-icon">${d.status}</span>
      <strong>${d.name}</strong>
      <span class="status-text">${d.statusText}</span>
    </div>
  `).join('')
}

async function loadProgressPersiapan() {
  const supabase = initSupabase()
  const { data: allChecklists } = await supabase.from('division_checklists').select('*')
  
  const total = allChecklists?.length || 0
  const checked = allChecklists?.filter(c => c.is_checked).length || 0
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  
  document.getElementById('progressFill').style.width = pct + '%'
  document.getElementById('progressFill').textContent = pct + '%'
  document.getElementById('progressText').textContent = `${checked} dari ${total} checklist selesai`
}

async function loadTugasSaya() {
  const state = appState.getState()
  const user = state.currentUser
  const container = document.getElementById('tugasList')
  
  if (!user) return
  
  const supabase = initSupabase()
  
  // Ambil tugas dari checklist yang belum selesai di divisi user
  const { data: userDivs } = await supabase
    .from('user_divisions')
    .select('division_id')
    .eq('user_id', user.id)
  
  if (!userDivs || userDivs.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;">Tidak ada divisi</p>'
    return
  }
  
  const divIds = userDivs.map(d => d.division_id)
  const { data: tasks } = await supabase
    .from('division_checklists')
    .select('*, divisions(name)')
    .in('division_id', divIds)
    .eq('is_checked', false)
    .limit(5)
  
  if (tasks && tasks.length > 0) {
    container.innerHTML = tasks.map(t => `
      <div class="tugas-item">
        <input type="checkbox" onchange="updateChecklist('${t.id}', this.checked)" style="accent-color:var(--primary);">
        <span>${t.item_name}</span>
        <small class="text-muted">${t.divisions?.name || ''}</small>
      </div>
    `).join('')
  }
}

async function loadAktivitasTerbaru() {
  const supabase = initSupabase()
  const container = document.getElementById('aktivitasList')
  
  // Ambil dari laporan & sholat terbaru
  const { data: laporans } = await supabase
    .from('laporan_kinerja')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (laporans && laporans.length > 0) {
    container.innerHTML = laporans.map(l => `
      <div class="aktivitas-item">
        <span class="aktivitas-dot"></span>
        <div>
          <strong>${l.profiles?.name || '-'}</strong> membuat laporan <strong>${l.nama_acara}</strong>
          <p class="text-muted" style="font-size:0.7rem;">${timeAgo(l.created_at)}</p>
        </div>
      </div>
    `).join('')
  } else {
    container.innerHTML = '<p class="text-muted" style="text-align:center;">Belum ada aktivitas</p>'
  }
}

function loadRandomQuote() {
  const quotes = [
    { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia.", source: "HR. Ahmad" },
    { text: "Barang siapa yang bersungguh-sungguh, maka ia akan berhasil.", source: "Pepatah Arab" },
    { text: "Bekerjalah untuk duniamu seakan-akan kamu hidup selamanya, dan beribadahlah untuk akhiratmu seakan-akan kamu mati besok.", source: "HR. Ibnu Asakir" },
    { text: "Ilmu tanpa amal bagaikan pohon tanpa buah.", source: "Pepatah Bijak" },
    { text: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" }
  ]
  
  const random = quotes[Math.floor(Math.random() * quotes.length)]
  document.getElementById('quoteText').textContent = `"${random.text}"`
  document.getElementById('quoteSource').textContent = `— ${random.source}`
}

// =============================================
// HELPERS
// =============================================
function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

// Global function untuk update checklist dari dashboard
window.updateChecklist = async function(id, checked) {
  const supabase = initSupabase()
  await supabase.from('division_checklists').update({ is_checked: checked }).eq('id', id)
  loadProgressPersiapan()
  loadDivisionStatus()
}