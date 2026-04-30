<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-950 text-white">
    <header
      class="flex items-center gap-3 bg-gray-900 border-b border-gray-800 px-4 py-3 flex-shrink-0"
    >
      <RouterLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img
          src="@/assets/smtv-logo.svg"
          alt="Simple Telly"
          width="28"
          height="28"
          class="rounded"
        />
        <span class="text-white font-semibold text-lg tracking-tight">Simple Telly</span>
      </RouterLink>
    </header>

    <main class="flex-1 flex flex-col overflow-hidden">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['HomeView']">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <footer
      class="flex-shrink-0 bg-gray-900 border-t border-gray-800 text-gray-500 text-xs text-center py-3 px-4"
    >
      &copy; {{ new Date().getFullYear() }} Simple Telly &mdash; Show data provided by
      <a
        href="https://www.tvmaze.com"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-gray-300 transition-colors"
        >TVMaze</a
      >
    </footer>
  </div>
</template>
