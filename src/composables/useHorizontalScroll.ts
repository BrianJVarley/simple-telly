import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useHorizontalScroll(containerRef: Ref<HTMLElement | null>) {
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  let resizeObserver: ResizeObserver | null = null

  function updateScrollState() {
    const el = containerRef.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 0.1
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
    // Only remap for mouse wheels (DOM_DELTA_LINE/PAGE), not trackpad pixel scrolls.
    // Trackpads report deltaMode === 0 (DOM_DELTA_PIXEL) and handle horizontal
    // scrolling natively via deltaX — intercepting their deltaY breaks vertical scroll.
    if (e.deltaX === 0 && e.deltaMode !== WheelEvent.DOM_DELTA_PIXEL && e.deltaY !== 0) {
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

    resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(el)
    // also observe the inner content for width changes
    if (el.firstElementChild) resizeObserver.observe(el.firstElementChild)
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (el) {
      el.removeEventListener('scroll', updateScrollState)
      el.removeEventListener('wheel', onWheel)
    }
    resizeObserver?.disconnect()
  })

  return { canScrollLeft, canScrollRight, scrollLeft, scrollRight, updateScrollState }
}
