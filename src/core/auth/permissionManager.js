// src/core/auth/permissionManager.js
// Cek permission user
import { ROLE_PERMISSIONS, ROLES } from '../../config/permissions.js'

class PermissionManager {
  constructor() {
    this.currentUser = null
  }
  
  setUser(user) {
    this.currentUser = user
  }
  
  getUser() {
    return this.currentUser
  }
  
  // Cek apakah user punya akses ke fitur tertentu
  canAccess(feature) {
    if (!this.currentUser) return false
    
    // Super admin bisa akses semua
    if (this.currentUser.role === ROLES.SUPER_ADMIN) return true
    
    // Cek permission dari role
    const rolePerms = ROLE_PERMISSIONS[this.currentUser.role]
    if (!rolePerms) return false
    
    // Cek apakah fitur ada di daftar
    if (rolePerms.features.includes('*')) return true
    if (rolePerms.features.includes(feature)) return true
    
    // Cek custom features user (kalau ada)
    const customFeatures = this.currentUser.custom_features || []
    if (customFeatures.includes(feature)) return true
    
    return false
  }
  
  // Cek apakah user bisa akses divisi tertentu
  canAccessDivision(divisionId) {
    if (!this.currentUser) return false
    
    // Super admin & admin bisa akses semua
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(this.currentUser.role)) {
      return true
    }
    
    // User hanya bisa akses divisinya sendiri
    return this.currentUser.division_id === divisionId
  }
  
  // Cek permission spesifik
  canManageUsers() {
    return this.currentUser && ROLE_PERMISSIONS[this.currentUser.role]?.canManageUsers
  }
  
  canManageRoles() {
    return this.currentUser && ROLE_PERMISSIONS[this.currentUser.role]?.canManageRoles
  }
  
  canManageDivisions() {
    return this.currentUser && ROLE_PERMISSIONS[this.currentUser.role]?.canManageDivisions
  }
  
  canViewAllReports() {
    return this.currentUser && ROLE_PERMISSIONS[this.currentUser.role]?.canViewAllReports
  }
  
  canDeleteData() {
    return this.currentUser && ROLE_PERMISSIONS[this.currentUser.role]?.canDeleteData
  }
  
  // Dapatkan role label
  getRoleLabel() {
    if (!this.currentUser) return ''
    return ROLE_PERMISSIONS[this.currentUser.role]?.label || this.currentUser.role
  }
  
  // Dapatkan semua fitur yang bisa diakses
  getAccessibleFeatures() {
    if (!this.currentUser) return []
    
    const rolePerms = ROLE_PERMISSIONS[this.currentUser.role]
    if (!rolePerms) return []
    
    if (rolePerms.features.includes('*')) {
      // Return semua fitur untuk super admin
      return ['*']
    }
    
    // Gabung fitur dari role + custom
    return [
      ...rolePerms.features,
      ...(this.currentUser.custom_features || [])
    ]
  }
}

export const permissionManager = new PermissionManager()
export default permissionManager