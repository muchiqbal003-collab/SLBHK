// src/features/divisions/medical.js
// Divisi Medical - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER MEDICAL
// =============================================
export async function renderMedical() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const pasien = await fetchPasien()
  const obat = await fetchObat()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #C62828, #EF5350);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🩺 Medical</h2>
        <p>Klinik & Daarussyifa</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="pasien">🤒 Pasien</button>
        <button class="divisi-tab" data-tab="obat">💊 Obat</button>
        <button class="divisi-tab" data-tab="riwayat">📋 Riwayat</button>
      </div>
      
      <!-- TAB: PASIEN -->
      <div class="divisi-tab-content active" id="tab-pasien">
        <div style="padding:1rem;">
          <button id="addPasienBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Pasien Baru</button>
          <input type="text" id="searchPasien" placeholder="🔍 Cari pasien..." class="search-input">
          <div id="pasienList">
            ${renderPasienList(pasien)}
          </div>
        </div>
      </div>
      
      <!-- TAB: OBAT -->
      <div class="divisi-tab-content" id="tab-obat">
        <div style="padding:1rem;">
          <button id="addObatBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Obat</button>
          <div id="obatList">
            ${renderObatList(obat)}
          </div>
        </div>
      </div>
      
      <!-- TAB: RIWAYAT -->
      <div class="divisi-tab-content" id="tab-riwayat">
        <div style="padding:1rem;">
          <label>Pilih Pasien:</label>
          <select id="selectPasien" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih --</option>
            ${pasien.map(p => `<option value="${p.id}">${p.nama} (${p.kondisi})</option>`).join('')}
          </select>
          <div id="riwayatContainer">
            <p style="text-align:center; color:var(--text-muted);">Pilih pasien untuk lihat riwayat</p>
          </div>
        </div>
      </div>
      
      <!-- MODAL PASIEN -->
      <div id="pasienModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Pasien Baru</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="pasienForm">
            <div class="form-group">
              <label>Nama Pasien</label>
              <input type="text" id="pasienNama" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Usia</label>
                <input type="number" id="pasienUsia" min="1">
              </div>
              <div class="form-group">
                <label>Kondisi</label>
                <select id="pasienKondisi">
                  <option value="ringan">🟢 Ringan</option>
                  <option value="sedang">🟡 Sedang</option>
                  <option value="darurat">🔴 Darurat</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Keluhan</label>
              <textarea id="pasienKeluhan" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Diagnosa</label>
              <input type="text" id="pasienDiagnosa" placeholder="Hasil diagnosa...">
            </div>
            <div class="form-group">
              <label>Tindakan</label>
              <input type="text" id="pasienTindakan" placeholder="Tindakan yang diberikan...">
            </div>
            <div class="form-group">
              <label>Obat Diberikan</label>
              <select id="pasienObat">
                <option value="">-- Pilih --</option>
                ${obat.map(o => `<option value="${o.nama}">${o.nama} (Stok: ${o.stok})</option>`).join('')}
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL OBAT -->
      <div id="obatModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Obat</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="obatForm">
            <div class="form-group">
              <label>Nama Obat</label>
              <input type="text" id="obatNama" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Jenis</label>
                <input type="text" id="obatJenis" placeholder="Tablet, Sirup...">
              </div>
              <div class="form-group">
                <label>Satuan</label>
                <select id="obatSatuan">
                  <option value="tablet">Tablet</option>
                  <option value="botol">Botol</option>
                  <option value="strip">Strip</option>
                  <option value="kapsul">Kapsul</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Stok</label>
                <input type="number" id="obatStok" value="0" min="0">
              </div>
              <div class="form-group">
                <label>Expired</label>
                <input type="date" id="obatExpired">
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
function renderPasienList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada pasien</div>'
  }
  
  return data.map(p => `
    <div class="card" style="margin-bottom:0.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🤒 ${p.nama}</strong>
          <p style="font-size:0.8rem; color:var(--text-muted);">Usia: ${p.usia || '-'} • ${p.keluhan?.substring(0, 40) || '-'}</p>
        </div>
        <span class="badge" style="font-size:0.65rem; background:${
          p.kondisi === 'ringan' ? '#E8F5E9' : p.kondisi === 'sedang' ? '#FFF3E0' : p.kondisi === 'darurat' ? '#FFEBEE' : '#F5F5F5'
        }; color:${
          p.kondisi === 'ringan' ? '#2E7D32' : p.kondisi === 'sedang' ? '#E65100' : p.kondisi === 'darurat' ? '#C62828' : '#666'
        };">
          ${p.kondisi}
        </span>
      </div>
      <button class="btn-sm btn-edit" style="margin-top:0.25rem;" onclick="selesaikanPasien('${p.id}')">✅ Selesai</button>
    </div>
  `).join('')
}

function renderObatList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada obat</div>'
  }
  
  return data.map(o => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>💊 ${o.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${o.jenis || '-'} • Stok: ${o.stok} ${o.satuan}</p>
        ${o.expired ? `<small style="color:${new Date(o.expired) < new Date() ? '#ef4444' : 'var(--text-muted)'};">⚠️ Exp: ${o.expired}</small>` : ''}
      </div>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchPasien() {
  const supabase = initSupabase()
  const { data } = await supabase.from('medical_pasien').select('*').order('created_at', { ascending: false })
  return data || []
}

async function fetchObat() {
  const supabase = initSupabase()
  const { data } = await supabase.from('medical_obat').select('*').order('nama')
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initMedicalEvents() {
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
  
  // Modal Pasien
  const pasienModal = document.getElementById('pasienModal')
  document.getElementById('addPasienBtn')?.addEventListener('click', () => pasienModal.style.display = 'flex')
  
  document.getElementById('pasienForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    
    // Insert pasien
    const { data: pasien, error } = await supabase.from('medical_pasien').insert({
      nama: document.getElementById('pasienNama').value,
      usia: parseInt(document.getElementById('pasienUsia').value) || null,
      keluhan: document.getElementById('pasienKeluhan').value,
      kondisi: document.getElementById('pasienKondisi').value
    }).select().single()
    
    if (error) {
      alert('❌ Gagal: ' + error.message)
      return
    }
    
    // Insert pemeriksaan
    const obatNama = document.getElementById('pasienObat').value
    await supabase.from('medical_periksa').insert({
      pasien_id: pasien.id,
      user_id: state.currentUser.id,
      diagnosa: document.getElementById('pasienDiagnosa').value,
      tindakan: document.getElementById('pasienTindakan').value,
      obat: obatNama || null
    })
    
    // Kurangi stok obat
    if (obatNama) {
      await supabase.rpc('kurangi_stok_obat', { obat_nama: obatNama })
    }
    
    alert('✅ Pasien dicatat!')
    location.reload()
  })
  
  // Modal Obat
  const obatModal = document.getElementById('obatModal')
  document.getElementById('addObatBtn')?.addEventListener('click', () => obatModal.style.display = 'flex')
  
  document.getElementById('obatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('medical_obat').insert({
      nama: document.getElementById('obatNama').value,
      jenis: document.getElementById('obatJenis').value,
      stok: parseInt(document.getElementById('obatStok').value),
      satuan: document.getElementById('obatSatuan').value,
      expired: document.getElementById('obatExpired').value || null
    })
    alert(error ? '❌ Gagal' : '✅ Obat ditambah!')
    if (!error) location.reload()
  })
  
  // Riwayat
  document.getElementById('selectPasien')?.addEventListener('change', async (e) => {
    const pasienId = e.target.value
    if (!pasienId) return
    
    const { data } = await supabase
      .from('medical_periksa')
      .select('*, profiles(name)')
      .eq('pasien_id', pasienId)
      .order('created_at', { ascending: false })
    
    const container = document.getElementById('riwayatContainer')
    container.innerHTML = data?.map(p => `
      <div class="card" style="margin-bottom:0.5rem;">
        <strong>📅 ${new Date(p.created_at).toLocaleDateString('id-ID')}</strong>
        <p style="font-size:0.85rem;">👨‍⚕️ ${p.profiles?.name || '-'}</p>
        <p>🔍 Diagnosa: ${p.diagnosa || '-'}</p>
        <p>💉 Tindakan: ${p.tindakan || '-'}</p>
        <p>💊 Obat: ${p.obat || '-'}</p>
      </div>
    `).join('') || '<p>Tidak ada riwayat</p>'
  })
  
  // Search
  document.getElementById('searchPasien')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    document.querySelectorAll('#pasienList .card').forEach(card => {
      card.style.display = card.textContent?.toLowerCase().includes(q) ? '' : 'none'
    })
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      pasienModal.style.display = 'none'
      obatModal.style.display = 'none'
    })
  })
}

// Global functions
window.selesaikanPasien = async function(id) {
  const supabase = initSupabase()
  await supabase.from('medical_pasien').update({ kondisi: 'selesai' }).eq('id', id)
  alert('✅ Pasien selesai ditangani!')
  location.reload()
}