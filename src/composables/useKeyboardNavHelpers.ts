import { onMounted, onUnmounted } from 'vue'

export function useEscapeKey(handler: () => void) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handler()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onUnmounted(() => document.removeEventListener('keydown', onKeydown))
}
