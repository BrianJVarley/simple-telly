<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { LightBulbIcon } from '@heroicons/vue/24/outline'
import { MoonIcon } from '@heroicons/vue/16/solid'
type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'simple-telly-theme'
const theme = ref<ThemeMode>('light')

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    theme.value = storedTheme
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  applyTheme(theme.value)
})

watch(theme, (mode) => {
  applyTheme(mode)
  localStorage.setItem(THEME_STORAGE_KEY, mode)
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col"
    :style="{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }"
  >
    <header
      class="flex items-center gap-3 border-b px-4 py-3 flex-shrink-0"
      :style="{
        backgroundColor: 'var(--color-background-soft)',
        borderColor: 'var(--color-border)',
      }"
    >
      <RouterLink
        to="/shows?page=1&genre=All"
        class="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src="@/assets/smtv-logo.svg"
          alt="Simple Telly"
          aria-label="Simple Telly logo"
          width="28"
          height="28"
          class="rounded"
        />
        <span class="font-semibold text-lg tracking-tight">Simple Telly</span>
      </RouterLink>

      <!-- Theme toggle -->
      <button
        type="button"
        class="ml-auto rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
        :style="{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          backgroundColor: 'transparent',
        }"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :aria-pressed="theme === 'dark'"
        @click="toggleTheme"
      >
        <MoonIcon v-if="theme === 'light'" class="w-4 h-4 mr-1 inline-block" />
        <LightBulbIcon v-if="theme === 'dark'" class="w-4 h-4 mr-1 inline-block" />
      </button>
    </header>

    <main class="flex-1 flex flex-col overflow-hidden">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['HomeView']">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <footer
      class="flex-shrink-0 border-t text-xs text-center py-3 px-4"
      :style="{
        backgroundColor: 'var(--color-background-soft)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
      }"
    >
      &copy; {{ new Date().getFullYear() }} Simple Telly (developed by, Brian Varley) &mdash; Show data provided by
      <a
        href="https://www.tvmaze.com"
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition-colors"
        >TVMaze</a
      >
    </footer>
  </div>
</template>
