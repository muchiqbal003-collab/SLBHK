// src/config/constants.js
// Konstanta global aplikasi

export const APP_NAME = 'Pesantren Lansia Bahagia'
export const APP_VERSION = '1.0.0'

// Status absensi
export const ATTENDANCE_STATUS = {
  HADIR: 'hadir',
  IZIN: 'izin',
  SAKIT: 'sakit',
  ALPHA: 'alpha'
}

// Status izin
export const IZIN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Waktu cache (dalam detik)
export const CACHE_DURATION = {
  JADWAL_SHALAT: 86400,    // 1 hari
  ALQURAN: -1,             // Permanent
  DATA_LANSIA: 300,        // 5 menit
  ABSENSI: 60              // 1 menit
}

// Route names
export const ROUTES = {
  LOGIN: '#/login',
  DASHBOARD: '#/dashboard',
  ADMIN: '#/admin',
  SUPER_ADMIN: '#/super-admin',
  PROFILE: '#/profile',
  UNAUTHORIZED: '#/unauthorized'
}