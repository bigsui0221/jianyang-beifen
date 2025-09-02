<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import Iconify from '@purge-icons/generated'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'Icon' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('icon')

const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon hover color
  hoverColor: propTypes.string,
  // icon size
  size: propTypes.number.def(16),
  // icon hover size
  hoverSize: propTypes.number,
  // icon svg class
  svgClass: propTypes.string.def('')
})

const elRef = ref<ElRef>(null)

const isLocal = computed(() => props.icon?.startsWith('svg-icon:'))

const symbolId = computed(() => {
  return unref(isLocal) ? `#icon-${props.icon.split('svg-icon:')[1]}` : props.icon
})

const getIconifyStyle = computed(() => {
  const { size } = props
  return {
    fontSize: `${size}px`,
    height: '1em',
    color: iconColor.value
  }
})

const getSvgClass = computed(() => {
  const { svgClass } = props
  return `iconify ${svgClass}`
})

const updateIcon = async (icon: string) => {
  if (unref(isLocal)) return

  const el = unref(elRef)
  if (!el) return

  await nextTick()

  if (!icon) return

  const svg = Iconify.renderSVG(icon, {})
  if (svg) {
    el.textContent = ''
    el.appendChild(svg)
  } else {
    const span = document.createElement('span')
    span.className = 'iconify'
    span.dataset.icon = icon
    el.textContent = ''
    el.appendChild(span)
  }
}
const iconColor = ref<string>(props.color)
const iconScale = ref<number>(1)
const handleMouseEnter = () => {
  iconColor.value = props.hoverColor ?? props.color
  iconScale.value = props.hoverSize ? props.hoverSize / props.size : 1
}

const handleMouseLeave = () => {
  iconColor.value = props.color
  iconScale.value = 1
}

watch(
  () => props.icon,
  (icon: string) => {
    updateIcon(icon)
  }
)
</script>

<template>
  <ElIcon
    :class="prefixCls"
    :color="iconColor"
    :size="size"
    :style="{ transform: `scale(${iconScale})` }"
    style="transition: all var(--transition-time-02)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    class="opacity-100"
  >
    <svg v-if="isLocal" :class="getSvgClass" fill="currentColor">
      <use :xlink:href="symbolId" />
    </svg>

    <span v-else ref="elRef" :class="$attrs.class" :style="getIconifyStyle">
      <span :class="getSvgClass" :data-icon="symbolId"></span>
    </span>
  </ElIcon>
</template>
