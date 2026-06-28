// src/features/shared/inputHarian.js
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

const STATUS_SHOLAT = [
  { value: 'berjamaah', label: 'Berjamaah', icon: '🕌', color: '#4CAF50' },
  { value: 'sendiri', label: 'Sendiri', icon: '🧍', color: '#2196F3' },
  { value: 'safar_sudah_izin', label: 'Safar (Izin)', icon: '✈️', color: '#FF9800' },
  { value: 'safar_belum_izin', label: 'Safar (Blm Izin)', icon: '⚠️', color: '#f44336' },
  { value: 'berhalangan', label: 'Berhalangan', icon: '🤒', color: '#9C27B0' },
  { value: 'sakit', label: 'sakit', icon: '🤧', color: '#9C27B0' },
  { value: 'belum', label: 'Belum', icon: '⏳', color: '#9E9E9E' }
]

const SHOLAT_WAKTU = [
  { id: 'subuh', label: 'Subuh', icon: '🌅', time: '04:30' },
  { id: 'dzuhur', label: 'Dzuhur', icon: '☀️', time: '12:00' },
  { id: 'ashar', label: 'Ashar', icon: '🌤️', time: '15:30' },
  { id: 'maghrib', label: 'Maghrib', icon: '🌇', time: '18:00' },
  { id: 'isya', label: 'Isya', icon: '🌙', time: '19:30' }
]

// =============================================
// PAGE: 3 ICON MENU
// =============================================
export async function renderInputMenu() {
  const today = new Date().toISOString().split('T')[0]
  
  return `
    <div class="input-page">
      <div class="input-header">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📝 Input Harian</h2>
        <p style="opacity:0.9; font-size:0.85rem;">${formatTanggal(today)}</p>
      </div>
      
      <div class="input-menu-grid">
        <div class="input-menu-card" onclick="window.location.hash='#/input/sholat'">
          <div class="input-menu-icon" style="background:#E8F5E9;">🕌</div>
          <h3>Sholat</h3>
          <p>Pejuang Sholat</p>
        </div>
        
        <div class="input-menu-card" onclick="window.location.hash='#/input/tilawah'">
          <div class="input-menu-icon" style="background:#E3F2FD;">📖</div>
          <h3>Tilawah</h3>
          <p>Pejuang Tilawah</p>
        </div>
        
        <div class="input-menu-card" onclick="window.location.hash='#/input/laporan'">
          <div class="input-menu-icon" style="background:#FFF3E0;">📋</div>
          <h3>Laporan</h3>
          <p>Laporan kinerja & kegiatan</p>
        </div>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// PAGE: SHOLAT
// =============================================
export async function renderInputSholat() {
  const state = appState.getState()
  const user = state.currentUser
  const today = new Date().toISOString().split('T')[0]
  const data = await fetchSholatToday(user.id, today)
  
  return `
    <div class="input-page">
      <div class="input-sub-header">
        <button onclick="window.location.hash='#/input'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🕌 Absensi Sholat</h2>
        <p style="opacity:0.9; font-size:0.8rem;">${formatTanggal(today)}</p>
      </div>
      
      <div class="sholat-list">
        ${SHOLAT_WAKTU.map(w => {
          const current = data?.[w.id] || 'belum'
          const info = STATUS_SHOLAT.find(s => s.value === current)
          return `
            <div class="sholat-card" data-waktu="${w.id}">
              <div class="sholat-card-left">
                <span class="sholat-waktu-icon">${w.icon}</span>
                <div>
                  <strong>${w.label}</strong>
                  <small>${w.time}</small>
                </div>
              </div>
              <div class="sholat-card-right">
                <span class="status-badge" style="background:${info.color}20; color:${info.color};" 
                      onclick="toggleDropdown(event, '${w.id}')">
                  ${info.icon} ${info.label}
                </span>
                <div class="status-dropdown" id="dropdown-${w.id}" style="display:none;">
                  ${STATUS_SHOLAT.map(s => `
                    <div class="dropdown-option ${current === s.value ? 'selected' : ''}" 
                         onclick="selectStatus('${w.id}', '${s.value}')">
                      <span>${s.icon}</span> <span>${s.label}</span>
                      ${current === s.value ? '<span style="margin-left:auto;">✓</span>' : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
      
      <div class="card" style="margin:1rem;">
        <div class="form-group">
          <label>Catatan</label>
          <textarea id="sholatCatatan" rows="2" placeholder="Tambahan...">${data?.catatan || ''}</textarea>
        </div>
        <button id="saveSholatBtn" class="btn btn-primary">💾 Simpan Absensi</button>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// PAGE: TILAWAH
// =============================================
export async function renderInputTilawah() {
  const state = appState.getState()
  const user = state.currentUser
  const today = new Date().toISOString().split('T')[0]
  const data = await fetchTilawahToday(user.id, today)
  
  return `
    <div class="input-page">
      <div class="input-sub-header">
        <button onclick="window.location.hash='#/input'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📖 Tilawah Harian</h2>
        <p style="opacity:0.9; font-size:0.8rem;">${formatTanggal(today)}</p>
      </div>
      
      <div class="card" style="margin:1rem;">
        <div class="form-row">
          <div class="form-group">
            <label>Juz</label>
            <input type="number" id="tilawahJuz" min="1" max="30" value="${data?.juz || ''}" placeholder="1-30">
          </div>
          <div class="form-group">
            <label>Halaman</label>
            <input type="number" id="tilawahHalaman" min="1" max="604" value="${data?.halaman || ''}" placeholder="1-604">
          </div>
          <div class="form-group">
            <label>Ayat</label>
            <input type="number" id="tilawahAyat" min="1" value="${data?.ayat || ''}" placeholder="Jumlah">
          </div>
        </div>
        <div class="form-group">
          <label>Surat (opsional)</label>
          <input type="text" id="tilawahSurat" value="${data?.surat || ''}" placeholder="Al-Baqarah, dll">
        </div>
        <div class="form-group">
          <label>Catatan</label>
          <textarea id="tilawahCatatan" rows="2" placeholder="Murojaah, tahsin...">${data?.catatan || ''}</textarea>
        </div>
        <button id="saveTilawahBtn" class="btn btn-primary">💾 Simpan Tilawah</button>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// PAGE: LAPORAN
// =============================================
export async function renderInputLaporan() {
  const today = new Date().toISOString().split('T')[0]
  
  return `
    <div class="input-page">
      <div class="input-sub-header">
        <button onclick="window.location.hash='#/input'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📋 Laporan Kinerja</h2>
        <p style="opacity:0.9; font-size:0.8rem;">${formatTanggal(today)}</p>
      </div>
      
      <div class="card" style="margin:1rem;">
        <form id="laporanForm">
          <div class="form-group">
            <label>Nama Acara/Kegiatan *</label>
            <input type="text" id="laporanNama" required placeholder="Kajian Rutin, Bakti Sosial...">
          </div>
          <div class="form-group">
            <label>Tanggal Acara *</label>
            <input type="date" id="laporanTanggal" required value="${today}">
          </div>
          <div class="form-group">
            <label>Jalannya Acara *</label>
            <textarea id="laporanDeskripsi" rows="3" required placeholder="Deskripsikan bagaimana acara berlangsung..."></textarea>
          </div>
          <div class="form-group">
            <label>Temuan / Masalah</label>
            <textarea id="laporanTemuan" rows="2" placeholder="Kendala atau temuan di lapangan..."></textarea>
          </div>
          <div class="form-group">
            <label>Evaluasi</label>
            <textarea id="laporanEvaluasi" rows="2" placeholder="Apa yang sudah baik & perlu diperbaiki..."></textarea>
          </div>
          <div class="form-group">
            <label>Saran</label>
            <textarea id="laporanSaran" rows="2" placeholder="Saran untuk kegiatan berikutnya..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary">📤 Kirim Laporan</button>
        </form>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// HELPERS
// =============================================
function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

async function fetchSholatToday(userId, tanggal) {
  const supabase = initSupabase()
  const { data } = await supabase.from('sholat_records').select('*').eq('user_id', userId).eq('tanggal', tanggal).single()
  return data
}

async function fetchTilawahToday(userId, tanggal) {
  const supabase = initSupabase()
  const { data } = await supabase.from('tilawah_records').select('*').eq('user_id', userId).eq('tanggal', tanggal).single()
  return data
}

// Global functions
window.toggleDropdown = function(event, id) {
  event.stopPropagation()
  document.querySelectorAll('.status-dropdown').forEach(d => {
    if (d.id !== `dropdown-${id}`) d.style.display = 'none'
  })
  const d = document.getElementById(`dropdown-${id}`)
  d.style.display = d.style.display === 'none' ? 'block' : 'none'
}

window.selectStatus = function(waktuId, status) {
  const info = STATUS_SHOLAT.find(s => s.value === status)
  const badge = document.querySelector(`[data-waktu="${waktuId}"] .status-badge`)
  badge.innerHTML = `${info.icon} ${info.label}`
  badge.style.background = info.color + '20'
  badge.style.color = info.color
  
  const dropdown = document.getElementById(`dropdown-${waktuId}`)
  dropdown.querySelectorAll('.dropdown-option').forEach(o => {
    o.classList.remove('selected')
    o.querySelector('span:last-child').textContent = o.querySelector('span:last-child').textContent.replace('✓','').trim()
  })
  const selected = dropdown.querySelector(`[onclick*="${status}"]`)
  if (selected) {
    selected.classList.add('selected')
    selected.querySelector('span:last-child').textContent += ' ✓'
  }
  dropdown.style.display = 'none'
}

document.addEventListener('click', () => {
  document.querySelectorAll('.status-dropdown').forEach(d => d.style.display = 'none')
})

// =============================================
// EVENTS
// =============================================
export function initInputMenuEvents() {
  initBottomNavEvents()
}

export function initInputSholatEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  const state = appState.getState()
  const user = state.currentUser
  const today = new Date().toISOString().split('T')[0]
  
  document.getElementById('saveSholatBtn')?.addEventListener('click', async () => {
    const formData = { user_id: user.id, tanggal: today }
    SHOLAT_WAKTU.forEach(w => {
      const badge = document.querySelector(`[data-waktu="${w.id}"] .status-badge`)
      const text = badge?.textContent?.trim() || ''
      const status = STATUS_SHOLAT.find(s => text.includes(s.label))
      formData[w.id] = status?.value || 'belum'
    })
    formData.catatan = document.getElementById('sholatCatatan')?.value || ''
    
    const { error } = await supabase.from('sholat_records').upsert(formData, { onConflict: 'user_id, tanggal' })
    alert(error ? '❌ Gagal: ' + error.message : '✅ Absensi sholat tersimpan!')
  })
}

export function initInputTilawahEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  const state = appState.getState()
  const user = state.currentUser
  const today = new Date().toISOString().split('T')[0]
  
  document.getElementById('saveTilawahBtn')?.addEventListener('click', async () => {
    const formData = {
      user_id: user.id, tanggal: today,
      juz: parseInt(document.getElementById('tilawahJuz')?.value) || 0,
      halaman: parseInt(document.getElementById('tilawahHalaman')?.value) || 0,
      ayat: parseInt(document.getElementById('tilawahAyat')?.value) || 0,
      surat: document.getElementById('tilawahSurat')?.value || '',
      catatan: document.getElementById('tilawahCatatan')?.value || ''
    }
    const { error } = await supabase.from('tilawah_records').upsert(formData, { onConflict: 'user_id, tanggal' })
    alert(error ? '❌ Gagal: ' + error.message : '✅ Tilawah tersimpan!')
  })
}

export function initInputLaporanEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  const state = appState.getState()
  const user = state.currentUser
  const today = new Date().toISOString().split('T')[0]
  
  document.getElementById('laporanForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = {
      user_id: user.id, tanggal: today,
      nama_acara: document.getElementById('laporanNama')?.value,
      tanggal_acara: document.getElementById('laporanTanggal')?.value,
      deskripsi: document.getElementById('laporanDeskripsi')?.value,
      temuan_masalah: document.getElementById('laporanTemuan')?.value,
      evaluasi: document.getElementById('laporanEvaluasi')?.value,
      saran: document.getElementById('laporanSaran')?.value
    }
    const { error } = await supabase.from('laporan_kinerja').insert(data)
    if (error) { alert('❌ Gagal: ' + error.message) }
    else { alert('✅ Laporan terkirim!'); document.getElementById('laporanForm').reset() }
  })
}