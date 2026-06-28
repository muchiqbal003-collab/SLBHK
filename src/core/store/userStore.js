// src/core/store/userStore.js
// User State Management
import appState from './appState.js'
import { initSupabase } from '../../supabase/client.js'

class UserStore {
  async login(email, password) {
    try {
      const supabase = initSupabase()
      if (!supabase) throw new Error('Database tidak tersedia')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Ambil profile user (tanpa join divisions dulu)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('Gagal ambil profile:', profileError.message)
        throw profileError
      }
      
      // Ambil data divisi terpisah
      let division = null
      if (profile?.division_id) {
        const { data: divData } = await supabase
          .from('divisions')
          .select('*')
          .eq('id', profile.division_id)
          .single()
        
        division = divData
      }
      
      // Gabungkan
      const userData = {
        ...profile,
        divisions: division
      }
      
      appState.setUser(userData)
      appState.setDivision(division)
      appState.showNotification(`Selamat datang, ${profile.name}!`, 'success')
      
      return userData
      
    } catch (error) {
      console.error('Login gagal:', error.message)
      throw error
    }
  }
  
  async logout() {
    const supabase = initSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    
    appState.setUser(null)
    appState.setDivision(null)
    appState.showNotification('Berhasil logout', 'info')
  }
  
  async getCurrentUser() {
    const supabase = initSupabase()
    if (!supabase) return null
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Ambil profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!profile) return null
    
    // Ambil divisi terpisah
    let division = null
    if (profile.division_id) {
      const { data: divData } = await supabase
        .from('divisions')
        .select('*')
        .eq('id', profile.division_id)
        .single()
      
      division = divData
    }
    
    return {
      ...profile,
      divisions: division
    }
  }
  
  async checkSession() {
    try {
      const user = await this.getCurrentUser()
      
      if (user) {
        appState.setUser(user)
        appState.setDivision(user.divisions)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Session check gagal:', error)
      return false
    }
  }
}

export const userStore = new UserStore()
export default userStore