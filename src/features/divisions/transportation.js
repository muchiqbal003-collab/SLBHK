// src/features/divisions/transportation.js
// Divisi Transportation - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER TRANSPORTATION
// =============================================
export async function renderTransportation() {
  const kendaraan = await fetchKendaraan()
  const drivers = await fetchDrivers()
  const perjalanan = await fetchPerjalanan()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #BF360C, #E64A19);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🚐 Transportation</h2>
        <p>Kendaraan & Perjalanan</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="perjalanan">🗺️ Perjalanan</button>
        <button class="divisi-tab" data-tab="kendaraan">🚗 Kendaraan</button>
        <button class="divisi-tab" data-tab="driver">👨‍✈️ Driver</button>
      </div>
      
      <!-- TAB: PERJALANAN -->
      <div class="divisi-tab-content active" id="tab-perjalanan">
        <div style="padding:1rem;">
          <button id="addPerjalananBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Jadwal Perjalanan</button>
          <div id="perjalananList">
            ${renderPerjalananList(perjalanan)}
          </div>
        </div>
      </div>
      
      <!-- TAB: KENDARAAN -->
      <div class="divisi-tab-content" id="tab-kendaraan">
        <div style="padding:1rem;">
          <button id="addKendaraanBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Kendaraan</button>
          <div id="kendaraanList">
            ${renderKendaraanList(kendaraan)}
          </div>
        </div>
      </div>
      
      <!-- TAB: DRIVER -->
      <div class="divisi-tab-content" id="tab-driver">
        <div style="padding:1rem;">
          <button id="addDriverBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Driver</button>
          <div id="driverList">
            ${renderDriverList(drivers)}
          </div>
        </div>
      </div>
      
      <!-- MODAL PERJALANAN -->
      <div id="perjalananModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Jadwal Perjalanan</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="perjalananForm">
            <div class="form-group">
              <label>Kendaraan</label>
              <select id="perjKendaraan">
                <option value="">-- Pilih --</option>
                ${kendaraan.filter(k => k.status === 'tersedia').map(k => `<option value="${k.id}">${k.nama} (${k.nopol || '-'})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Driver</label>
              <select id="perjDriver">
                <option value="">-- Pilih --</option>
                ${drivers.filter(d => d.status === 'tersedia').map(d => `<option value="${d.id}">${d.nama}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tujuan</label>
              <input type="text" id="perjTujuan" required placeholder="Ke mana?">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="perjTanggal" required>
              </div>
              <div class="form-group">
                <label>Berangkat</label>
                <input type="time" id="perjBerangkat">
              </div>
            </div>
            <div class="form-group">
              <label>Jumlah Penumpang</label>
              <input type="number" id="perjPenumpang" value="1" min="1">
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <input type="text" id="perjKet" placeholder="Jemput, antar...">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL KENDARAAN -->
      <div id="kendaraanModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Kendaraan</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="kendaraanForm">
            <div class="form-group">
              <label>Nama Kendaraan</label>
              <input type="text" id="kendNama" required placeholder="Avanza, Hiace...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Jenis</label>
                <select id="kendJenis">
                  <option value="mobil">Mobil</option>
                  <option value="bus">Bus</option>
                  <option value="motor">Motor</option>
                </select>
              </div>
              <div class="form-group">
                <label>Kapasitas</label>
                <input type="number" id="kendKapasitas" value="4" min="1">
              </div>
            </div>
            <div class="form-group">
              <label>No Polisi</label>
              <input type="text" id="kendNopol" placeholder="B 1234 XYZ">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL DRIVER -->
      <div id="driverModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Driver</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="driverForm">
            <div class="form-group">
              <label>Nama Driver</label>
              <input type="text" id="driverNama" required>
            </div>
            <div class="form-group">
              <label>Kontak</label>
              <input type="text" id="driverKontak" placeholder="No HP">
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
function renderPerjalananList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada perjalanan</div>'
  }
  return data.map(p => `
    <div class="card" style="margin-bottom:0.5rem;">
      <div style="display:flex; justify-content:space-between;">
        <strong>🗺️ ${p.tujuan}</strong>
        <span class="badge" style="font-size:0.65rem;">${p.status}</span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-muted);">
        🚗 ${p.kendaraan?.nama || '-'} • 👨‍✈️ ${p.driver?.nama || '-'} • 👥 ${p.penumpang} org
      </p>
      <p style="font-size:0.75rem;">📅 ${p.tanggal} | ⏰ ${p.waktu_berangkat || '-'}</p>
    </div>
  `).join('')
}

function renderKendaraanList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada kendaraan</div>'
  }
  return data.map(k => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>🚗 ${k.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${k.jenis} • ${k.nopol || '-'} • Kap: ${k.kapasitas}</p>
      </div>
      <span class="badge" style="font-size:0.65rem; background:${k.status === 'tersedia' ? '#E8F5E9' : k.status === 'digunakan' ? '#FFF3E0' : '#FFEBEE'};">
        ${k.status}
      </span>
    </div>
  `).join('')
}

function renderDriverList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada driver</div>'
  }
  return data.map(d => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>👨‍✈️ ${d.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">📞 ${d.kontak || '-'}</p>
      </div>
      <span class="badge" style="font-size:0.65rem; background:${d.status === 'tersedia' ? '#E8F5E9' : d.status === 'bertugas' ? '#FFF3E0' : '#F5F5F5'};">
        ${d.status}
      </span>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchKendaraan() {
  const supabase = initSupabase()
  const { data } = await supabase.from('transport_kendaraan').select('*').order('nama')
  return data || []
}

async function fetchDrivers() {
  const supabase = initSupabase()
  const { data } = await supabase.from('transport_driver').select('*').order('nama')
  return data || []
}

async function fetchPerjalanan() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('transport_perjalanan')
    .select('*, kendaraan:transport_kendaraan!transport_perjalanan_kendaraan_id_fkey(nama), driver:transport_driver!transport_perjalanan_driver_id_fkey(nama)')
    .order('tanggal', { ascending: false })
    .limit(20)
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initTransportationEvents() {
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
  
  // Modal Perjalanan
  const perjModal = document.getElementById('perjalananModal')
  document.getElementById('addPerjalananBtn')?.addEventListener('click', () => perjModal.style.display = 'flex')
  document.getElementById('perjalananForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    const { error } = await supabase.from('transport_perjalanan').insert({
      kendaraan_id: document.getElementById('perjKendaraan').value || null,
      driver_id: document.getElementById('perjDriver').value || null,
      user_id: state.currentUser.id,
      tujuan: document.getElementById('perjTujuan').value,
      tanggal: document.getElementById('perjTanggal').value,
      waktu_berangkat: document.getElementById('perjBerangkat').value || null,
      penumpang: parseInt(document.getElementById('perjPenumpang').value),
      keterangan: document.getElementById('perjKet').value
    })
    alert(error ? '❌ Gagal' : '✅ Perjalanan dijadwalkan!')
    if (!error) location.reload()
  })
  
  // Modal Kendaraan
  const kendModal = document.getElementById('kendaraanModal')
  document.getElementById('addKendaraanBtn')?.addEventListener('click', () => kendModal.style.display = 'flex')
  document.getElementById('kendaraanForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('transport_kendaraan').insert({
      nama: document.getElementById('kendNama').value,
      jenis: document.getElementById('kendJenis').value,
      kapasitas: parseInt(document.getElementById('kendKapasitas').value),
      nopol: document.getElementById('kendNopol').value
    })
    alert(error ? '❌ Gagal' : '✅ Kendaraan ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Driver
  const driverModal = document.getElementById('driverModal')
  document.getElementById('addDriverBtn')?.addEventListener('click', () => driverModal.style.display = 'flex')
  document.getElementById('driverForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('transport_driver').insert({
      nama: document.getElementById('driverNama').value,
      kontak: document.getElementById('driverKontak').value
    })
    alert(error ? '❌ Gagal' : '✅ Driver ditambah!')
    if (!error) location.reload()
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      perjModal.style.display = 'none'
      kendModal.style.display = 'none'
      driverModal.style.display = 'none'
    })
  })
}