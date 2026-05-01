import { ref } from 'vue'

const lastVisitedShowId = ref<number | null>(null)
const savedScrollY = ref(0)

interface CaptureOptions {
  saveScroll?: boolean
}

interface RestoreOptions {
  fallbackSelector?: string
}

export function useShowNavigation() {
  function captureBeforeNavigate(showId: number, options: CaptureOptions = {}) {
    const { saveScroll = true } = options

    lastVisitedShowId.value = showId
    savedScrollY.value = saveScroll ? window.scrollY : 0
  }

  function restoreAfterBackNavigation(options: RestoreOptions = {}) {
    const { fallbackSelector = '[aria-label="Toggle search"]' } = options

    if (savedScrollY.value > 0) {
      window.scrollTo(0, savedScrollY.value)
    }

    if (lastVisitedShowId.value !== null) {
      const showTile = document.querySelector<HTMLElement>(
        `[data-show-id="${lastVisitedShowId.value}"]`,
      )

      if (showTile) {
        showTile.focus()
      } else {
        document.querySelector<HTMLElement>(fallbackSelector)?.focus()
      }

      lastVisitedShowId.value = null
    }
  }

  return {
    captureBeforeNavigate,
    restoreAfterBackNavigation,
    lastVisitedShowId,
  }
}
