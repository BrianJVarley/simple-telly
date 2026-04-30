import type { Directive } from 'vue'

const tooltip: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const tip = document.createElement('div')
    tip.textContent = binding.value
    tip.style.cssText = `
      position: absolute;
      background: #1f2937;
      color: #f9fafb;
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 9999;
    `
    document.body.appendChild(tip)
    el._tooltip = tip

    el._showTooltip = () => {
      const rect = el.getBoundingClientRect()
      tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2 + window.scrollX}px`
      tip.style.top = `${rect.top - tip.offsetHeight - 6 + window.scrollY}px`
      tip.style.opacity = '1'
    }
    el._hideTooltip = () => { tip.style.opacity = '0' }

    el.addEventListener('mouseenter', el._showTooltip)
    el.addEventListener('mouseleave', el._hideTooltip)
  },

  updated(el, binding) {
    if (el._tooltip) el._tooltip.textContent = binding.value
  },

  unmounted(el) {
    el.removeEventListener('mouseenter', el._showTooltip)
    el.removeEventListener('mouseleave', el._hideTooltip)
    el._tooltip?.remove()
  },
}

export default tooltip
