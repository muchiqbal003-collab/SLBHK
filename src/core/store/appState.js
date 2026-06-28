// src/core/store/appState.js
class AppState {
  constructor() {
    this.state = {
      isLoading: true,
      currentRoute: null,
      currentUser: null,
      currentDivision: null,
      theme: localStorage.getItem('plb-theme') || 'light',
      language: localStorage.getItem('plb-lang') || 'id',
      isOnline: navigator.onLine,
      notification: null
    }
    
    this.listeners = []
    this.init()
  }
  
  init() {
    window.addEventListener('online', () => this.setState({ isOnline: true }))
    window.addEventListener('offline', () => this.setState({ isOnline: false }))
    
    // Apply theme on init
    document.documentElement.setAttribute('data-theme', this.state.theme)
  }
  
  getState() { return this.state }
  
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }
  
  subscribe(listener) {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter(l => l !== listener) }
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }
  
  setUser(user) { this.setState({ currentUser: user }) }
  setDivision(division) { this.setState({ currentDivision: division }) }
  setLoading(isLoading) { this.setState({ isLoading }) }
  
  setTheme(theme) {
    this.setState({ theme })
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('plb-theme', theme)
  }
  
  setLanguage(lang) {
    this.setState({ language: lang })
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('plb-lang', lang)
  }
  
  showNotification(message, type = 'info') {
    this.setState({ notification: { message, type } })
    setTimeout(() => this.setState({ notification: null }), 3000)
  }
}

const appState = new AppState()
export default appState