// src/features/divisions/finance.js
// Divisi Finance - PLBMS
import { initSupabase } from '../../supabase/client.js'
import appState from '../../core/store/appState.js'
import { renderBottomNav, initBottomNavEvents } from '../../components/layout/bottomNav.js'

// =============================================
// RENDER FINANCE
// =============================================
export async function renderFinance() {
  const state = appState.getState()
  const user = state.currentUser
  
  if (!user) {
    window.location.hash = '#/login'
    return ''
  }
  
  const kas = await fetchKas()
  const transaksi = await fetchTransaksi()
  const totalMasuk = transaksi.filter(t => t.tipe === 'masuk' && t.status === 'approved').reduce((s, t) => s + t.jumlah, 0)
  const totalKeluar = transaksi.filter(t => t.tipe === 'keluar' && t.status === 'approved').reduce((s, t) => s + t.jumlah, 0)
  
  return `
    <div class="divisi-page">
      <div class="divisi-header" style="background: linear-gradient(135deg, #E65100, #F57C00);">
        <button onclick="window.location.hash='#/dashboard'" class="profile-back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h2>💰 Finance</h2>
        <p>Manajemen Keuangan</p>
      </div>
      
      <!-- Summary Cards -->
      <div class="finance-summary">
        <div class="finance-card" style="background:#E8F5E9;">
          <small>Pemasukan</small>
          <strong style="color:#2E7D32;">Rp ${totalMasuk.toLocaleString('id-ID')}</strong>
        </div>
        <div class="finance-card" style="background:#FFEBEE;">
          <small>Pengeluaran</small>
          <strong style="color:#C62828;">Rp ${totalKeluar.toLocaleString('id-ID')}</strong>
        </div>
        <div class="finance-card" style="background:#E3F2FD;">
          <small>Saldo</small>
          <strong style="color:#1565C0;">Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}</strong>
        </div>
      </div>
      
      <!-- Tab -->
      <div class="divisi-tabs">
        <button class="divisi-tab active" data-tab="transaksi">💳 Transaksi</button>
        <button class="divisi-tab" data-tab="kas">🏦 Kas</button>
        <button class="divisi-tab" data-tab="laporan">📊 Laporan</button>
      </div>
      
      <!-- TAB: TRANSAKSI -->
      <div class="divisi-tab-content active" id="tab-transaksi">
        <div style="padding:1rem;">
          <button id="addTransaksiBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Transaksi</button>
          <div id="transaksiList">
            ${renderTransaksiList(transaksi)}
          </div>
        </div>
      </div>
      
      <!-- TAB: KAS -->
      <div class="divisi-tab-content" id="tab-kas">
        <div style="padding:1rem;">
          <button id="addKasBtn" class="btn btn-primary" style="margin-bottom:1rem;">+ Tambah Kas</button>
          <div id="kasList">
            ${renderKasList(kas)}
          </div>
        </div>
      </div>
      
      <!-- TAB: LAPORAN -->
      <div class="divisi-tab-content" id="tab-laporan">
        <div style="padding:1rem;">
          <div class="card">
            <h3>Ringkasan</h3>
            <p>Total Transaksi: <strong>${transaksi.length}</strong></p>
            <p>Pending: <strong>${transaksi.filter(t => t.status === 'pending').length}</strong></p>
            <p>Approved: <strong>${transaksi.filter(t => t.status === 'approved').length}</strong></p>
          </div>
        </div>
      </div>
      
      <!-- MODAL TRANSAKSI -->
      <div id="transaksiModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Transaksi</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="transaksiForm">
            <div class="form-group">
              <label>Tipe</label>
              <select id="transaksiTipe" required>
                <option value="masuk">💰 Masuk</option>
                <option value="keluar">💸 Keluar</option>
              </select>
            </div>
            <div class="form-group">
              <label>Kas</label>
              <select id="transaksiKas">
                ${kas.map(k => `<option value="${k.id}">${k.nama} (Rp ${k.saldo?.toLocaleString('id-ID')})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Jumlah (Rp)</label>
              <input type="number" id="transaksiJumlah" required min="1" placeholder="50000">
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <input type="text" id="transaksiKet" placeholder="Untuk apa...">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-close">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- MODAL KAS -->
      <div id="kasModal" class="modal" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Kas</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="kasForm">
            <div class="form-group">
              <label>Nama Kas</label>
              <input type="text" id="kasNama" required placeholder="Kas Utama, Kas Operasional...">
            </div>
            <div class="form-group">
              <label>Saldo Awal (Rp)</label>
              <input type="number" id="kasSaldo" value="0">
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
function renderTransaksiList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada transaksi</div>'
  }
  
  return data.slice(0, 20).map(t => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${t.tipe === 'masuk' ? '💰' : '💸'} ${t.keterangan || '-'}</strong>
        <p style="font-size:0.8rem; color:var(--text-muted);">${new Date(t.created_at).toLocaleDateString('id-ID')}</p>
      </div>
      <div style="text-align:right;">
        <strong style="color:${t.tipe === 'masuk' ? '#2E7D32' : '#C62828'}">
          ${t.tipe === 'masuk' ? '+' : '-'}Rp ${t.jumlah?.toLocaleString('id-ID')}
        </strong>
        <br>
        <span class="badge" style="font-size:0.65rem; background:${t.status === 'approved' ? '#E8F5E9' : t.status === 'rejected' ? '#FFEBEE' : '#FFF3E0'}; color:${t.status === 'approved' ? '#2E7D32' : t.status === 'rejected' ? '#C62828' : '#E65100'};">
          ${t.status}
        </span>
      </div>
    </div>
  `).join('')
}

function renderKasList(data) {
  if (!data || data.length === 0) {
    return '<div class="card" style="text-align:center; padding:2rem;">Belum ada kas</div>'
  }
  
  return data.map(k => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <strong>🏦 ${k.nama}</strong>
      <strong>Rp ${k.saldo?.toLocaleString('id-ID')}</strong>
    </div>
  `).join('')
}

// =============================================
// FETCH
// =============================================
async function fetchKas() {
  const supabase = initSupabase()
  const { data } = await supabase.from('finance_kas').select('*').order('nama')
  return data || []
}

async function fetchTransaksi() {
  const supabase = initSupabase()
  const { data } = await supabase.from('finance_transaksi').select('*').order('created_at', { ascending: false })
  return data || []
}

// =============================================
// EVENTS
// =============================================
export function initFinanceEvents() {
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
  
  // Modal Transaksi
  const transaksiModal = document.getElementById('transaksiModal')
  document.getElementById('addTransaksiBtn')?.addEventListener('click', () => transaksiModal.style.display = 'flex')
  
  document.getElementById('transaksiForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const state = appState.getState()
    const { error } = await supabase.from('finance_transaksi').insert({
      kas_id: document.getElementById('transaksiKas').value,
      user_id: state.currentUser.id,
      tipe: document.getElementById('transaksiTipe').value,
      jumlah: parseFloat(document.getElementById('transaksiJumlah').value),
      keterangan: document.getElementById('transaksiKet').value
    })
    alert(error ? '❌ Gagal: ' + error.message : '✅ Transaksi dicatat!')
    if (!error) location.reload()
  })
  
  // Modal Kas
  const kasModal = document.getElementById('kasModal')
  document.getElementById('addKasBtn')?.addEventListener('click', () => kasModal.style.display = 'flex')
  
  document.getElementById('kasForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('finance_kas').insert({
      nama: document.getElementById('kasNama').value,
      saldo: parseFloat(document.getElementById('kasSaldo').value) || 0
    })
    alert(error ? '❌ Gagal: ' + error.message : '✅ Kas ditambah!')
    if (!error) location.reload()
  })
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      transaksiModal.style.display = 'none'
      kasModal.style.display = 'none'
    })
  })
}