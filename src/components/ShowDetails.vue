<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShowDetail } from '@/composables/useShowDetail'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
const router = useRouter()
const props = defineProps<{ id: number }>()

const { show, seasonCount, isLoading, error } = useShowDetail(props.id)
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-950 text-white p-6">
    <ArrowLeftIcon
      @click="router.back()"
      class="w-6 h-6 self-start mb-4 text-gray-400 hover:text-white transition-colors"
      aria-label="Close"
    />
    <div v-if="isLoading" class="text-gray-400 text-sm" aria-busy="true" aria-live="polite">
      Loading...
    </div>
    <div v-else-if="error" class="text-red-400 text-sm" role="alert">{{ error }}</div>
    <div v-else-if="show" class="max-w-4xl mx-auto w-full" role="main">
      <div class="flex flex-col sm:flex-row gap-6">
        <img
          v-if="show.image"
          :src="show.image.medium"
          :alt="show.name"
          class="w-full sm:w-48 rounded-lg object-cover"
        />
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">{{ show.name }}</h1>
          <div class="flex gap-2 flex-wrap mb-3" role="list" aria-label="Genres">
            <span
              v-for="genre in show.genres"
              :key="genre"
              role="listitem"
              class="text-xs bg-gray-700 px-2 py-1 rounded"
              >{{ genre }}</span
            >
          </div>
          <p class="text-gray-300 text-sm mb-2">
            {{ show.status }} &bull; {{ show.language }}
            <span v-if="show.rating.average"> &bull; &#9733; {{ show.rating.average }}</span>
          </p>
          <p v-if="show.network" class="text-gray-400 text-sm mb-3">{{ show.network.name }}</p>
          <p v-if="seasonCount > 0" class="text-gray-400 text-sm mb-3">
            {{ seasonCount }} season{{ seasonCount > 1 ? 's' : '' }}
          </p>
          <div
            v-if="show.summary"
            class="text-gray-300 text-sm leading-relaxed"
            v-html="show.summary"
          />
        </div>
      </div>
    </div>
  </div>
</template>
