// src/features/divisions/event.js
// Divisi Event & Program Management - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER EVENT
// =============================================
export async function renderEvent() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const events = await fetchEvents()
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #D84315, #FF5722);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>🎉 Event & Program</h2>
        <p>Manajemen Acara & Kegiatan</p>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="event">📅 Event</button>
        <button class="divisi-tab" data-tab="checklist">✅ Checklist</button>
        <button class="divisi-tab" data-tab="evaluasi">⭐ Evaluasi</button>
      </div>
      
      <!-- TAB: EVENT -->
      <div class="divisi-tab-content active" id="tab-event">
        <div style="padding:1rem;">
          <button id="addEventBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Buat Event</button>
          <div id="eventList">
            ${renderEventList(events)}
          </div>
        </div>
      </div>
      
      <!-- TAB: CHECKLIST -->
      <div class="divisi-tab-content" id="tab-checklist">
        <div style="padding:1rem;">
          <label>Pilih Event:</label>
          <select id="selectEventChecklist" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih --</option>
            ${events.map(e => `<option value="${e.id}">${e.nama} - ${e.tanggal}</option>`).join('')}
          </select>
          <div id="checklistContainer">
            <p style="text-align:center; color:var(--text-muted);">Pilih event untuk lihat checklist</p>
          </div>
        </div>
      </div>
      
      <!-- TAB: EVALUASI -->
      <div class="divisi-tab-content" id="tab-evaluasi">
        <div style="padding:1rem;">
          <label>Pilih Event:</label>
          <select id="selectEventEval" class="form-group" style="margin-bottom:1rem;">
            <option value="">-- Pilih --</option>
            ${events.map(e => `<option value="${e.id}">${e.nama} - ${e.tanggal}</option>`).join('')}
          </select>
          <div id="evaluasiContainer">
            <p style="text-align:center; color:var(--text-muted);">Pilih event untuk lihat evaluasi</p>
          </div>
        </div>
      </div>
      
      <!-- MODAL EVENT -->
      <div id="eventModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Buat Event</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="eventForm">
            <div class="form-group">
              <label>Nama Event</label>
              <input type="text" id="eventNama" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="eventTanggal" required>
              </div>
              <div class="form-group">
                <label>Mulai</label>
                <input type="time" id="eventMulai">
              </div>
              <div class="form-group">
                <label>Selesai</label>
                <input type="time" id="eventSelesai">
              </div>
            </div>
            <div class="form-group">
              <label>Tempat</label>
              <input type="text" id="eventTempat" placeholder="Aula, Masjid...">
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <textarea id="eventDeskripsi" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Rundown (1 baris per kegiatan)</label>
              <textarea id="eventRundown" rows="5" placeholder="08:00 | Pembukaan | PIC: Ahmad&#10;09:00 | Kajian | PIC: Ustadz Ali&#10;12:00 | Ishoma | PIC: F&B"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL CHECKLIST -->
      <div id="checklistModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Checklist</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="checklistForm">
            <input type="hidden" id="checklistEventId">
            <div class="form-group">
              <label>Item</label>
              <input type="text" id="checklistItem" required placeholder="Siapkan sound system...">
            </div>
            <div class="form-group">
              <label>PIC</label>
              <input type="text" id="checklistPic" placeholder="Nama penanggung jawab">
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
function renderEventList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada event</div>'
  }
  
  return data.map(e => `
    <div class="card" style="margin-bottom:0.75rem;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${e.nama}</strong>
        <span class="badge" style="font-size:0.65rem; background:${
          e.status === 'completed' ? '#E8F5E9' : e.status === 'ongoing' ? '#FFF3E0' : e.status === 'cancelled' ? '#FFEBEE' : '#E3F2FD'
        }; color:${
          e.status === 'completed' ? '#2E7D32' : e.status === 'ongoing' ? '#E65100' : e.status === 'cancelled' ? '#C62828' : '#1565C0'
        };">
          ${e.status}
        </span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted);">📅 ${e.tanggal} | ⏰ ${e.waktu_mulai || '-'} - ${e.waktu_selesai || '-'}</p>
      <p style="font-size:0.8rem;">📍 ${e.tempat || '-'}</p>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchEvents() {
  const supabase = initSupabase()
  const { data } = await supabase.from('event_program').select('*').order('tanggal', { ascending: false })
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initEventEvents() {
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
  
  // Modal Event
  const eventModal = document.getElementById('eventModal')
  document.getElementById('addEventBtn')?.addEventListener('click', () => eventModal.style.display = 'flex')
  
  document.getElementById('eventForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Insert event
    const { data: event, error } = await supabase.from('event_program').insert({
      nama: document.getElementById('eventNama').value,
      tanggal: document.getElementById('eventTanggal').value,
      waktu_mulai: document.getElementById('eventMulai').value || null,
      waktu_selesai: document.getElementById('eventSelesai').value || null,
      tempat: document.getElementById('eventTempat').value,
      deskripsi: document.getElementById('eventDeskripsi').value,
      created_by: state.currentUser.id
    }).select().single()
    
    if (error) {
      alert('❌ Gagal: ' + error.message)
      return
    }
    
    // Parse rundown
    const rundownText = document.getElementById('eventRundown').value
    if (rundownText.trim()) {
      const lines = rundownText.split('\n').filter(l => l.trim())
      const rundowns = lines.map((line, i) => {
        const parts = line.split('|').map(p => p.trim())
        return {
          event_id: event.id,
          urutan: i + 1,
          waktu: parts[0] || null,
          kegiatan: parts[1] || line,
          pic: parts[2]?.replace('PIC:', '').trim() || null
        }
      })
      await supabase.from('event_rundown').insert(rundowns)
    }
    
    alert('✅ Event dibuat!')
    location.reload()
  })
  
  // Checklist select
  document.getElementById('selectEventChecklist')?.addEventListener('change', async (e) => {
    const eventId = e.target.value
    if (!eventId) return
    
    const { data: checklists } = await supabase
      .from('event_checklist')
      .select('*')
      .eq('event_id', eventId)
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
        <small>${checked}/${total} selesai</small>
      </div>
      <button class="btn btn-outline" style="margin-bottom:0.5rem; width:100%;" 
              onclick="document.getElementById('checklistEventId').value='${eventId}'; document.getElementById('checklistModal').style.display='flex'">
        + Tambah Checklist
      </button>
      ${checklists?.map(c => `
        <div class="card" style="margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
          <input type="checkbox" ${c.is_checked ? 'checked' : ''} 
                 onchange="updateEventChecklist('${c.id}', this.checked)" 
                 style="accent-color:var(--primary); width:18px; height:18px;">
          <span style="flex:1; ${c.is_checked ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${c.item}</span>
          <small style="color:var(--text-muted);">${c.pic || ''}</small>
        </div>
      `).join('') || '<p>Tidak ada checklist</p>'}
    `
  })
  
  // Evaluasi select
  document.getElementById('selectEventEval')?.addEventListener('change', async (e) => {
    const eventId = e.target.value
    if (!eventId) return
    
    const { data: evals } = await supabase
      .from('event_evaluasi')
      .select('*, profiles(name)')
      .eq('event_id', eventId)
    
    const container = document.getElementById('evaluasiContainer')
    container.innerHTML = evals?.map(ev => `
      <div class="card" style="margin-bottom:0.5rem;">
        <strong>${ev.profiles?.name || '-'}</strong>
        <span>${'⭐'.repeat(ev.rating || 0)}</span>
        <p style="font-size:0.85rem;">${ev.komentar || '-'}</p>
      </div>
    `).join('') || '<p>Tidak ada evaluasi</p>'
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      eventModal.style.display = 'none'
      document.getElementById('checklistModal').style.display = 'none'
    })
  })
  
  // Checklist Form
  document.getElementById('checklistForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const eventId = document.getElementById('checklistEventId').value
    const { error } = await supabase.from('event_checklist').insert({
      event_id: eventId,
      item: document.getElementById('checklistItem').value,
      pic: document.getElementById('checklistPic').value
    })
    alert(error ? '❌ Gagal' : '✅ Checklist ditambah!')
    if (!error) {
      document.getElementById('checklistModal').style.display = 'none'
      document.getElementById('selectEventChecklist').dispatchEvent(new Event('change'))
    }
  })
}

// Global function
window.updateEventChecklist = async function(id, checked) {
  const supabase = initSupabase()
  const state = appState.getState()
  await supabase.from('event_checklist').update({ 
    is_checked: checked,
    checked_by: checked ? state.currentUser.id : null
  }).eq('id', id)
  
  // Refresh tampilan
  const eventId = document.getElementById('selectEventChecklist').value
  if (eventId) {
    document.getElementById('selectEventChecklist').dispatchEvent(new Event('change'))
  }
}