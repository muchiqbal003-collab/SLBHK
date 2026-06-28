// src/features/admin/divisionSetup.js
import { initSupabase } from '../../supabase/client.js'
import { AVAILABLE_FEATURES } from '../../config/permissions.js'

export async function renderDivisionManagement() {
  const divisions = await fetchDivisions()
  const users = await fetchUsers()
  
  return `
    <div style="max-width:1200px; margin:0 auto; padding:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h1>🏢 Kelola Divisi</h1>
          <p style="color:var(--text-muted);">Tambah, edit, dan atur fitur divisi</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <a href="#/admin" class="btn btn-outline">← Admin Panel</a>
          <button id="addDivisionBtn" class="btn btn-primary">+ Tambah Divisi</button>
        </div>
      </div>
      
      <!-- Daftar Divisi -->
      <div class="divisions-grid" id="divisionsGrid">
        ${renderDivisionCards(divisions)}
      </div>
      
      <!-- Modal Tambah/Edit Divisi -->
      <div id="divisionModal" class="modal" style="display:none;">
        <div class="modal-content" style="max-width:600px;">
          <div class="modal-header">
            <h3 id="divisionModalTitle">Tambah Divisi</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="divisionForm">
            <input type="hidden" id="divisionId">
            <div class="form-group">
              <label>Nama Divisi</label>
              <input type="text" id="divisionName" required placeholder="Contoh: Halaqoh, Kesehatan">
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <textarea id="divisionDesc" rows="3" placeholder="Deskripsi singkat divisi..."></textarea>
            </div>
            <div class="form-group">
              <label>Ketua Divisi</label>
              <select id="divisionKetua">
                <option value="">-- Pilih Ketua --</option>
                ${users.map(u => `
                  <option value="${u.id}">${u.name} (${u.email})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Fitur yang Diaktifkan</label>
              <div class="feature-checkboxes" id="divisionFeatures">
                ${AVAILABLE_FEATURES.map(f => `
                  <label class="feature-checkbox">
                    <input type="checkbox" value="${f.id}" class="feature-cb">
                    <span>${f.icon} ${f.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Modal Konfirmasi Hapus -->
      <div id="deleteModal" class="modal" style="display:none;">
        <div class="modal-content" style="max-width:400px; text-align:center;">
          <h3 style="margin-bottom:1rem;">🗑️ Hapus Divisi?</h3>
          <p style="margin-bottom:1.5rem;">Semua data terkait divisi ini akan dinonaktifkan.</p>
          <input type="hidden" id="deleteDivisionId">
          <div style="display:flex; gap:0.5rem; justify-content:center;">
            <button class="btn btn-outline modal-close">Batal</button>
            <button id="confirmDeleteBtn" class="btn btn-primary" style="background:#ef4444;">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderDivisionCards(divisions) {
  if (!divisions || divisions.length === 0) {
    return `
      <div class="card" style="text-align:center; padding:3rem;">
        <p style="font-size:3rem;">🏢</p>
        <h3>Belum ada divisi</h3>
        <p style="color:var(--text-muted);">Klik "Tambah Divisi" untuk membuat</p>
      </div>
    `
  }
  
  return divisions.map(d => `
    <div class="division-card-detail">
      <div class="division-card-header">
        <h3>🏢 ${d.name}</h3>
        <span class="badge ${d.is_active ? 'badge-division' : ''}" style="${!d.is_active ? 'background:#fef2f2; color:#ef4444;' : ''}">
          ${d.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      
      <p style="color:var(--text-muted); margin-bottom:0.75rem;">${d.description || 'Tidak ada deskripsi'}</p>
      
      ${d.ketua_name ? `
        <p style="font-size:0.85rem; margin-bottom:0.5rem;">
          <strong>👤 Ketua:</strong> ${d.ketua_name}
        </p>
      ` : ''}
      
      ${d.features && d.features.length > 0 ? `
        <div class="feature-list" style="margin-bottom:0.75rem;">
          <strong style="font-size:0.8rem; color:var(--text-muted);">Fitur:</strong>
          ${d.features.map(f => {
            const featureInfo = AVAILABLE_FEATURES.find(af => af.id === f)
            return `<span class="feature-tag">${featureInfo?.icon || '📌'} ${featureInfo?.label || f}</span>`
          }).join('')}
        </div>
      ` : ''}
      
      <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem;">
        Dibuat: ${new Date(d.created_at).toLocaleDateString('id-ID')}
      </p>
      
      <div style="display:flex; gap:0.5rem;">
        <button class="btn-edit-division btn-sm btn-edit" data-id="${d.id}">✏️ Edit</button>
        <button class="btn-delete-division btn-sm btn-delete" data-id="${d.id}">🗑️ Hapus</button>
        <button class="btn-sm" style="background:#f0fdf4; color:#15803d;" data-id="${d.id}" onclick="window.location.hash='#/division-detail/${d.id}'">
          📊 Detail
        </button>
      </div>
    </div>
  `).join('')
}

async function fetchDivisions() {
    const supabase = initSupabase()
    
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Gagal fetch divisi:', error)
      return []
    }
    
    if (!data) return []
    
    // Ambil nama ketua secara terpisah
    const divisionsWithKetua = await Promise.all(data.map(async (d) => {
      let ketua_name = null
      if (d.ketua_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', d.ketua_id)
          .single()
        ketua_name = profile?.name || null
      }
      return { ...d, ketua_name }
    }))
    
    return divisionsWithKetua
  }
async function fetchUsers() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('is_active', true)
    .order('name')
  
  return data || []
}

// Init events
export function initDivisionEvents() {
  const modal = document.getElementById('divisionModal')
  const deleteModal = document.getElementById('deleteModal')
  const closeBtns = document.querySelectorAll('.modal-close')
  
  // Buka modal tambah
  document.getElementById('addDivisionBtn')?.addEventListener('click', () => openDivisionModal())
  
  // Tutup modal
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'none'
      deleteModal.style.display = 'none'
    })
  })
  
  // Submit form
  document.getElementById('divisionForm')?.addEventListener('submit', handleDivisionSubmit)
  
  // Edit buttons
  document.querySelectorAll('.btn-edit-division').forEach(btn => {
    btn.addEventListener('click', () => openDivisionModal(btn.dataset.id))
  })
  
  // Delete buttons
  document.querySelectorAll('.btn-delete-division').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('deleteDivisionId').value = btn.dataset.id
      deleteModal.style.display = 'flex'
    })
  })
  
  // Confirm delete
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleDeleteDivision)
}

async function openDivisionModal(divisionId = null) {
  const modal = document.getElementById('divisionModal')
  const title = document.getElementById('divisionModalTitle')
  const form = document.getElementById('divisionForm')
  
  form.reset()
  document.getElementById('divisionId').value = ''
  document.querySelectorAll('.feature-cb').forEach(cb => cb.checked = false)
  
  if (divisionId) {
    title.textContent = 'Edit Divisi'
    document.getElementById('divisionId').value = divisionId
    
    const supabase = initSupabase()
    const { data } = await supabase
      .from('divisions')
      .select('*')
      .eq('id', divisionId)
      .single()
    
    if (data) {
      document.getElementById('divisionName').value = data.name || ''
      document.getElementById('divisionDesc').value = data.description || ''
      document.getElementById('divisionKetua').value = data.ketua_id || ''
      
      // Ceklis fitur
      const features = data.features || []
      document.querySelectorAll('.feature-cb').forEach(cb => {
        cb.checked = features.includes(cb.value)
      })
    }
  } else {
    title.textContent = 'Tambah Divisi'
  }
  
  modal.style.display = 'flex'
}

async function handleDivisionSubmit(e) {
  e.preventDefault()
  
  const id = document.getElementById('divisionId').value
  const name = document.getElementById('divisionName').value
  const description = document.getElementById('divisionDesc').value
  const ketuaId = document.getElementById('divisionKetua').value
  
  // Ambil fitur yang dicentang
  const features = []
  document.querySelectorAll('.feature-cb:checked').forEach(cb => {
    features.push(cb.value)
  })
  
  const supabase = initSupabase()
  
  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from('divisions')
        .update({
          name,
          description,
          ketua_id: ketuaId || null,
          features,
          updated_at: new Date()
        })
        .eq('id', id)
      
      if (error) throw error
      alert('✅ Divisi berhasil diupdate!')
    } else {
      // Insert baru
      const { error } = await supabase
        .from('divisions')
        .insert({
          name,
          description,
          ketua_id: ketuaId || null,
          features
        })
      
      if (error) throw error
      alert('✅ Divisi baru berhasil dibuat!')
      
      // Buat statistik awal
      const { data: newDiv } = await supabase
        .from('divisions')
        .select('id')
        .eq('name', name)
        .single()
      
      if (newDiv) {
        await supabase
          .from('division_stats')
          .insert({
            division_id: newDiv.id,
            total_members: 0,
            today_activities: 0,
            attendance_rate: 0,
            monthly_achievement: 0
          })
      }
    }
    
    document.getElementById('divisionModal').style.display = 'none'
    window.location.hash = '#/divisions'
    
  } catch (error) {
    alert('❌ Gagal: ' + error.message)
  }
}

async function handleDeleteDivision() {
  const id = document.getElementById('deleteDivisionId').value
  if (!id) return
  
  const supabase = initSupabase()
  
  try {
    const { error } = await supabase
      .from('divisions')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    alert('✅ Divisi dinonaktifkan')
    document.getElementById('deleteModal').style.display = 'none'
    window.location.hash = '#/divisions'
    
  } catch (error) {
    alert('❌ Gagal: ' + error.message)
  }
}