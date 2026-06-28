
// src/features/shared/profile.js
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'
import appState from '../../core/store/appState.js'
import userStore from '../../core/store/userStore.js'
import permissionManager from '../../core/auth/permissionManager.js'
import { initSupabase } from '../../supabase/client.js'

export async function renderProfile() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  // Ambil data terbaru dari Supabase
  const profile = await fetchProfile(user.id)
  const avatarUrl = profile?.avatar_url || null
  
  return `
    <div class="profile-page">
      <!-- Header -->
      <div class="profile-header">
        <button id="backBtn" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        
        <div class="profile-avatar-wrapper" id="avatarWrapper">
          ${avatarUrl 
            ? `<img src="${avatarUrl}" alt="Foto" class="profile-avatar-img" id="avatarImg">`
            : `<div class="profile-avatar-placeholder" id="avatarPlaceholder">
                <i class="bi bi-person-fill"></i>
               </div>`
          }
          <button id="editAvatarBtn" class="avatar-edit-btn">
            <i class="bi bi-camera-fill"></i>
          </button>
        </div>
        
        <div class="profile-name">${profile?.name || user.name || 'User'}</div>
        <div class="profile-role">${permissionManager.getRoleLabel()} • ${user.divisions?.name || 'Pesantren'}</div>
        
        <!-- Hidden file input -->
        <input type="file" id="avatarInput" accept="image/*" style="display:none;">
      </div>
      
      <!-- Info Card -->
      <div class="profile-card">
        <div class="profile-info-row">
          <span class="profile-label">Status</span>
          <span class="profile-value">
            <span class="status-dot ${profile?.is_active ? 'active' : 'inactive'}"></span>
            ${profile?.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        
        <div class="profile-info-row">
          <span class="profile-label">Email</span>
          <span class="profile-value">${profile?.email || user.email || '-'}</span>
        </div>
        
        <div class="profile-info-row">
          <span class="profile-label">No HP</span>
          <span class="profile-value">${profile?.phone || 'Belum diisi'}</span>
        </div>
        
        <div class="profile-info-row">
          <span class="profile-label">Divisi</span>
          <span class="profile-value">${user.divisions?.name || 'Belum ditentukan'}</span>
        </div>
        
        <div class="profile-info-row">
          <span class="profile-label">Bergabung</span>
          <span class="profile-value">${formatDate(profile?.created_at)}</span>
        </div>
      </div>
      
      <!-- Menu -->
      <div class="profile-menu">
        <div class="profile-menu-item" id="editProfileBtn">
          <div class="menu-icon" style="background:#E8F5E9;">
            <i class="bi bi-person" style="color:#2E7D32;"></i>
          </div>
          <span class="menu-title">Edit Profil</span>
          <i class="bi bi-chevron-right menu-arrow"></i>
        </div>
        
        <div class="profile-menu-item" id="myActivityBtn">
          <div class="menu-icon" style="background:#E3F2FD;">
            <i class="bi bi-bar-chart" style="color:#1565C0;"></i>
          </div>
          <span class="menu-title">Aktivitas Saya</span>
          <i class="bi bi-chevron-right menu-arrow"></i>
        </div>
        
        <div class="profile-menu-item" id="notificationBtn">
          <div class="menu-icon" style="background:#FFF3E0;">
            <i class="bi bi-bell" style="color:#E65100;"></i>
          </div>
          <span class="menu-title">Notifikasi</span>
          <i class="bi bi-chevron-right menu-arrow"></i>
        </div>
        
        <div class="profile-menu-item" id="securityBtn">
          <div class="menu-icon" style="background:#F3E5F5;">
            <i class="bi bi-shield-lock" style="color:#6A1B9A;"></i>
          </div>
          <span class="menu-title">Keamanan Akun</span>
          <i class="bi bi-chevron-right menu-arrow"></i>
        </div>
        
        <div class="profile-menu-item" id="aboutBtn">
          <div class="menu-icon" style="background:#E0F7FA;">
            <i class="bi bi-info-circle" style="color:#00695C;"></i>
          </div>
          <span class="menu-title">Tentang Aplikasi</span>
          <i class="bi bi-chevron-right menu-arrow"></i>
        </div>
        
        <div class="profile-menu-item" id="logoutBtn">
          <div class="menu-icon" style="background:#FFEBEE;">
            <i class="bi bi-box-arrow-right" style="color:#D32F2F;"></i>
          </div>
          <span class="menu-title" style="color:#D32F2F;">Logout</span>
          <i class="bi bi-chevron-right menu-arrow" style="color:#D32F2F;"></i>
        </div>
      </div>
      
      <!-- Modal Edit Profil -->
      <div id="editProfileModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit Profil</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="editProfileForm">
            <div class="form-group">
              <label>Nama</label>
              <input type="text" id="editName" value="${profile?.name || ''}" required>
            </div>
            <div class="form-group">
              <label>No HP</label>
              <input type="tel" id="editPhone" value="${profile?.phone || ''}" placeholder="08xxxxxxxxxx">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
            </div>
      
      <!-- Bottom Navigation -->
      ${renderBottomNav()}
    </div>
    </div>
  `
}

async function fetchProfile(userId) {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ===== EVENTS =====
export function initProfileEvents() {
  const supabase = initSupabase()
  const state = appState.getState()
  const user = state.currentUser
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.location.hash = '#/dashboard'
  })
  
  // Avatar upload
  const avatarInput = document.getElementById('avatarInput')
  const editAvatarBtn = document.getElementById('editAvatarBtn')
  const avatarWrapper = document.getElementById('avatarWrapper')
  
  editAvatarBtn?.addEventListener('click', () => {
    avatarInput?.click()
  })
  
  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validasi
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ Ukuran foto maksimal 2MB')
      return
    }
    
    // Upload ke Supabase Storage
    const fileName = `avatars/${user.id}/${Date.now()}-${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) {
      console.error('Upload gagal:', uploadError)
      alert('❌ Gagal upload foto')
      return
    }
    
    // Dapatkan URL publik
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName)
    
    if (urlData?.publicUrl) {
      // Update avatar_url di profiles
      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)
      
      // Update tampilan
      const avatarImg = document.getElementById('avatarImg')
      const avatarPlaceholder = document.getElementById('avatarPlaceholder')
      
      if (avatarImg) {
        avatarImg.src = urlData.publicUrl
      } else if (avatarPlaceholder) {
        avatarPlaceholder.outerHTML = `<img src="${urlData.publicUrl}" alt="Foto" class="profile-avatar-img" id="avatarImg">`
      }
      
      alert('✅ Foto berhasil diupdate!')
    }
  })
  
  // Edit profile modal
  const editModal = document.getElementById('editProfileModal')
  const editBtn = document.getElementById('editProfileBtn')
  const closeBtns = document.querySelectorAll('.modal-close')
  
  editBtn?.addEventListener('click', () => {
    editModal.style.display = 'flex'
  })
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      editModal.style.display = 'none'
    })
  })
  
  // Form edit profile
  document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const name = document.getElementById('editName').value
    const phone = document.getElementById('editPhone').value
    
    const { error } = await supabase
      .from('profiles')
      .update({ name, phone })
      .eq('id', user.id)
    
    if (error) {
      alert('❌ Gagal update profil')
      return
    }
    
    alert('✅ Profil berhasil diupdate!')
    editModal.style.display = 'none'
    location.reload()
  })
  
  // Logout
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        if (confirm('Yakin ingin logout?')) {
          await userStore.logout()
          window.location.hash = '#/login'
        }
      })
  
  // Menu lainnya
  document.getElementById('myActivityBtn')?.addEventListener('click', () => {
    alert('📊 Fitur Aktivitas Saya akan datang!')
  })
  
  document.getElementById('notificationBtn')?.addEventListener('click', () => {
    alert('🔔 Fitur Notifikasi akan datang!')
  })
  
  document.getElementById('securityBtn')?.addEventListener('click', () => {
    alert('🔐 Fitur Keamanan Akun akan datang!')
  })
  
  document.getElementById('aboutBtn')?.addEventListener('click', () => {
    alert('📱 Pesantren Lansia Bahagia v1.0.0\n\nAplikasi manajemen pesantren lansia.')
  })
}