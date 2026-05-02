<script setup lang="ts">
import type { Show } from '@/types/tvShowModel'
import { StarIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

const { show } = defineProps<{ show: Show | undefined }>()

const emit = defineEmits<{
  select: [showId: number]
}>()

const topPickSrc = computed(() => show?.image?.original ?? '/images/show-placeholder-404.svg')
</script>

<template>
  <div
    v-if="show"
    :key="show.id"
    :data-show-id="show.id"
    data-testid="top-picks-banner"
    :aria-label="`Pick of the day show ${show.name}`"
    class="pick-of-day-banner flex-shrink-0 w-full cursor-pointer hover:scale-105 transition-transform pb-2 pt-2 pl-8 pr-8"
  >
    <div class="min-w-0 px-0.5 pb-1 flex flex-row justify-start items-center">
      <h2
        class="genre-row-title text-sm pb-2 font-semibold uppercase tracking-wider pt-3 pb-1 flex flex-row items-center gap-1"
      >
        <StarIcon class="pick-of-the-day-icon w-6 h-6" />
        Pick of the day {{ show.name }}
      </h2>
    </div>
    <img
      tabindex="0"
      @click="emit('select', show.id)"
      @keydown.enter.prevent="emit('select', show.id)"
      @keydown.space.prevent="emit('select', show.id)"
      :src="topPickSrc"
      :alt="show.name"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      class="w-full aspect-[16/5] object-cover object-center rounded-lg mt-1 mb-2"
    />
  </div>
</template>

<style scoped>
.pick-of-day-banner {
  color: var(--color-text-muted);
  background-color: var(--color-background-soft);
}
</style>
