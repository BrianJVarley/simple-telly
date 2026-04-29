import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useHorizontalScroll(containerRef: Ref<HTMLElement | null>) {
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  function updateScrollState() {
    const el = containerRef.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
  }

  function scrollBy(px: number) {
    containerRef.value?.scrollBy({ left: px, behavior: 'smooth' })
  }

  function scrollLeft() {
    scrollBy(-300)
  }

  function scrollRight() {
    scrollBy(300)
  }

  function onWheel(e: WheelEvent) {
    const el = containerRef.value
    if (!el) return
    if (e.deltaY !== 0) {
      e.preventDefault()
      el.scrollLeft += e.deltaY
      updateScrollState()
    }
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: false })
    updateScrollState()
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (!el) return
    el.removeEventListener('scroll', updateScrollState)
    el.removeEventListener('wheel', onWheel)
  })

  return { canScrollLeft, canScrollRight, scrollLeft, scrollRight, updateScrollState }
}
