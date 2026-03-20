<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const props = withDefaults(defineProps<{
  title: string
  back?: boolean
  themeToggle?: boolean
}>(), {
  back: false,
  themeToggle: false,
})

const BASE_URL = import.meta.env.BASE_URL
const { isDark, sync, toggle } = useTheme()
onMounted(sync)
</script>

<template>
  <header
    class="sticky top-0 z-20 bg-d-header text-white px-4 py-3 flex items-center justify-between shadow-lg"
  >
    <div class="flex items-center gap-2">
      <RouterLink
        v-if="props.back"
        to="/"
        class="p-1.5 rounded-lg hover:bg-d-raised transition-colors"
        aria-label="Volver"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </RouterLink>
      <span v-else class="text-xl">⚡</span>
      <span class="font-bold tracking-tight text-base sm:text-lg">{{ props.title }}</span>
    </div>

    <button
      v-if="props.themeToggle"
      @click="toggle"
      class="p-2 rounded-lg bg-d-card hover:bg-d-raised transition-colors leading-none"
      aria-label="Toggle theme"
    >
      <img
        :src="`${BASE_URL}icons/${isDark ? 'sun' : 'moon'}.svg`"
        class="w-5 h-5 brightness-0 invert"
        alt=""
      />
    </button>
  </header>
</template>
