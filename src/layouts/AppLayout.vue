<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'

withDefaults(
  defineProps<{
    title: string
    back?: boolean
    themeToggle?: boolean
  }>(),
  {
    back: false,
    themeToggle: false,
  },
)
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar :title="title" :back="back" :theme-toggle="themeToggle" />
    <slot />
  </div>
</template>
