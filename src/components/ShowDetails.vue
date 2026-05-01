<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShowDetail } from '@/composables/useShowDetail'
import { useEscapeKey } from '@/composables/useKeyboardNavHelpers'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import ApiError from '@/components/ApiError.vue'

const router = useRouter()
const props = defineProps<{ id: number }>()

useEscapeKey(() => router.back())

const { show, seasonCount, isLoading, error, fetchShow } = useShowDetail(props.id)
</script>

<template>
  <div
    class="flex flex-col min-h-screen p-6"
    :style="{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }"
  >
    <button @click="router.back()" type="button" aria-label="Go back" class="w-6 h-6 mb-4">
      <ArrowLeftIcon
        class="detail-icon-muted mb-2 w-6 h-6 self-start mb-4 transition-colors"
        aria-label="Close"
        v-tooltip="{ text: 'Back to Shows', placement: 'right' }"
      />
    </button>

    <div v-if="isLoading" class="detail-text-muted text-sm" aria-busy="true" aria-live="polite">
      Loading...
    </div>
    <ApiError
      v-else-if="error"
      :message="error.message"
      :cause="error.cause"
      @retry="fetchShow(props.id)"
    />
    <div v-else-if="show" class="max-w-4xl mx-auto w-full" role="main">
      <div class="flex flex-col sm:flex-row gap-6">
        <img
          v-if="show.image"
          :src="show.image.medium"
          :alt="show.name"
          mode
          class="w-full sm:w-48 rounded-lg object-cover"
        />
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">{{ show.name }}</h1>
          <div class="flex gap-2 flex-wrap mb-3" role="list" aria-label="Genres">
            <span
              v-for="genre in show.genres"
              :key="genre"
              role="listitem"
              class="detail-genre-chip text-xs px-2 py-1 rounded"
              >{{ genre }}</span
            >
          </div>
          <p class="detail-text-soft text-sm mb-2">
            {{ show.status }} &bull; {{ show.language }}
            <span v-if="show.rating.average"> &bull; &#9733; {{ show.rating.average }}</span>
          </p>
          <p v-if="show.network" class="detail-text-muted text-sm mb-3">{{ show.network.name }}</p>
          <p v-if="seasonCount > 0" class="detail-text-muted text-sm mb-3">
            {{ seasonCount }} season{{ seasonCount > 1 ? 's' : '' }}
          </p>
          <div
            v-if="show.summary"
            class="detail-text-soft text-sm leading-relaxed"
            v-html="show.summary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-text-muted,
.detail-icon-muted {
  color: var(--color-text-muted);
}

.detail-icon-muted:hover {
  color: var(--color-text);
}

.detail-text-soft {
  color: var(--color-text);
}

.detail-genre-chip {
  background-color: var(--color-surface-strong);
  color: var(--color-text);
}
</style>
