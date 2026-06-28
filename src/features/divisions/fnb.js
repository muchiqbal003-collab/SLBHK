// src/features/divisions/fnb.js
// Divisi Food & Beverage - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER F&B
// =============================================
export async function renderFNB() {
  const menus = await fetchMenus()
  const jadwals = await fetchJadwal()
  const stoks = await fetchStok()
  
  const today = new Date().toISOString().split('T')[0]
  const jadwalHariIni = jadwals.filter(j => j.tanggal === today)
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #FF6F00, #FF8F00);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🍽 Food & Beverage</h2>
        <p>Menu, Jadwal & Stok</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="jadwal">📅 Jadwal</button>
        <button class="divisi-tab" data-tab="menu">📋 Menu</button>
        <button class="divisi-tab" data-tab="stok">📦 Stok</button>
      </div>
      
      <!-- TAB: JADWAL -->
      <div class="divisi-tab-content active" id="tab-jadwal">
        <div style="padding:1rem;">
          <h3 style="margin-bottom:0.5rem;">📅 Hari Ini (${formatTanggal(today)})</h3>
          <div id="jadwalHariIni">
            ${renderJadwalHariIni(jadwalHariIni)}
          </div>
          <button id="addJadwalBtn" class="btn btn-primary" style="margin-top:1rem; width:100%;">+ Tambah Jadwal</button>
          
          <h3 style="margin:1rem 0 0.5rem;">📆 Semua Jadwal</h3>
          <div id="jadwalList">
            ${renderJadwalList(jadwals)}
          </div>
        </div>
      </div>
      
      <!-- TAB: MENU -->
      <div class="divisi-tab-content" id="tab-menu">
        <div style="padding:1rem;">
          <button id="addMenuBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Menu</button>
          <div id="menuList">
            ${renderMenuList(menus)}
          </div>
        </div>
      </div>
      
      <!-- TAB: STOK -->
      <div class="divisi-tab-content" id="tab-stok">
        <div style="padding:1rem;">
          <button id="addStokBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Bahan</button>
          <div id="stokList">
            ${renderStokList(stoks)}
          </div>
        </div>
      </div>
      
      <!-- MODAL JADWAL -->
      <div id="jadwalModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Jadwal Konsumsi</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="jadwalForm">
            <div class="form-group">
              <label>Tanggal</label>
              <input type="date" id="fbTanggal" required value="${today}">
            </div>
            <div class="form-group">
              <label>Waktu</label>
              <select id="fbWaktu" required>
                <option value="sarapan">🌅 Sarapan</option>
                <option value="snack_pagi">🕙 Snack Pagi</option>
                <option value="makan_siang">☀️ Makan Siang</option>
                <option value="snack_sore">🕒 Snack Sore</option>
                <option value="makan_malam">🌙 Makan Malam</option>
              </select>
            </div>
            <div class="form-group">
              <label>Menu</label>
              <select id="fbMenu">
                <option value="">-- Pilih --</option>
                ${menus.map(m => `<option value="${m.id}">${m.kategori === 'minuman' ? '🥤' : m.kategori === 'snack' ? '🍪' : '🍛'} ${m.nama}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Jumlah Porsi</label>
              <input type="number" id="fbPorsi" value="1" min="1">
            </div>
            <div class="form-group">
              <label>Catatan</label>
              <input type="text" id="fbCatatan" placeholder="Alergi, request khusus...">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL MENU -->
      <div id="menuModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Menu</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="menuForm">
            <div class="form-group">
              <label>Nama Menu</label>
              <input type="text" id="menuNama" required placeholder="Nasi Goreng, Es Teh...">
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select id="menuKategori">
                <option value="makanan">🍛 Makanan</option>
                <option value="minuman">🥤 Minuman</option>
                <option value="snack">🍪 Snack</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL STOK -->
      <div id="stokModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah/Update Stok</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="stokForm">
            <div class="form-group">
              <label>Nama Bahan</label>
              <input type="text" id="stokNama" required placeholder="Beras, Gula, Minyak...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Jumlah</label>
                <input type="number" id="stokJumlah" step="0.1" required>
              </div>
              <div class="form-group">
                <label>Satuan</label>
                <select id="stokSatuan">
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                  <option value="pcs">Pcs</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
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
function renderJadwalHariIni(data) {
  const waktuOrder = ['sarapan', 'snack_pagi', 'makan_siang', 'snack_sore', 'makan_malam']
  const waktuLabel = { sarapan: '🌅 Sarapan', snack_pagi: '🕙 Snack Pagi', makan_siang: '☀️ Makan Siang', snack_sore: '🕒 Snack Sore', makan_malam: '🌙 Makan Malam' }
  
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:1rem;">Belum ada jadwal hari ini</div>'
  }
  
  return waktuOrder.map(w => {
    const item = data.find(j => j.waktu === w)
    return `
      <div class="card" style="margin-bottom:0.25rem; display:flex; justify-content:space-between; align-items:center;">
        <span>${waktuLabel[w]}</span>
        <span style="font-weight:600;">${item ? item.menu?.nama || '-' : '❌ Belum diisi'}</span>
        ${item ? `<small>${item.jumlah_porsi} porsi</small>` : ''}
      </div>
    `
  }).join('')
}

function renderJadwalList(data) {
  if (!data || data.length === 0) {
    return '<p style="text-align:center; color:var(--text-muted);">Belum ada jadwal</p>'
  }
  return data.slice(0, 10).map(j => `
    <div class="card" style="margin-bottom:0.25rem; display:flex; justify-content:space-between;">
      <span>📅 ${j.tanggal} - ${j.waktu}</span>
      <strong>${j.menu?.nama || '-'}</strong>
      <small>${j.jumlah_porsi} porsi</small>
    </div>
  `).join('')
}

function renderMenuList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada menu</div>'
  }
  
  const grouped = {}
  data.forEach(m => {
    if (!grouped[m.kategori]) grouped[m.kategori] = []
    grouped[m.kategori].push(m)
  })
  
  return Object.entries(grouped).map(([kat, items]) => `
    <h4 style="margin:0.75rem 0 0.5rem;">${kat === 'makanan' ? '🍛 Makanan' : kat === 'minuman' ? '🥤 Minuman' : '🍪 Snack'}</h4>
    ${items.map(m => `
      <div class="card" style="margin-bottom:0.25rem;">${m.nama}</div>
    `).join('')}
  `).join('')
}

function renderStokList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada stok</div>'
  }
  return data.map(s => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>📦 ${s.nama}</strong>
      </div>
      <div style="text-align:right;">
        <strong>${s.jumlah}</strong> <small>${s.satuan}</small>
        <br>
        <button class="btn-sm btn-edit" onclick="updateStok('${s.id}', '${s.nama}', ${s.jumlah}, '${s.satuan}')">✏️</button>
      </div>
    </div>
  `).join('')
}

// =============================================
// HELPERS
// =============================================
function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
}

// =============================================
// FETCH
// =============================================
async function fetchMenus() {
  const supabase = initSupabase()
  const { data } = await supabase.from('fb_menu').select('*').order('nama')
  return data || []
}

async function fetchJadwal() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('fb_jadwal')
    .select('*, menu:fb_menu(nama)')
    .order('tanggal', { ascending: false })
  return data || []
}

async function fetchStok() {
  const supabase = initSupabase()
  const { data } = await supabase.from('fb_stok').select('*').order('nama')
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initFNBEvents() {
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
    const { error } = await supabase.from('fb_jadwal').insert({
      tanggal: document.getElementById('fbTanggal').value,
      waktu: document.getElementById('fbWaktu').value,
      menu_id: document.getElementById('fbMenu').value || null,
      jumlah_porsi: parseInt(document.getElementById('fbPorsi').value),
      catatan: document.getElementById('fbCatatan').value
    })
    alert(error ? '❌ Gagal' : '✅ Jadwal ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Menu
  const menuModal = document.getElementById('menuModal')
  document.getElementById('addMenuBtn')?.addEventListener('click', () => menuModal.style.display = 'flex')
  document.getElementById('menuForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('fb_menu').insert({
      nama: document.getElementById('menuNama').value,
      kategori: document.getElementById('menuKategori').value
    })
    alert(error ? '❌ Gagal' : '✅ Menu ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Stok
  const stokModal = document.getElementById('stokModal')
  document.getElementById('addStokBtn')?.addEventListener('click', () => stokModal.style.display = 'flex')
  document.getElementById('stokForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('fb_stok').insert({
      nama: document.getElementById('stokNama').value,
      jumlah: parseFloat(document.getElementById('stokJumlah').value),
      satuan: document.getElementById('stokSatuan').value
    })
    alert(error ? '❌ Gagal' : '✅ Stok ditambah!')
    if (!error) location.reload()
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      jadwalModal.style.display = 'none'
      menuModal.style.display = 'none'
      stokModal.style.display = 'none'
    })
  })
}