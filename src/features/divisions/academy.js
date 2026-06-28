// src/features/divisions/academy.js
// Divisi Academy - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'
import permissionManager from '../../core/auth/permissionManager.js'

// =============================================
// RENDER ACADEMY
// =============================================
export async function renderAcademy() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const jadwal = await fetchJadwal()
  const pemateri = await fetchPemateri()
  
  return `
    <div class="divisi-page">
      <!-- Header -->
      <div class="divisi-header" style="background: linear-gradient(135deg, #1565C0, #1E88E5);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📚 Academy</h2>
        <p>Manajemen Pembelajaran</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="jadwal">📅 Jadwal</button>
        <button class="divisi-tab" data-tab="pemateri">👨‍🏫 Pemateri</button>
        <button class="divisi-tab" data-tab="kehadiran">✅ Kehadiran</button>
        <button class="divisi-tab" data-tab="evaluasi">⭐ Evaluasi</button>
      </div>
      
      <!-- TAB: JADWAL -->
      <div class="divisi-tab-content active" id="tab-jadwal">
        <div style="padding:1rem;">
          <button id="addJadwalBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Jadwal</button>
          <div id="jadwalList">
            ${renderJadwalList(jadwal)}
          </div>
        </div>
      </div>
      
      <!-- TAB: PEMATERI -->
      <div class="divisi-tab-content" id="tab-pemateri">
        <div style="padding:1rem;">
          <button id="addPemateriBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Pemateri</button>
          <div id="pemateriList">
            ${renderPemateriList(pemateri)}
          </div>
        </div>
      </div>
      
      <!-- TAB: KEHADIRAN -->
      <div class="divisi-tab-content" id="tab-kehadiran">
        <div style="padding:1rem;">
          <label>Pilih Jadwal:</label>
          <select id="selectJadwal" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih --</option>
            ${jadwal.map(j => `<option value="${j.id}">${j.judul} - ${j.tanggal}</option>`).join('')}
          </select>
          <div id="kehadiranList">
            <p style="text-align:center; color:var(--text-muted);">Pilih jadwal untuk melihat kehadiran</p>
          </div>
        </div>
      </div>
      
      <!-- TAB: EVALUASI -->
      <div class="divisi-tab-content" id="tab-evaluasi">
        <div style="padding:1rem;">
          <label>Pilih Jadwal:</label>
          <select id="selectJadwalEval" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih --</option>
            ${jadwal.map(j => `<option value="${j.id}">${j.judul} - ${j.tanggal}</option>`).join('')}
          </select>
          <div id="evaluasiList">
            <p style="text-align:center; color:var(--text-muted);">Pilih jadwal untuk melihat evaluasi</p>
          </div>
        </div>
      </div>
      
      <!-- MODAL JADWAL -->
      <div id="jadwalModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Jadwal</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="jadwalForm">
            <div class="form-group">
              <label>Judul</label>
              <input type="text" id="jadwalJudul" required>
            </div>
            <div class="form-group">
              <label>Pemateri</label>
              <select id="jadwalPemateri">
                <option value="">-- Pilih --</option>
                ${pemateri.map(p => `<option value="${p.id}">${p.nama}</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="jadwalTanggal" required>
              </div>
              <div class="form-group">
                <label>Mulai</label>
                <input type="time" id="jadwalMulai">
              </div>
              <div class="form-group">
                <label>Selesai</label>
                <input type="time" id="jadwalSelesai">
              </div>
            </div>
            <div class="form-group">
              <label>Tempat</label>
              <input type="text" id="jadwalTempat" placeholder="Aula, Masjid...">
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <textarea id="jadwalDeskripsi" rows="2"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL PEMATERI -->
      <div id="pemateriModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Pemateri</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="pemateriForm">
            <div class="form-group">
              <label>Nama</label>
              <input type="text" id="pemateriNama" required>
            </div>
            <div class="form-group">
              <label>Keahlian</label>
              <input type="text" id="pemateriKeahlian" placeholder="Fiqih, Hadits, dll">
            </div>
            <div class="form-group">
              <label>Kontak</label>
              <input type="text" id="pemateriKontak" placeholder="No HP">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// RENDER LISTS
// =============================================
function renderJadwalList(jadwal) {
  if (!jadwal || jadwal.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada jadwal</div>'
  }
  
  return jadwal.map(j => `
    <div class="card" style="margin-bottom:0.75rem;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${j.judul}</strong>
        <span style="font-size:0.8rem; color:var(--text-muted);">${j.tanggal}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted);">
        👨‍🏫 ${j.pemateri?.nama || '-'} | ⏰ ${j.waktu_mulai || '-'} - ${j.waktu_selesai || '-'}
      </p>
      <p style="font-size:0.8rem;">📍 ${j.tempat || '-'}</p>
    </div>
  `).join('')
}

function renderPemateriList(pemateri) {
  if (!pemateri || pemateri.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada pemateri</div>'
  }
  
  return pemateri.map(p => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${p.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${p.keahlian || '-'}</p>
      </div>
      <span style="font-size:0.8rem;">📞 ${p.kontak || '-'}</span>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchJadwal() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('academy_jadwal')
    .select('*, pemateri(nama)')
    .order('tanggal', { ascending: false })
  return data || []
}

async function fetchPemateri() {
  const supabase = initSupabase()
  const { data } = await supabase.from('pemateri').select('*').order('nama')
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initAcademyEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  
  // Tab switching
  document.querySelectorAll('.divisi-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.divisi-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.divisi-tab-content').forEach(c => c.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
    })
  })
  
  // Modal Jadwal
  const jadwalModal = document.getElementById('jadwalModal')
  document.getElementById('addJadwalBtn')?.addEventListener('click', () => jadwalModal.style.display = 'flex')
  
  document.getElementById('jadwalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('academy_jadwal').insert({
      judul: document.getElementById('jadwalJudul').value,
      pemateri_id: document.getElementById('jadwalPemateri').value || null,
      tanggal: document.getElementById('jadwalTanggal').value,
      waktu_mulai: document.getElementById('jadwalMulai').value || null,
      waktu_selesai: document.getElementById('jadwalSelesai').value || null,
      tempat: document.getElementById('jadwalTempat').value,
      deskripsi: document.getElementById('jadwalDeskripsi').value
    })
    alert(error ? '❌ Gagal' : '✅ Jadwal ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Pemateri
  const pemateriModal = document.getElementById('pemateriModal')
  document.getElementById('addPemateriBtn')?.addEventListener('click', () => pemateriModal.style.display = 'flex')
  
  document.getElementById('pemateriForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('pemateri').insert({
      nama: document.getElementById('pemateriNama').value,
      keahlian: document.getElementById('pemateriKeahlian').value,
      kontak: document.getElementById('pemateriKontak').value
    })
    alert(error ? '❌ Gagal' : '✅ Pemateri ditambah!')
    if (!error) location.reload()
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      jadwalModal.style.display = 'none'
      pemateriModal.style.display = 'none'
    })
  })
  
  // Kehadiran
  document.getElementById('selectJadwal')?.addEventListener('change', async (e) => {
    const { data } = await supabase
      .from('academy_kehadiran')
      .select('*, profiles(name)')
      .eq('jadwal_id', e.target.value)
    
    const container = document.getElementById('kehadiranList')
    container.innerHTML = data?.map(k => `
      <div class="card" style="margin-bottom:0.25rem; display:flex; justify-content:space-between;">
        <span>${k.profiles?.name || '-'}</span>
        <span class="badge ${k.status === 'hadir' ? 'badge-division' : ''}" 
              style="${k.status !== 'hadir' ? 'background:#fef2f2;color:#ef4444;' : ''}">${k.status}</span>
      </div>
    `).join('') || '<p>Tidak ada data</p>'
  })
  
  // Evaluasi
  document.getElementById('selectJadwalEval')?.addEventListener('change', async (e) => {
    const { data } = await supabase
      .from('academy_evaluasi')
      .select('*, profiles(name)')
      .eq('jadwal_id', e.target.value)
    
    const container = document.getElementById('evaluasiList')
    container.innerHTML = data?.map(ev => `
      <div class="card" style="margin-bottom:0.5rem;">
        <strong>${ev.profiles?.name || '-'}</strong>
        <span>${'⭐'.repeat(ev.rating || 0)}</span>
        <p style="font-size:0.85rem;">${ev.komentar || '-'}</p>
      </div>
    `).join('') || '<p>Tidak ada data</p>'
  })
}