// src/features/divisions/facilities.js
// Divisi Facilities - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER FACILITIES
// =============================================
export async function renderFacilities() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const inventaris = await fetchInventaris()
  const peminjaman = await fetchPeminjaman()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #37474F, #546E7A);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🛠 Facilities</h2>
        <p>Inventaris & Peminjaman</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="inventaris">📦 Inventaris</button>
        <button class="divisi-tab" data-tab="peminjaman">📋 Peminjaman</button>
      </div>
      
      <!-- TAB: INVENTARIS -->
      <div class="divisi-tab-content active" id="tab-inventaris">
        <div style="padding:1rem;">
          <button id="addInventarisBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Barang</button>
          <input type="text" id="searchInventaris" placeholder="🔍 Cari barang..." class="search-input">
          <div id="inventarisList">
            ${renderInventarisList(inventaris)}
          </div>
        </div>
      </div>
      
      <!-- TAB: PEMINJAMAN -->
      <div class="divisi-tab-content" id="tab-peminjaman">
        <div style="padding:1rem;">
          <button id="addPeminjamanBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Pinjam Barang</button>
          <div id="peminjamanList">
            ${renderPeminjamanList(peminjaman)}
          </div>
        </div>
      </div>
      
      <!-- MODAL INVENTARIS -->
      <div id="inventarisModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Barang</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="inventarisForm">
            <div class="form-group">
              <label>Nama Barang</label>
              <input type="text" id="invNama" required placeholder="Sound system, Proyektor...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Kategori</label>
                <select id="invKategori">
                  <option value="umum">Umum</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="perabot">Perabot</option>
                  <option value="dapur">Dapur</option>
                  <option value="kebersihan">Kebersihan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Jumlah</label>
                <input type="number" id="invJumlah" value="1" min="1">
              </div>
            </div>
            <div class="form-group">
              <label>Kondisi</label>
              <select id="invKondisi">
                <option value="baik">✅ Baik</option>
                <option value="rusak_ringan">⚠️ Rusak Ringan</option>
                <option value="rusak_berat">❌ Rusak Berat</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lokasi</label>
              <input type="text" id="invLokasi" placeholder="Gudang, Aula...">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL PEMINJAMAN -->
      <div id="peminjamanModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Pinjam Barang</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="peminjamanForm">
            <div class="form-group">
              <label>Barang</label>
              <select id="peminjamanBarang" required>
                <option value="">-- Pilih --</option>
                ${inventaris.filter(i => i.kondisi === 'baik').map(i => `
                  <option value="${i.id}">${i.nama} (${i.jumlah} tersedia)</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Jumlah</label>
              <input type="number" id="peminjamanJumlah" value="1" min="1" required>
            </div>
            <div class="form-group">
              <label>Tanggal Kembali (rencana)</label>
              <input type="date" id="peminjamanKembali">
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <input type="text" id="peminjamanKet" placeholder="Untuk acara...">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Pinjam</button>
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
function renderInventarisList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada barang</div>'
  }
  
  return data.map(i => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>📦 ${i.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          ${i.kategori} • Stok: ${i.jumlah} • 📍 ${i.lokasi || '-'}
        </p>
      </div>
      <span class="badge" style="font-size:0.65rem; background:${
        i.kondisi === 'baik' ? '#E8F5E9' : i.kondisi === 'rusak_ringan' ? '#FFF3E0' : '#FFEBEE'
      }; color:${
        i.kondisi === 'baik' ? '#2E7D32' : i.kondisi === 'rusak_ringan' ? '#E65100' : '#C62828'
      };">
        ${i.kondisi === 'baik' ? '✅' : i.kondisi === 'rusak_ringan' ? '⚠️' : '❌'} ${i.kondisi.replace('_', ' ')}
      </span>
    </div>
  `).join('')
}

function renderPeminjamanList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada peminjaman</div>'
  }
  
  return data.map(p => `
    <div class="card" style="margin-bottom:0.5rem;">
      <div style="display:flex; justify-content:space-between;">
        <strong>📋 ${p.inventaris?.nama || '-'}</strong>
        <span class="badge" style="font-size:0.65rem; background:${
          p.status === 'dipinjam' ? '#FFF3E0' : '#E8F5E9'
        }; color:${
          p.status === 'dipinjam' ? '#E65100' : '#2E7D32'
        };">
          ${p.status}
        </span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-muted);">
        👤 ${p.profiles?.name || '-'} • Jml: ${p.jumlah} • 📅 ${p.tanggal_pinjam}
      </p>
      ${p.status === 'dipinjam' ? `
        <button class="btn-sm" style="background:#E8F5E9; color:#2E7D32; margin-top:0.25rem;" 
                onclick="kembalikanBarang('${p.id}')">✅ Kembalikan</button>
      ` : ''}
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchInventaris() {
  const supabase = initSupabase()
  const { data } = await supabase.from('facilities_inventaris').select('*').order('nama')
  return data || []
}

async function fetchPeminjaman() {
  const supabase = initSupabase()
  const { data } = await supabase.from('facilities_peminjaman').select('*, inventaris:inventaris_id(nama), profiles(name)').order('created_at', { ascending: false }).limit(30)
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initFacilitiesEvents() {
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
  
  // Modal Inventaris
  const invModal = document.getElementById('inventarisModal')
  document.getElementById('addInventarisBtn')?.addEventListener('click', () => invModal.style.display = 'flex')
  
  document.getElementById('inventarisForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('facilities_inventaris').insert({
      nama: document.getElementById('invNama').value,
      kategori: document.getElementById('invKategori').value,
      jumlah: parseInt(document.getElementById('invJumlah').value),
      kondisi: document.getElementById('invKondisi').value,
      lokasi: document.getElementById('invLokasi').value
    })
    alert(error ? '❌ Gagal' : '✅ Barang ditambah!')
    if (!error) location.reload()
  })
  
  // Modal Peminjaman
  const pinjamModal = document.getElementById('peminjamanModal')
  document.getElementById('addPeminjamanBtn')?.addEventListener('click', () => pinjamModal.style.display = 'flex')
  
  document.getElementById('peminjamanForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    const { error } = await supabase.from('facilities_peminjaman').insert({
      inventaris_id: document.getElementById('peminjamanBarang').value,
      user_id: state.currentUser.id,
      jumlah: parseInt(document.getElementById('peminjamanJumlah').value),
      tanggal_kembali: document.getElementById('peminjamanKembali').value || null,
      keterangan: document.getElementById('peminjamanKet').value
    })
    alert(error ? '❌ Gagal' : '✅ Barang dipinjam!')
    if (!error) location.reload()
  })
  
  // Search
  document.getElementById('searchInventaris')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    document.querySelectorAll('#inventarisList .card').forEach(card => {
      card.style.display = card.textContent?.toLowerCase().includes(q) ? '' : 'none'
    })
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      invModal.style.display = 'none'
      pinjamModal.style.display = 'none'
    })
  })
}

// Global function
window.kembalikanBarang = async function(id) {
  const supabase = initSupabase()
  const { error } = await supabase.from('facilities_peminjaman').update({
    status: 'dikembalikan',
    tanggal_kembali: new Date().toISOString().split('T')[0]
  }).eq('id', id)
  
  alert(error ? '❌ Gagal' : '✅ Barang dikembalikan!')
  location.reload()
}