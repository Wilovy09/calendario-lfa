<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    size?: number
  }>(),
  {
    size: 64,
  },
)

const SPRITE_W = 2041
const SPRITE_H = 1021
const CELL_W = SPRITE_W / 4
const CELL_H = SPRITE_H / 2

const positions: Record<string, [col: number, row: number]> = {
  Caudillos: [0, 0],
  Osos: [1, 0],
  'Gallos Negros': [2, 0],
  Mexicas: [3, 0],
  Reyes: [0, 1],
  Dinos: [1, 1],
  Raptors: [2, 1],
}

const zoomOverrides: Record<string, number> = {
  'Gallos Negros': 1.5,
}

const [col, row] = positions[props.name] ?? [0, 0]
const zoom = zoomOverrides[props.name] ?? 1

const scale = (props.size / CELL_H) * zoom
const bgW = Math.round(SPRITE_W * scale)
const bgH = Math.round(SPRITE_H * scale)
const bgX = Math.round(props.size / 2 - (col * CELL_W + CELL_W / 2) * scale)
const bgY = Math.round(props.size / 2 - (row * CELL_H + CELL_H / 2) * scale)

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
  <div
    :title="name"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: `url('${BASE_URL}logos.png')`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundRepeat: 'no-repeat',
    }"
  />
</template>
