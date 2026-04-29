<script setup lang="ts">
import { useShowList } from '@/composables/useShowList'
import { useShowSearch } from '@/composables/useShowSearch'
import { ref, watch } from 'vue'
import { useVirtualList } from '@vueuse/core'

const { results, isLoading, error, search, clear } = useShowSearch()
const {
  shows,
  isLoading: isLoadingShows,
  error: showsListError,
  refresh,
} = useShowList({ type: 'schedule' })
const { list, containerProps, wrapperProps } = useVirtualList(shows, {
  itemHeight: 120,
})

const query = ref('')

function onClear() {
  query.value = ''
  clear()
}

watch(query, (q) => search(q))
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-950 text-white">
    <div v-if="query" class="flex-1 overflow-y-auto p-4">
      <div v-if="isLoading" class="text-gray-400 text-sm p-4">Searching...</div>
      <div v-else-if="error" class="text-red-400 text-sm p-4">{{ error }}</div>
      <div v-else-if="!results.length" class="text-gray-500 text-sm p-4">
        No results for "{{ query }}"
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="{ show } in results"
          :key="show.id"
          class="rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform cursor-pointer"
        >
          <img
            :src="show.image?.medium"
            :alt="show.name"
            class="w-full object-cover aspect-[2/3]"
          />
          <p class="p-2 text-sm font-medium truncate">{{ show.name }}</p>
        </div>
      </div>
    </div>

    <div v-else v-bind="containerProps" class="flex-1 overflow-y-auto p-4">
      <div v-if="isLoadingShows" class="text-gray-400 text-sm p-4">Loading schedule...</div>
      <div v-else-if="showsListError" class="text-red-400 text-sm p-4">{{ showsListError }}</div>
      <div v-else v-bind="wrapperProps">
        <div
          v-for="{ data: show } in list"
          :key="show.id"
          class="flex items-center gap-4 py-2 border-b border-gray-800 hover:bg-gray-800 rounded px-2 cursor-pointer"
        >
          <img
            :src="show.image?.medium"
            :alt="show.name"
            class="show-image w-12 h-16 object-cover rounded flex-shrink-0"
          />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ show.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ show.genres?.join(', ') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-800 bg-gray-900 p-3 flex items-center gap-3">
      <input
        v-model="query"
        type="text"
        placeholder="Search shows..."
        class="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        v-if="query"
        @click="onClear"
        class="text-gray-400 hover:text-white transition-colors text-sm px-3"
      >
        Clear
      </button>
    </div>
  </div>
</template>
