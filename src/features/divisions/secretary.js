// src/features/divisions/secretary.js
// Divisi Secretary & Admin - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER SECRETARY
// =============================================
export async function renderSecretary() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const peserta = await fetchPeserta()
  const surat = await fetchSurat()
  const notulen = await fetchNotulen()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #6A1B9A, #8E24AA);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📝 Secretary & Admin</h2>
        <p>Data Peserta, Surat, Notulen, Absensi</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="peserta">👥 Peserta</button>
        <button class="divisi-tab" data-tab="surat">📄 Surat</button>
        <button class="divisi-tab" data-tab="notulen">📋 Notulen</button>
        <button class="divisi-tab" data-tab="absensi">✅ Absensi</button>
      </div>
      
      <!-- TAB: PESERTA -->
      <div class="divisi-tab-content active" id="tab-peserta">
        <div style="padding:1rem;">
          <button id="addPesertaBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Peserta</button>
          <input type="text" id="searchPeserta" placeholder="🔍 Cari peserta..." class="search-input">
          <div id="pesertaList">
            ${renderPesertaList(peserta)}
          </div>
        </div>
      </div>
      
      <!-- TAB: SURAT -->
      <div class="divisi-tab-content" id="tab-surat">
        <div style="padding:1rem;">
          <button id="addSuratBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Buat Surat</button>
          <div id="suratList">
            ${renderSuratList(surat)}
          </div>
        </div>
      </div>
      
      <!-- TAB: NOTULEN -->
      <div class="divisi-tab-content" id="tab-notulen">
        <div style="padding:1rem;">
          <button id="addNotulenBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Notulen Baru</button>
          <div id="notulenList">
            ${renderNotulenList(notulen)}
          </div>
        </div>
      </div>
      
      <!-- TAB: ABSENSI -->
      <div class="divisi-tab-content" id="tab-absensi">
        <div style="padding:1rem;">
          <div class="card" style="text-align:center; padding:2rem;">
            <p>📅 Absensi Hari Ini</p>
            <p style="font-size:2rem; font-weight:700;" id="absensiCount">-</p>
            <button id="markAbsensiBtn" class="btn btn-primary">✅ Absen Hari Ini</button>
          </div>
        </div>
      </div>
      
      <!-- MODAL PESERTA -->
      <div id="pesertaModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Peserta</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="pesertaForm">
            <div class="form-group">
              <label>Nama</label>
              <input type="text" id="pesertaNama" required>
            </div>
            <div class="form-group">
              <label>Asal</label>
              <input type="text" id="pesertaAsal" placeholder="Kota/Pesantren asal">
            </div>
            <div class="form-group">
              <label>Kontak</label>
              <input type="text" id="pesertaKontak" placeholder="No HP">
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select id="pesertaKategori">
                <option value="umum">Umum</option>
                <option value="lansia">Lansia</option>
                <option value="pengurus">Pengurus</option>
                <option value="tamu">Tamu</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL SURAT -->
      <div id="suratModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Buat Surat</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="suratForm">
            <div class="form-group">
              <label>Nomor Surat</label>
              <input type="text" id="suratNomor" placeholder="001/PLB/VI/2026">
            </div>
            <div class="form-group">
              <label>Perihal</label>
              <input type="text" id="suratPerihal" required>
            </div>
            <div class="form-group">
              <label>Tujuan</label>
              <input type="text" id="suratTujuan">
            </div>
            <div class="form-group">
              <label>Tanggal</label>
              <input type="date" id="suratTanggal" required>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL NOTULEN -->
      <div id="notulenModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Notulen Baru</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="notulenForm">
            <div class="form-group">
              <label>Judul Rapat</label>
              <input type="text" id="notulenJudul" required>
            </div>
            <div class="form-group">
              <label>Tanggal</label>
              <input type="date" id="notulenTanggal" required>
            </div>
            <div class="form-group">
              <label>Yang Hadir</label>
              <input type="text" id="notulenHadir" placeholder="Nama-nama yang hadir">
            </div>
            <div class="form-group">
              <label>Isi Notulen</label>
              <textarea id="notulenIsi" rows="5" placeholder="Hasil rapat..."></textarea>
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
function renderPesertaList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada data peserta</div>'
  }
  return data.map(p => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between;">
      <div>
        <strong>${p.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${p.asal || '-'} • ${p.kategori}</p>
      </div>
      <span style="font-size:0.8rem;">📞 ${p.kontak || '-'}</span>
    </div>
  `).join('')
}

function renderSuratList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada surat</div>'
  }
  return data.map(s => `
    <div class="card" style="margin-bottom:0.5rem;">
      <strong>📄 ${s.perihal}</strong>
      <p style="font-size:0.8rem; color:var(--text-muted);">No: ${s.nomor || '-'} • Tujuan: ${s.tujuan || '-'} • ${s.tanggal}</p>
    </div>
  `).join('')
}

function renderNotulenList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada notulen</div>'
  }
  return data.map(n => `
    <div class="card" style="margin-bottom:0.5rem;">
      <strong>📋 ${n.judul}</strong>
      <p style="font-size:0.8rem; color:var(--text-muted);">${n.tanggal} • Hadir: ${n.hadir || '-'}</p>
      <p style="font-size:0.85rem;">${n.isi?.substring(0, 100)}...</p>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchPeserta() {
  const supabase = initSupabase()
  const { data } = await supabase.from('secretary_peserta').select('*').order('created_at', { ascending: false })
  return data || []
}

async function fetchSurat() {
  const supabase = initSupabase()
  const { data } = await supabase.from('secretary_surat').select('*').order('created_at', { ascending: false })
  return data || []
}

async function fetchNotulen() {
  const supabase = initSupabase()
  const { data } = await supabase.from('secretary_notulen').select('*').order('created_at', { ascending: false })
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initSecretaryEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  
  // Tab switching
  document.querySelectorAll('.divisi-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.divisi-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.divisi-tab-content').forEach(c => c.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
      
      if (tab.dataset.tab === 'absensi') loadAbsensiToday()
    })
  })
  
  // Modal Peserta
  const pesertaModal = document.getElementById('pesertaModal')
  document.getElementById('addPesertaBtn')?.addEventListener('click', () => pesertaModal.style.display = 'flex')
  document.getElementById('pesertaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('secretary_peserta').insert({
      nama: document.getElementById('pesertaNama').value,
      asal: document.getElementById('pesertaAsal').value,
      kontak: document.getElementById('pesertaKontak').value,
      kategori: document.getElementById('pesertaKategori').value
    })
    alert(error ? '❌ Gagal' : '✅ Peserta ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Surat
  const suratModal = document.getElementById('suratModal')
  document.getElementById('addSuratBtn')?.addEventListener('click', () => suratModal.style.display = 'flex')
  document.getElementById('suratForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    const { error } = await supabase.from('secretary_surat').insert({
      nomor: document.getElementById('suratNomor').value,
      perihal: document.getElementById('suratPerihal').value,
      tujuan: document.getElementById('suratTujuan').value,
      tanggal: document.getElementById('suratTanggal').value,
      created_by: state.currentUser.id
    })
    alert(error ? '❌ Gagal' : '✅ Surat dibuat!')
    if (!error) location.reload()
  })
  
  // Modal Notulen
  const notulenModal = document.getElementById('notulenModal')
  document.getElementById('addNotulenBtn')?.addEventListener('click', () => notulenModal.style.display = 'flex')
  document.getElementById('notulenForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    const { error } = await supabase.from('secretary_notulen').insert({
      judul: document.getElementById('notulenJudul').value,
      tanggal: document.getElementById('notulenTanggal').value,
      hadir: document.getElementById('notulenHadir').value,
      isi: document.getElementById('notulenIsi').value,
      created_by: state.currentUser.id
    })
    alert(error ? '❌ Gagal' : '✅ Notulen disimpan!')
    if (!error) location.reload()
  })
  
  // Absensi
  document.getElementById('markAbsensiBtn')?.addEventListener('click', async () => {
    const state = appState.getState()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('secretary_absensi').upsert({
      user_id: state.currentUser.id,
      tanggal: today,
      status: 'hadir'
    }, { onConflict: 'user_id, tanggal' })
    alert(error ? '❌ Gagal' : '✅ Absensi berhasil!')
    loadAbsensiToday()
  })
  
  // Search Peserta
  document.getElementById('searchPeserta')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    document.querySelectorAll('#pesertaList .card').forEach(card => {
      card.style.display = card.textContent?.toLowerCase().includes(q) ? '' : 'none'
    })
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      pesertaModal.style.display = 'none'
      suratModal.style.display = 'none'
      notulenModal.style.display = 'none'
    })
  })
  
  loadAbsensiToday()
}

async function loadAbsensiToday() {
  const supabase = initSupabase()
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('secretary_absensi')
    .select('*', { count: 'exact', head: true })
    .eq('tanggal', today)
    .eq('status', 'hadir')
  
  document.getElementById('absensiCount').textContent = count || 0
}