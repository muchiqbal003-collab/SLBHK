// src/features/divisions/media.js
// Divisi Media & Publication - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER MEDIA
// =============================================
export async function renderMedia() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const galeri = await fetchGaleri()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #AD1457, #E91E63);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>📷 Media & Publication</h2>
        <p>Dokumentasi & Publikasi</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="galeri">🖼️ Galeri</button>
        <button class="divisi-tab" data-tab="upload">⬆️ Upload</button>
      </div>
      
      <!-- TAB: GALERI -->
      <div class="divisi-tab-content active" id="tab-galeri">
        <div style="padding:1rem;">
          <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <button class="btn btn-outline filter-btn active" data-filter="semua">Semua</button>
            <button class="btn btn-outline filter-btn" data-filter="foto">🖼️ Foto</button>
            <button class="btn btn-outline filter-btn" data-filter="video">🎥 Video</button>
          </div>
          <div class="galeri-grid" id="galeriGrid">
            ${renderGaleri(galeri)}
          </div>
        </div>
      </div>
      
      <!-- TAB: UPLOAD -->
      <div class="divisi-tab-content" id="tab-upload">
        <div style="padding:1rem;">
          <div class="card">
            <h3>⬆️ Upload Media</h3>
            <form id="uploadForm">
              <div class="form-group">
                <label>Judul</label>
                <input type="text" id="mediaJudul" required placeholder="Nama file...">
              </div>
              <div class="form-group">
                <label>Tipe</label>
                <select id="mediaTipe">
                  <option value="foto">🖼️ Foto</option>
                  <option value="video">🎥 Video</option>
                </select>
              </div>
              <div class="form-group">
                <label>Deskripsi</label>
                <textarea id="mediaDeskripsi" rows="2" placeholder="Deskripsi singkat..."></textarea>
              </div>
              <div class="form-group">
                <label>Pilih File</label>
                <input type="file" id="mediaFile" accept="image/*,video/*" required>
                <small style="color:var(--text-muted);">Max 10MB</small>
              </div>
              <div id="uploadPreview" style="margin-bottom:1rem;"></div>
              <div id="uploadProgress" style="display:none; margin-bottom:1rem;">
                <div class="progress-bar-large">
                  <div class="progress-fill-large" id="progressFill" style="width:0%">0%</div>
                </div>
              </div>
              <button type="submit" class="btn btn-primary">📤 Upload</button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- MODAL PREVIEW -->
      <div id="previewModal" class="modal" style="display:none;" onclick="this.style.display='none'">
        <div class="modal-content" style="max-width:90vw; max-height:90vh; background:transparent; padding:0;" onclick="event.stopPropagation()">
          <span style="position:absolute; top:10px; right:15px; font-size:2rem; color:white; cursor:pointer;" 
                onclick="document.getElementById('previewModal').style.display='none'">&times;</span>
          <img id="previewImg" src="" style="width:100%; max-height:85vh; object-fit:contain; border-radius:12px;">
          <video id="previewVideo" controls style="width:100%; max-height:85vh; border-radius:12px; display:none;"></video>
        </div>
      </div>
      
      ${renderBottomNav()}
    </div>
  `
}

// =============================================
// RENDER GALERI
// =============================================
function renderGaleri(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:3rem; grid-column:1/-1;">📷 Belum ada media</div>'
  }
  
  return data.map(g => `
    <div class="galeri-card" data-tipe="${g.tipe}" onclick="previewMedia('${g.file_url}', '${g.tipe}')">
      ${g.tipe === 'foto' 
        ? `<img src="${g.file_url}" alt="${g.judul}" loading="lazy">`
        : `<div class="video-placeholder">🎥</div>`
      }
      <div class="galeri-info">
        <strong>${g.judul}</strong>
        <small>${g.deskripsi || ''}</small>
        <small style="color:var(--text-muted);">${timeAgo(g.created_at)}</small>
      </div>
    </div>
  `).join('')
}

// =============================================
// HELPERS
// =============================================
function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

// =============================================
// FETCH
// =============================================
async function fetchGaleri() {
  const supabase = initSupabase()
  const { data } = await supabase
    .from('media_galeri')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initMediaEvents() {
  initBottomNavEvents()
  const supabase = initSupabase()
  const state = appState.getState()
  
  // Tab switching
  document.querySelectorAll('.divisi-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.divisi-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.divisi-tab-content').forEach(c => c.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
    })
  })
  
  // Filter galeri
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      
      const filter = btn.dataset.filter
      document.querySelectorAll('.galeri-card').forEach(card => {
        if (filter === 'semua' || card.dataset.tipe === filter) {
          card.style.display = ''
        } else {
          card.style.display = 'none'
        }
      })
    })
  })
  
  // Preview file sebelum upload
  document.getElementById('mediaFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const preview = document.getElementById('uploadPreview')
    const url = URL.createObjectURL(file)
    
    if (file.type.startsWith('image/')) {
      preview.innerHTML = `<img src="${url}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">`
    } else if (file.type.startsWith('video/')) {
      preview.innerHTML = `<video src="${url}" controls style="width:100%; max-height:200px; border-radius:8px;"></video>`
    }
  })
  
  // Upload form
  document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const file = document.getElementById('mediaFile').files[0]
    if (!file) return
    
    // Validasi ukuran (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Ukuran file maksimal 10MB')
      return
    }
    
    const progressDiv = document.getElementById('uploadProgress')
    const progressFill = document.getElementById('progressFill')
    progressDiv.style.display = 'block'
    progressFill.style.width = '30%'
    progressFill.textContent = '30%'
    
    // Upload ke Supabase Storage
    const fileName = `media/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file)
    
    if (uploadError) {
      alert('❌ Upload gagal: ' + uploadError.message)
      progressDiv.style.display = 'none'
      return
    }
    
    progressFill.style.width = '70%'
    progressFill.textContent = '70%'
    
    // Dapatkan URL publik
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)
    
    if (urlData?.publicUrl) {
      // Simpan ke database
      const { error: dbError } = await supabase.from('media_galeri').insert({
        judul: document.getElementById('mediaJudul').value,
        deskripsi: document.getElementById('mediaDeskripsi').value,
        tipe: document.getElementById('mediaTipe').value,
        file_url: urlData.publicUrl,
        uploaded_by: state.currentUser.id
      })
      
      progressFill.style.width = '100%'
      progressFill.textContent = '100%'
      
      if (dbError) {
        alert('❌ Gagal simpan: ' + dbError.message)
      } else {
        alert('✅ Upload berhasil!')
        location.reload()
      }
    }
  })
}

// Global function untuk preview
window.previewMedia = function(url, tipe) {
  const modal = document.getElementById('previewModal')
  const img = document.getElementById('previewImg')
  const video = document.getElementById('previewVideo')
  
  if (tipe === 'foto') {
    img.src = url
    img.style.display = 'block'
    video.style.display = 'none'
  } else {
    video.src = url
    video.style.display = 'block'
    img.style.display = 'none'
  }
  
  modal.style.display = 'flex'
}