<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

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
  <div class="flex min-h-screen flex-col">
    <AppNavbar :title="title" :back="back" :theme-toggle="themeToggle" />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
