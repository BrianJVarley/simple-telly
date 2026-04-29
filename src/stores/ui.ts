import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark'

export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>('dark')
  const isSidebarOpen = ref(false)
  const isSearchOpen = ref(false)
  const activeGenre = ref<string | null>(null)

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function openSearch() {
    isSearchOpen.value = true
  }

  function closeSearch() {
    isSearchOpen.value = false
  }

  function toggleSearch() {
    isSearchOpen.value = !isSearchOpen.value
  }

  function setActiveGenre(genre: string | null) {
    activeGenre.value = genre
  }

  return {
    theme,
    isDark,
    isSidebarOpen,
    isSearchOpen,
    activeGenre,
    toggleTheme,
    setTheme,
    toggleSidebar,
    openSearch,
    closeSearch,
    toggleSearch,
    setActiveGenre,
  }
})
