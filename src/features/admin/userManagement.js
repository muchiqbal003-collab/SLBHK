// src/features/admin/userManagement.js
// Admin Panel - Pusat Data PLBMS
import appState from '../../core/store/appState.js'
import permissionManager from '../../core/auth/permissionManager.js'
import { initSupabase } from '../../supabase/client.js'
import { ROLES, ROLE_PERMISSIONS, AVAILABLE_FEATURES } from '../../config/permissions.js'

// =============================================
// RENDER ADMIN PANEL (PUSAT DATA)
// =============================================
export async function renderAdminPanel() {
  const user = appState.getState().currentUser
  
  if (!permissionManager.canAccess('user_management')) {
    return `
      <div style="text-align:center; padding:4rem;">
        <h1>🚫</h1>
        <h2>Akses Ditolak</h2>
        <p>Anda tidak punya akses ke halaman ini</p>
        <a href="#/dashboard" class="btn btn-primary" style="display:inline-block; margin-top:1rem; text-decoration:none;">Kembali</a>
      </div>
    `
  }
  
  const users = await fetchUsers()
  
  return `
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <div>
          <h1>⚙️ Pusat Data</h1>
          <p>Manajemen User, Role, Divisi & Monitoring</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <a href="#/dashboard" class="btn btn-outline">← Dashboard</a>
          <button id="addUserBtn" class="btn btn-primary">+ Tambah User</button>
        </div>
      </div>
      
      <!-- Tab Navigation -->
      <div class="admin-tabs">
        <button class="tab active" data-tab="users">👥 Users</button>
        <button class="tab" data-tab="roles">🔑 Role</button>
        <button class="tab" data-tab="divisions">🏢 Divisi</button>
        <button class="tab" data-tab="monitoring">📊 Monitoring</button>
        <button class="tab" data-tab="ibadah">🕌 Ibadah</button>
        <button class="tab" data-tab="laporan">📋 Laporan</button>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: USERS -->
      <!-- ============================================= -->
      <div class="tab-content active" id="tab-users">
        <div class="card">
          <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <input type="text" id="searchUser" placeholder="🔍 Cari user..." class="search-input" style="margin-bottom:0;">
          </div>
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Divisi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                ${renderUsersTable(users)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: ROLES -->
      <!-- ============================================= -->
      <div class="tab-content" id="tab-roles">
        <div class="card">
          <h3 style="margin-bottom:1rem;">🔑 Daftar Role & Permission</h3>
          <div id="rolesList">
            ${renderRolesList()}
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: DIVISIONS -->
      <!-- ============================================= -->
      <div class="tab-content" id="tab-divisions">
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3>🏢 Daftar Divisi</h3>
            <a href="#/divisions" class="btn btn-primary" style="width:auto;">+ Kelola Divisi</a>
          </div>
          <div id="divisionsList">
            <p style="text-align:center; padding:2rem;">Memuat...</p>
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: MONITORING -->
      <!-- ============================================= -->
      <div class="tab-content" id="tab-monitoring">
        <div class="card" style="margin-bottom:1rem;">
          <h3>📊 Kondisi Seluruh Divisi</h3>
          <div id="monitoringSummary" class="monitoring-grid">
            <p style="text-align:center; padding:2rem;">Memuat data...</p>
          </div>
        </div>
        
        <div class="card">
          <h3>📈 Progress Persiapan</h3>
          <div id="progressGlobal">
            <p style="text-align:center; padding:2rem;">Memuat...</p>
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: IBADAH -->
      <!-- ============================================= -->
      <div class="tab-content" id="tab-ibadah">
        <div class="card" style="margin-bottom:1rem;">
          <h3>🕌 Rekap Sholat Anggota</h3>
          <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <button class="btn btn-outline ibadah-periode active" data-hari="7">7 Hari</button>
            <button class="btn btn-outline ibadah-periode" data-hari="30">30 Hari</button>
          </div>
          <div id="ibadahSholatResult">
            <p style="text-align:center; padding:1rem; color:var(--text-muted);">Klik periode</p>
          </div>
        </div>
        
        <div class="card">
          <h3>📖 Rekap Tilawah</h3>
          <div id="ibadahTilawahResult">
            <p style="text-align:center; padding:1rem; color:var(--text-muted);">Klik periode sholat untuk melihat</p>
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- TAB: LAPORAN -->
      <!-- ============================================= -->
      <div class="tab-content" id="tab-laporan">
        <div class="card">
          <h3>📋 Laporan Kinerja Terbaru</h3>
          <div id="laporanList">
            <p style="text-align:center; padding:2rem;">Memuat...</p>
          </div>
        </div>
      </div>
      
      <!-- ============================================= -->
      <!-- MODAL TAMBAH/EDIT USER -->
      <!-- ============================================= -->
      <div id="userModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Tambah User</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="userForm">
            <input type="hidden" id="userId">
            <div class="form-group">
              <label>Nama</label>
              <input type="text" id="userName" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="userEmail" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="userPassword" minlength="8" placeholder="Minimal 8 karakter">
              <small style="color:var(--text-muted);">Kosongkan jika tidak ingin mengubah</small>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select id="userRole">
                ${Object.entries(ROLES).map(([key, val]) => `
                  <option value="${val}">${ROLE_PERMISSIONS[val]?.label || val}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Divisi (bisa pilih lebih dari satu)</label>
              <div id="userDivisions" class="feature-checkboxes">
                <p style="font-size:0.8rem; color:var(--text-muted);">Memuat divisi...</p>
              </div>
            </div>
            <div class="form-group">
              <label>Fitur Tambahan</label>
              <div id="customFeatures" class="feature-checkboxes"></div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

// =============================================
// RENDER FUNCTIONS
// =============================================
function renderUsersTable(users) {
  if (!users || users.length === 0) {
    return '<tr><td colspan="6" style="text-align:center; padding:2rem;">Belum ada user</td></tr>'
  }
  return users.map(u => `
    <tr>
      <td><strong>${u.name || '-'}</strong></td>
      <td>${u.email || '-'}</td>
      <td><span class="badge badge-role">${ROLE_PERMISSIONS[u.role]?.label || u.role}</span></td>
      <td>${u.division_names || '-'}</td>
      <td><span class="status-dot ${u.is_active ? 'active' : 'inactive'}"></span> ${u.is_active ? 'Aktif' : 'Nonaktif'}</td>
      <td>
        <button class="btn-sm btn-edit" data-id="${u.id}">✏️</button>
        <button class="btn-sm btn-delete" data-id="${u.id}">🗑️</button>
      </td>
    </tr>
  `).join('')
}

function renderRolesList() {
  return Object.entries(ROLE_PERMISSIONS).map(([key, role]) => `
    <div class="role-card">
      <h4>${role.label} <span class="badge badge-role">${key}</span></h4>
      <div class="feature-list">
        ${role.features.includes('*') 
          ? '<span class="feature-tag">✨ Semua Fitur</span>' 
          : role.features.map(f => `<span class="feature-tag">${f}</span>`).join('')
        }
      </div>
      <div class="role-perms">
        ${role.canManageUsers ? '<span>👥 Kelola User</span>' : ''}
        ${role.canManageDivisions ? '<span>🏢 Kelola Divisi</span>' : ''}
        ${role.canViewAllReports ? '<span>📊 Lihat Laporan</span>' : ''}
        ${role.canApprove ? '<span>✅ Approval</span>' : ''}
        ${role.canViewIbadahStats ? '<span>🕌 Stat Ibadah</span>' : ''}
      </div>
    </div>
  `).join('')
}

// =============================================
// FETCH FUNCTIONS
// =============================================
async function fetchUsers() {
  const supabase = initSupabase()
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (!data) return []
  
  const usersWithDivisions = await Promise.all(data.map(async (u) => {
    const { data: userDivs } = await supabase
      .from('user_divisions')
      .select('division_id, divisions(name)')
      .eq('user_id', u.id)
    let divisionNames = '-'
    if (userDivs && userDivs.length > 0) {
      divisionNames = userDivs.map(ud => ud.divisions?.name || '?').join(', ')
    }
    return { ...u, division_names: divisionNames }
  }))
  return usersWithDivisions
}

async function loadDivisions() {
  const supabase = initSupabase()
  const { data } = await supabase.from('divisions').select('*').order('name')
  const container = document.getElementById('divisionsList')
  if (!container) return
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:2rem;">Belum ada divisi. <a href="#/divisions" style="color:var(--primary);">Kelola Divisi →</a></p>'
    return
  }
  
  const divisionsWithKetua = await Promise.all(data.map(async (d) => {
    let ketuaName = 'Belum ditentukan'
    if (d.ketua_id) {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', d.ketua_id).single()
      ketuaName = profile?.name || 'Belum ditentukan'
    }
    return { ...d, ketuaName }
  }))
  
  container.innerHTML = divisionsWithKetua.map(d => `
    <div class="division-card">
      <div>
        <strong>🏢 ${d.name}</strong>
        <p style="color:var(--text-muted); font-size:0.875rem;">${d.description || '-'}</p>
        <p style="font-size:0.75rem; color:var(--text-muted);">
          👤 Ketua: ${d.ketuaName} | 📌 Fitur: ${(d.features || []).length} aktif
        </p>
      </div>
      <span class="badge ${d.is_active ? 'badge-division' : ''}" style="${!d.is_active ? 'background:#fef2f2;color:#ef4444;' : ''}">
        ${d.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    </div>
  `).join('')
}

// =============================================
// MONITORING FUNCTIONS
// =============================================
async function loadMonitoring() {
  const supabase = initSupabase()
  const { data: divisions } = await supabase.from('divisions').select('*').eq('is_active', true)
  const summaryDiv = document.getElementById('monitoringSummary')
  
  if (divisions && divisions.length > 0) {
    const summaries = await Promise.all(divisions.map(async (d) => {
      const { count } = await supabase.from('user_divisions').select('*', { count: 'exact', head: true }).eq('division_id', d.id)
      const { data: checklists } = await supabase.from('division_checklists').select('*').eq('division_id', d.id)
      const total = checklists?.length || 0
      const checked = checklists?.filter(c => c.is_checked).length || 0
      const pct = total > 0 ? Math.round((checked / total) * 100) : 100
      let statusColor = '🟢'
      if (pct < 50) statusColor = '🔴'
      else if (pct < 80) statusColor = '🟡'
      return { ...d, memberCount: count || 0, percentage: pct, statusColor }
    }))
    
    summaryDiv.innerHTML = summaries.map(d => `
      <div class="monitoring-card">
        <div class="monitoring-status">${d.statusColor}</div>
        <strong>${d.name}</strong>
        <small>👥 ${d.memberCount} anggota</small>
        <div class="progress-bar-mini">
          <div class="progress-fill" style="width:${d.percentage}%; background:${d.percentage < 50 ? '#ef4444' : d.percentage < 80 ? '#f59e0b' : '#22c55e'}"></div>
        </div>
        <small>${d.percentage}% siap</small>
      </div>
    `).join('')
  }
  
  // Progress global
  const { data: allChecklists } = await supabase.from('division_checklists').select('*')
  const total = allChecklists?.length || 0
  const checked = allChecklists?.filter(c => c.is_checked).length || 0
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  
  document.getElementById('progressGlobal').innerHTML = `
    <div class="progress-bar-large" style="margin:1rem 0;">
      <div class="progress-fill-large" style="width:${pct}%">${pct}%</div>
    </div>
    <p style="text-align:center;">${checked} dari ${total} checklist selesai</p>
  `
}

async function loadIbadahRekap(hari) {
  const supabase = initSupabase()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - hari)
  const startStr = startDate.toISOString().split('T')[0]
  
  // Sholat
  const { data: sholatData } = await supabase
    .from('sholat_records')
    .select('*, profiles(name)')
    .gte('tanggal', startStr)
  
  const resultDiv = document.getElementById('ibadahSholatResult')
  if (!sholatData || sholatData.length === 0) {
    resultDiv.innerHTML = '<p style="text-align:center; padding:1rem;">Tidak ada data</p>'
    return
  }
  
  const userStats = {}
  sholatData.forEach(d => {
    if (!userStats[d.user_id]) userStats[d.user_id] = { name: d.profiles?.name || '-', total: 0, count: 0 }
    const sholatHariIni = [d.subuh, d.dzuhur, d.ashar, d.maghrib, d.isya].filter(s => s !== 'belum').length
    userStats[d.user_id].total += sholatHariIni
    userStats[d.user_id].count += 5
  })
  
  resultDiv.innerHTML = Object.values(userStats).map(u => {
    const pct = u.count > 0 ? Math.round((u.total / u.count) * 100) : 0
    return `
      <div class="ibadah-row">
        <span style="min-width:120px;">${u.name}</span>
        <div class="progress-bar-mini" style="flex:1; margin:0 1rem;">
          <div class="progress-fill" style="width:${pct}%; background:${pct < 50 ? '#ef4444' : pct < 80 ? '#f59e0b' : '#22c55e'}"></div>
        </div>
        <span style="font-weight:600;">${pct}%</span>
      </div>
    `
  }).join('')
  
  // Tilawah
  const { data: tilawahData } = await supabase
    .from('tilawah_records')
    .select('*, profiles(name)')
    .gte('tanggal', startStr)
  
  const tilawahDiv = document.getElementById('ibadahTilawahResult')
  const tilawahStats = {}
  tilawahData?.forEach(d => {
    if (!tilawahStats[d.user_id]) tilawahStats[d.user_id] = { name: d.profiles?.name || '-', juz: 0, ayat: 0 }
    tilawahStats[d.user_id].juz += d.juz || 0
    tilawahStats[d.user_id].ayat += d.ayat || 0
  })
  
  tilawahDiv.innerHTML = Object.values(tilawahStats).map(u => `
    <div class="ibadah-row">
      <span style="min-width:120px;">${u.name}</span>
      <span>📖 ${u.juz} Juz</span>
      <span>📝 ${u.ayat} Ayat</span>
    </div>
  `).join('') || '<p style="text-align:center;">Tidak ada data</p>'
}

async function loadLaporan() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('laporan_kinerja')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(20)
  
  const container = document.getElementById('laporanList')
  container.innerHTML = data?.map(l => `
    <div class="laporan-item">
      <strong>📋 ${l.nama_acara}</strong>
      <small>👤 ${l.profiles?.name || '-'} | 📅 ${new Date(l.tanggal_acara).toLocaleDateString('id-ID')}</small>
      <p style="font-size:0.85rem;">${l.deskripsi?.substring(0, 120)}...</p>
      ${l.temuan_masalah ? `<p style="font-size:0.8rem; color:#ef4444;">⚠️ ${l.temuan_masalah?.substring(0, 80)}</p>` : ''}
    </div>
  `).join('') || '<p style="text-align:center; padding:2rem;">Belum ada laporan</p>'
}

// =============================================
// EVENTS
// =============================================
export function initAdminEvents() {
  const supabase = initSupabase()
  
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
      
      if (tab.dataset.tab === 'divisions') loadDivisions()
      if (tab.dataset.tab === 'monitoring') loadMonitoring()
      if (tab.dataset.tab === 'laporan') loadLaporan()
    })
  })
  
  // Modal
  const modal = document.getElementById('userModal')
  document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal())
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => modal.style.display = 'none')
  })
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none' })
  
  // Form
  document.getElementById('userForm')?.addEventListener('submit', handleUserSubmit)
  
  // Edit/Delete
  document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editUser(btn.dataset.id)))
  document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.id)))
  
  // Search
  document.getElementById('searchUser')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    document.querySelectorAll('#usersTableBody tr').forEach(row => {
      row.style.display = row.textContent?.toLowerCase().includes(q) ? '' : 'none'
    })
  })
  
  // Ibadah periode
  document.querySelectorAll('.ibadah-periode').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ibadah-periode').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      loadIbadahRekap(parseInt(btn.dataset.hari))
    })
  })
}

// =============================================
// CRUD FUNCTIONS
// =============================================
async function openUserModal(userId = null) {
  const modal = document.getElementById('userModal')
  const title = document.getElementById('modalTitle')
  const form = document.getElementById('userForm')
  
  await loadDivisionsCheckboxes()
  loadFeatureCheckboxes()
  
  if (userId) {
    title.textContent = 'Edit User'
    document.getElementById('userId').value = userId
    const supabase = initSupabase()
    const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).single()
    
    if (user) {
      document.getElementById('userName').value = user.name || ''
      document.getElementById('userEmail').value = user.email || ''
      document.getElementById('userPassword').value = ''
      document.getElementById('userRole').value = user.role || 'anggota_divisi'
      
      const { data: userDivs } = await supabase.from('user_divisions').select('division_id').eq('user_id', userId)
      const divIds = userDivs?.map(d => d.division_id) || []
      document.querySelectorAll('#userDivisions input').forEach(cb => { cb.checked = divIds.includes(cb.value) })
      
      const customFeatures = user.custom_features || []
      document.querySelectorAll('#customFeatures input').forEach(cb => { cb.checked = customFeatures.includes(cb.value) })
    }
  } else {
    title.textContent = 'Tambah User'
    document.getElementById('userId').value = ''
    form.reset()
    document.querySelectorAll('#userDivisions input').forEach(cb => cb.checked = false)
    document.querySelectorAll('#customFeatures input').forEach(cb => cb.checked = false)
  }
  
  modal.style.display = 'flex'
}

async function handleUserSubmit(e) {
  e.preventDefault()
  const supabase = initSupabase()
  const id = document.getElementById('userId').value
  const name = document.getElementById('userName').value
  const email = document.getElementById('userEmail').value
  const password = document.getElementById('userPassword').value
  const role = document.getElementById('userRole').value
  
  const divisionIds = []
  document.querySelectorAll('#userDivisions input:checked').forEach(cb => divisionIds.push(cb.value))
  
  const customFeatures = []
  document.querySelectorAll('#customFeatures input:checked').forEach(cb => customFeatures.push(cb.value))
  
  try {
    if (id) {
      await supabase.from('profiles').update({ name, role, custom_features: customFeatures }).eq('id', id)
      await supabase.from('user_divisions').delete().eq('user_id', id)
      if (divisionIds.length > 0) {
        await supabase.from('user_divisions').insert(divisionIds.map(did => ({ user_id: id, division_id: did })))
      }
      alert('✅ User diupdate!')
    } else {
      if (!password || password.length < 8) { alert('❌ Password minimal 8 karakter!'); return }
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (authError) throw authError
      if (authData.user) {
        await supabase.from('profiles').update({ name, role, custom_features: customFeatures }).eq('id', authData.user.id)
        if (divisionIds.length > 0) {
          await supabase.from('user_divisions').insert(divisionIds.map(did => ({ user_id: authData.user.id, division_id: did })))
        }
        alert('✅ User baru dibuat!')
      }
    }
    document.getElementById('userModal').style.display = 'none'
    location.reload()
  } catch (error) {
    alert('❌ Gagal: ' + error.message)
  }
}

async function editUser(id) { openUserModal(id) }

async function deleteUser(id) {
  if (!confirm('Yakin nonaktifkan user ini?')) return
  const supabase = initSupabase()
  await supabase.from('profiles').update({ is_active: false }).eq('id', id)
  alert('✅ User dinonaktifkan')
  location.reload()
}

async function loadDivisionsCheckboxes() {
  const supabase = initSupabase()
  const { data } = await supabase.from('divisions').select('*').eq('is_active', true)
  const container = document.getElementById('userDivisions')
  if (container) {
    container.innerHTML = data?.map(d => `
      <label class="feature-checkbox">
        <input type="checkbox" value="${d.id}">
        <span>🏢 ${d.name}</span>
      </label>
    `).join('') || '<p>Tidak ada divisi</p>'
  }
}

function loadFeatureCheckboxes() {
  const container = document.getElementById('customFeatures')
  if (container) {
    container.innerHTML = AVAILABLE_FEATURES.map(f => `
      <label class="feature-checkbox">
        <input type="checkbox" value="${f.id}">
        <span>${f.icon} ${f.label}</span>
      </label>
    `).join('')
  }
}