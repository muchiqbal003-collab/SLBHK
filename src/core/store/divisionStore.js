// src/core/store/divisionStore.js
// Division State Management
import { initSupabase } from '../../supabase/client.js'

class DivisionStore {
  async getAllDivisions() {
    const supabase = initSupabase()
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('Gagal ambil divisi:', error.message)
      return []
    }
    
    return data
  }
  
  async getDivisionById(id) {
    const supabase = initSupabase()
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }
  
  async getDivisionStats(divisionId) {
    const supabase = initSupabase()
    if (!supabase) return null
    
    // Ambil statistik divisi
    const { data, error } = await supabase
      .from('division_stats')
      .select('*')
      .eq('division_id', divisionId)
      .single()
    
    if (error) return null
    return data
  }
}

export const divisionStore = new DivisionStore()
export default divisionStore