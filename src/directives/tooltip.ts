import type { Directive } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'
type TooltipBinding = string | { text: string; placement?: Placement }

interface TooltipElement extends HTMLElement {
  _tooltip?: HTMLElement
  _showTooltip?: () => void
  _hideTooltip?: () => void
}

function parseBinding(value: TooltipBinding): { text: string; placement: Placement } {
  if (typeof value === 'string') return { text: value, placement: 'top' }
  return { text: value.text, placement: value.placement ?? 'top' }
}

function positionTip(tip: HTMLElement, el: HTMLElement, placement: Placement) {
  const rect = el.getBoundingClientRect()
  const gap = 6
  switch (placement) {
    case 'bottom':
      tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2 + window.scrollX}px`
      tip.style.top = `${rect.bottom + gap + window.scrollY}px`
      break
    case 'left':
      tip.style.left = `${rect.left - tip.offsetWidth - gap + window.scrollX}px`
      tip.style.top = `${rect.top + rect.height / 2 - tip.offsetHeight / 2 + window.scrollY}px`
      break
    case 'right':
      tip.style.left = `${rect.right + gap + window.scrollX}px`
      tip.style.top = `${rect.top + rect.height / 2 - tip.offsetHeight / 2 + window.scrollY}px`
      break
    case 'top':
    default:
      tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2 + window.scrollX}px`
      tip.style.top = `${rect.top - tip.offsetHeight - gap + window.scrollY}px`
  }
}

const tooltip: Directive<TooltipElement, TooltipBinding> = {
  mounted(el, binding) {
    const { text } = parseBinding(binding.value)
    const tip = document.createElement('div')
    tip.textContent = text
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
      positionTip(tip, el, parseBinding(binding.value).placement)
      tip.style.opacity = '1'
    }
    el._hideTooltip = () => {
      tip.style.opacity = '0'
    }

    el.addEventListener('mouseenter', el._showTooltip)
    el.addEventListener('mouseleave', el._hideTooltip)
  },

  updated(el, binding) {
    if (el._tooltip) el._tooltip.textContent = parseBinding(binding.value).text
  },

  unmounted(el) {
    if (el._showTooltip) el.removeEventListener('mouseenter', el._showTooltip)
    if (el._hideTooltip) el.removeEventListener('mouseleave', el._hideTooltip)
    el._tooltip?.remove()
  },
}

export default tooltip
