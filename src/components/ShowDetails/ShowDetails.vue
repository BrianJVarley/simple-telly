<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShowDetail } from '@/composables/useShowDetail'
import { useEscapeKey } from '@/composables/useKeyboardNavHelpers'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import ApiError from '@/components/ErrorHandling/ApiError.vue'
import { useDocumentTitleHelper } from '@/composables/useDocumentTitleHelper'
import { nextTick, onMounted, ref, watch } from 'vue'

const router = useRouter()
const props = defineProps<{ id: number }>()
useEscapeKey(() => router.back())

const headingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => headingRef.value?.focus())
})

const { show, seasonCount, isLoading, error, fetchShow } = useShowDetail(props.id)
const { setDocumentTitle } = useDocumentTitleHelper()

watch(
  () => show.value?.name,
  (name) => {
    setDocumentTitle(name ?? 'Show Details')
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="flex flex-col min-h-screen p-6"
    :style="{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }"
  >
    <button @click="router.back()" type="button" aria-label="Go back" class="w-6 h-6 mb-4">
      <ArrowLeftIcon
        class="detail-icon-muted w-6 h-6 self-start transition-colors"
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
      @back-to-home="router.push({ name: 'home' })"
    />
    <div v-else-if="show" class="max-w-4xl mx-auto w-full" role="main">
      <div class="flex flex-col sm:flex-row gap-6">
        <img
          :src="show?.image?.medium ?? '/images/show-placeholder-404.svg'"
          :alt="show.name"
          class="w-1/2 mx-auto aspect-[2/3] sm:mx-0 sm:w-48 sm:aspect-auto rounded-lg object-cover"
        />
        <div class="flex-1">
          <h1
            ref="headingRef"
            data-testid="showDetailsHeader"
            tabindex="-1"
            class="text-3xl font-bold mb-2"
          >
            {{ show.name }}
          </h1>

          <div class="flex gap-2 flex-wrap mb-4" role="list" aria-label="Genres">
            <span v-for="genre in show.genres" :key="genre" role="listitem" class="info-chip">
              {{ genre }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <p class="detail-text-soft text-sm"><strong>Airing:</strong> {{ show.status }}</p>
            <p class="detail-text-soft text-sm"><strong>Language:</strong> {{ show.language }}</p>
            <p class="detail-text-soft text-sm">
              <strong>Rating:</strong> {{ show.rating.average ?? 'N/A' }}
              <span
                v-tooltip="'Top rated show'"
                v-if="(show.rating?.average ?? 0) >= 5"
                aria-label="Top rated"
                >⭐</span
              >
            </p>
            <p class="detail-text-soft text-sm">
              <strong>Premiered:</strong> {{ show.premiered ?? 'N/A' }}
            </p>
            <p v-if="seasonCount > 0" class="detail-text-muted text-sm">
              {{ seasonCount }}<strong> season{{ seasonCount > 1 ? 's' : '' }}</strong>
            </p>
            <p class="detail-text-soft text-sm">
              <strong>Network:</strong> {{ show.network?.name ?? 'N/A' }}
            </p>
            <p class="detail-text-soft text-sm">
              <strong>Schedule:</strong>
              {{
                show.schedule && (show.schedule.days.length || show.schedule.time)
                  ? `${show.schedule.days.join(', ') || 'N/A'}${show.schedule.time ? ` at ${show.schedule.time}` : ''}`
                  : 'N/A'
              }}
            </p>
          </div>

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
</style>
