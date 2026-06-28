// src/config/permissions.js
// Role & Permission - PLBMS

// =============================================
// ROLE DEFINITIONS
// =============================================
export const ROLES = {
  DIRECTOR: 'director',                   // Director / Quality Control
  VICE_DIRECTOR: 'vice_director',         // Vice Director
  KOORDINATOR: 'koordinator_divisi',      // Koordinator Divisi
  ANGGOTA: 'anggota_divisi',              // Anggota Divisi
  ADMIN: 'admin'                          // Admin Sistem
}

// =============================================
// PERMISSION PER ROLE
// =============================================
export const ROLE_PERMISSIONS = {
  director: {
    label: 'Director',
    level: 100,
    canAccessAllDivisions: true,
    canManageUsers: true,
    canManageRoles: true,
    canManageDivisions: true,
    canViewAllReports: true,
    canDeleteData: true,
    canApprove: true,
    canViewIbadahStats: true,
    features: ['*']
  },

  vice_director: {
    label: 'Vice Director',
    level: 80,
    canAccessAllDivisions: true,
    canManageUsers: false,
    canManageRoles: false,
    canManageDivisions: false,
    canViewAllReports: true,
    canDeleteData: false,
    canApprove: true,
    canViewIbadahStats: true,
    features: ['monitoring', 'laporan_divisi', 'approval_izin', 'lihat_absensi', 'rekap_ibadah']
  },

  admin: {
    label: 'Admin Sistem',
    level: 70,
    canAccessAllDivisions: true,
    canManageUsers: true,
    canManageRoles: true,
    canManageDivisions: true,
    canViewAllReports: true,
    canDeleteData: false,
    canApprove: false,
    canViewIbadahStats: false,
    features: ['user_management', 'role_management', 'division_setup', 'feature_config']
  },

  koordinator_divisi: {
    label: 'Koordinator Divisi',
    level: 50,
    canAccessAllDivisions: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageDivisions: false,
    canViewAllReports: false,
    canDeleteData: false,
    canApprove: true,
    canViewIbadahStats: true,
    features: ['monitoring', 'laporan_divisi', 'approval_izin', 'lihat_absensi', 'input_data']
  },

  anggota_divisi: {
    label: 'Anggota Divisi',
    level: 10,
    canAccessAllDivisions: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageDivisions: false,
    canViewAllReports: false,
    canDeleteData: false,
    canApprove: false,
    canViewIbadahStats: false,
    features: ['input_data', 'absensi', 'pencapaian', 'izin', 'lihat_jadwal']
  }
}

// =============================================
// AVAILABLE FEATURES
// =============================================
export const AVAILABLE_FEATURES = [
  // Umum
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'input_data', label: 'Input Data', icon: '✏️' },
  { id: 'lihat_jadwal', label: 'Lihat Jadwal', icon: '📅' },

  // Operasional
  { id: 'monitoring', label: 'Monitoring', icon: '📊' },
  { id: 'laporan_divisi', label: 'Laporan Divisi', icon: '📋' },
  { id: 'approval_izin', label: 'Approval Izin', icon: '✅' },
  { id: 'lihat_absensi', label: 'Lihat Absensi', icon: '📅' },

  // Admin
  { id: 'user_management', label: 'Kelola User', icon: '👥' },
  { id: 'role_management', label: 'Kelola Role', icon: '🔑' },
  { id: 'division_setup', label: 'Pengaturan Divisi', icon: '⚙️' },
  { id: 'feature_config', label: 'Konfigurasi Fitur', icon: '🔧' },

  // Ibadah
  { id: 'absensi', label: 'Absensi', icon: '✔️' },
  { id: 'pencapaian', label: 'Pencapaian', icon: '🎯' },
  { id: 'izin', label: 'Pengajuan Izin', icon: '📝' },
  { id: 'rekap_ibadah', label: 'Rekap Ibadah', icon: '🕌' },

  // Fitur Divisi
  { id: 'pembagian_halaqoh', label: 'Pembagian Halaqoh', icon: '📖' },
  { id: 'setoran_hafalan', label: 'Setoran Hafalan', icon: '🧠' },
  { id: 'checkup', label: 'Checkup Kesehatan', icon: '🏥' },
  { id: 'tugas_khidmat', label: 'Tugas Khidmat', icon: '🕌' }
]