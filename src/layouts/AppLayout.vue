<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'

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
    <main class="flex-1 pb-16 sm:pb-0">
      <slot />
    </main>
    <AppFooter />
    <div class="sm:hidden h-12 shrink-0" />
    <AppBottomNav />
  </div>
</template>
