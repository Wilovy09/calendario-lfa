<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import MapLibreGL, { type PopupOptions } from 'maplibre-gl'
import { useMap } from './composables/useMap'

const props = withDefaults(
  defineProps<{
    longitude: number
    latitude: number
    closeButton?: boolean
    closeOnClick?: boolean
    closeOnMove?: boolean
    anchor?: PopupOptions['anchor']
    offset?: PopupOptions['offset']
    className?: string
    onClose?: () => void
  }>(),
  {
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
  },
)

const { map, isLoaded } = useMap()
const contentRef = ref<HTMLDivElement>()
const popupRef = ref<MapLibreGL.Popup | null>(null)

function createPopup() {
  if (!map.value || !contentRef.value || popupRef.value) return

  const popup = new MapLibreGL.Popup({
    closeButton: props.closeButton,
    closeOnClick: props.closeOnClick,
    closeOnMove: props.closeOnMove,
    anchor: props.anchor,
    offset: props.offset,
    className: props.className,
  })
    .setLngLat([props.longitude, props.latitude])
    .setDOMContent(contentRef.value)
    .addTo(map.value)

  popup.on('close', () => props.onClose?.())
  popupRef.value = popup
}

onMounted(() => {
  if (map.value && isLoaded.value) createPopup()
})

watch(isLoaded, (loaded) => {
  if (loaded && map.value && !popupRef.value) createPopup()
})

watch([() => props.longitude, () => props.latitude], ([lng, lat]) => {
  popupRef.value?.setLngLat([lng, lat])
})

onUnmounted(() => {
  popupRef.value?.remove()
  popupRef.value = null
})
</script>

<template>
  <div style="display: none">
    <div ref="contentRef">
      <slot />
    </div>
  </div>
</template>
