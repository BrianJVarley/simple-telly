import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '../ui'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useUiStore()
    expect(store.theme).toBe('dark')
    expect(store.isSidebarOpen).toBe(false)
    expect(store.isSearchOpen).toBe(false)
    expect(store.activeGenre).toBeNull()
    expect(store.isDark).toBe(true)
  })

  describe('toggleTheme', () => {
    it('switches from dark to light', () => {
      const store = useUiStore()
      store.toggleTheme()
      expect(store.theme).toBe('light')
      expect(store.isDark).toBe(false)
    })

    it('switches back to dark', () => {
      const store = useUiStore()
      store.toggleTheme()
      store.toggleTheme()
      expect(store.theme).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('sets theme directly', () => {
      const store = useUiStore()
      store.setTheme('light')
      expect(store.theme).toBe('light')
    })
  })

  describe('toggleSidebar', () => {
    it('opens and closes sidebar', () => {
      const store = useUiStore()
      store.toggleSidebar()
      expect(store.isSidebarOpen).toBe(true)
      store.toggleSidebar()
      expect(store.isSidebarOpen).toBe(false)
    })
  })

  describe('search', () => {
    it('openSearch sets isSearchOpen to true', () => {
      const store = useUiStore()
      store.openSearch()
      expect(store.isSearchOpen).toBe(true)
    })

    it('closeSearch sets isSearchOpen to false', () => {
      const store = useUiStore()
      store.openSearch()
      store.closeSearch()
      expect(store.isSearchOpen).toBe(false)
    })

    it('toggleSearch flips isSearchOpen', () => {
      const store = useUiStore()
      store.toggleSearch()
      expect(store.isSearchOpen).toBe(true)
      store.toggleSearch()
      expect(store.isSearchOpen).toBe(false)
    })
  })

  describe('setActiveGenre', () => {
    it('sets the active genre', () => {
      const store = useUiStore()
      store.setActiveGenre('Drama')
      expect(store.activeGenre).toBe('Drama')
    })

    it('clears the active genre', () => {
      const store = useUiStore()
      store.setActiveGenre('Drama')
      store.setActiveGenre(null)
      expect(store.activeGenre).toBeNull()
    })
  })
})
