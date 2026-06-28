// src/supabase/client.js
import { createClient } from '@supabase/supabase-js'
import supabaseConfig from '../config/supabase.config.js'

let supabase = null

function initSupabase() {
  if (supabase) return supabase
  
  try {
    supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'plb-auth'
        }
      }
    )
    console.log('✅ Supabase connected!')
    return supabase
  } catch (error) {
    console.error('❌ Supabase gagal:', error.message)
    return null
  }
}

export { initSupabase }
export default initSupabase