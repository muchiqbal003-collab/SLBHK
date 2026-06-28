// src/features/divisions/cleanliness.js
// Divisi Cleanliness & Aesthetic - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER CLEANLINESS
// =============================================
export async function renderCleanliness() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const areas = await fetchAreas()
  const users = await fetchUsers()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #00838F, #00ACC1);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🧹 Cleanliness</h2>
        <p>Kebersihan & Kerapihan</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="checklist">✅ Checklist</button>
        <button class="divisi-tab" data-tab="area">📍 Area</button>
        <button class="divisi-tab" data-tab="piket">📅 Piket</button>
      </div>
      
      <!-- TAB: CHECKLIST -->
      <div class="divisi-tab-content active" id="tab-checklist">
        <div style="padding:1rem;">
          <label>Pilih Area:</label>
          <select id="selectArea" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih Area --</option>
            ${areas.map(a => `<option value="${a.id}">${a.nama}</option>`).join('')}
          </select>
          <div id="checklistContainer">
            <p style="text-align:center; color:var(--text-muted);">Pilih area untuk lihat checklist</p>
          </div>
        </div>
      </div>
      
      <!-- TAB: AREA -->
      <div class="divisi-tab-content" id="tab-area">
        <div style="padding:1rem;">
          <button id="addAreaBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Area</button>
          <div id="areaList">
            ${renderAreaList(areas)}
          </div>
        </div>
      </div>
      
      <!-- TAB: PIKET -->
      <div class="divisi-tab-content" id="tab-piket">
        <div style="padding:1rem;">
          <label>Pilih Area:</label>
          <select id="selectAreaPiket" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih Area --</option>
            ${areas.map(a => `<option value="${a.id}">${a.nama}</option>`).join('')}
          </select>
          <div id="piketContainer">
            <p style="text-align:center; color:var(--text-muted);">Pilih area untuk lihat jadwal piket</p>
          </div>
        </div>
      </div>
      
      <!-- MODAL AREA -->
      <div id="areaModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Area</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="areaForm">
            <div class="form-group">
              <label>Nama Area</label>
              <input type="text" id="areaNama" required placeholder="Masjid, Aula, Kamar Mandi...">
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <textarea id="areaDeskripsi" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Checklist (1 item per baris)</label>
              <textarea id="areaChecklist" rows="4" placeholder="Sapu lantai&#10;Pel lantai&#10;Bersihkan kaca&#10;Buang sampah"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL PIKET -->
      <div id="piketModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Jadwal Piket</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="piketForm">
            <input type="hidden" id="piketAreaId">
            <div class="form-group">
              <label>Petugas</label>
              <select id="piketUser">
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Hari</label>
              <select id="piketHari">
                <option value="senin">Senin</option>
                <option value="selasa">Selasa</option>
                <option value="rabu">Rabu</option>
                <option value="kamis">Kamis</option>
                <option value="jumat">Jumat</option>
                <option value="sabtu">Sabtu</option>
                <option value="ahad">Ahad</option>
              </select>
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
function renderAreaList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada area</div>'
  }
  return data.map(a => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>📍 ${a.nama}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${a.deskripsi || '-'}</p>
      </div>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchAreas() {
  const supabase = initSupabase()
  const { data } = await supabase.from('cleanliness_area').select('*').order('nama')
  return data || []
}

async function fetchUsers() {
  const supabase = initSupabase()
  const { data } = await supabase.from('profiles').select('id, name').eq('is_active', true).order('name')
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initCleanlinessEvents() {
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
  
  // Modal Area
  const areaModal = document.getElementById('areaModal')
  document.getElementById('addAreaBtn')?.addEventListener('click', () => areaModal.style.display = 'flex')
  
  document.getElementById('areaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Insert area
    const { data: area, error } = await supabase.from('cleanliness_area').insert({
      nama: document.getElementById('areaNama').value,
      deskripsi: document.getElementById('areaDeskripsi').value
    }).select().single()
    
    if (error) {
      alert('❌ Gagal: ' + error.message)
      return
    }
    
    // Insert checklist
    const checklistText = document.getElementById('areaChecklist').value
    if (checklistText.trim()) {
      const items = checklistText.split('\n').filter(l => l.trim()).map(item => ({
        area_id: area.id,
        item: item.trim()
      }))
      await supabase.from('cleanliness_checklist').insert(items)
    }
    
    alert('✅ Area & checklist dibuat!')
    location.reload()
  })
  
  // Select area untuk checklist
  document.getElementById('selectArea')?.addEventListener('change', async (e) => {
    const areaId = e.target.value
    if (!areaId) return
    
    const { data: checklists } = await supabase
      .from('cleanliness_checklist')
      .select('*')
      .eq('area_id', areaId)
      .order('created_at')
    
    const container = document.getElementById('checklistContainer')
    const total = checklists?.length || 0
    const checked = checklists?.filter(c => c.is_checked).length || 0
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0
    
    container.innerHTML = `
      <div style="margin-bottom:1rem;">
        <div class="progress-bar-large">
          <div class="progress-fill-large" style="width:${pct}%">${pct}%</div>
        </div>
        <small>${checked}/${total} bersih</small>
      </div>
      ${checklists?.map(c => `
        <div class="card" style="margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
          <input type="checkbox" ${c.is_checked ? 'checked' : ''} 
                 onchange="updateCleanChecklist('${c.id}', this.checked)" 
                 style="accent-color:var(--primary); width:18px; height:18px;">
          <span style="flex:1; ${c.is_checked ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${c.item}</span>
        </div>
      `).join('') || '<p>Tidak ada checklist</p>'}
    `
  })
  
  // Select area untuk piket
  document.getElementById('selectAreaPiket')?.addEventListener('change', async (e) => {
    const areaId = e.target.value
    if (!areaId) return
    
    const { data: pikets } = await supabase
      .from('cleanliness_piket')
      .select('*, profiles(name)')
      .eq('area_id', areaId)
      .order('hari')
    
    const container = document.getElementById('piketContainer')
    const hariOrder = ['senin','selasa','rabu','kamis','jumat','sabtu','ahad']
    
    container.innerHTML = `
      <button class="btn btn-outline" style="margin-bottom:0.5rem; width:100%;" 
              onclick="document.getElementById('piketAreaId').value='${areaId}'; document.getElementById('piketModal').style.display='flex'">
        + Tambah Piket
      </button>
      ${hariOrder.map(hari => {
        const piket = pikets?.find(p => p.hari === hari)
        return `
          <div class="card" style="margin-bottom:0.25rem; display:flex; justify-content:space-between;">
            <strong>${hari.toUpperCase()}</strong>
            <span>${piket ? '👤 ' + piket.profiles?.name : '❌ Kosong'}</span>
          </div>
        `
      }).join('')}
    `
  })
  
  // Piket Form
  document.getElementById('piketForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('cleanliness_piket').insert({
      area_id: document.getElementById('piketAreaId').value,
      user_id: document.getElementById('piketUser').value,
      hari: document.getElementById('piketHari').value
    })
    alert(error ? '❌ Gagal' : '✅ Piket ditambah!')
    if (!error) {
      document.getElementById('piketModal').style.display = 'none'
      document.getElementById('selectAreaPiket').dispatchEvent(new Event('change'))
    }
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      areaModal.style.display = 'none'
      document.getElementById('piketModal').style.display = 'none'
    })
  })
}

window.updateCleanChecklist = async function(id, checked) {
  const supabase = initSupabase()
  const state = appState.getState()
  await supabase.from('cleanliness_checklist').update({ 
    is_checked: checked,
    checked_by: checked ? state.currentUser.id : null,
    checked_at: checked ? new Date().toISOString() : null
  }).eq('id', id)
  
  const areaId = document.getElementById('selectArea').value
  if (areaId) document.getElementById('selectArea').dispatchEvent(new Event('change'))
}