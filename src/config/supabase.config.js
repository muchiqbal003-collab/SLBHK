// src/config/supabase.config.js
// ANON_KEY dibaca dari .env (TIDAK di-hardcode)

const supabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
  
  // Validasi
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.error('❌ Supabase config tidak lengkap! Cek file .env')
  }
  
  export default supabaseConfig