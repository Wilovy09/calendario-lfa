<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CookieBanner from '@/components/CookieBanner.vue'

const router = useRouter()
const auth = useAuthStore()

auth.init()

watch(
  () => auth.user,
  (user) => {
    if (user && router.currentRoute.value.name === 'login') router.replace({ name: 'home' })
  },
)
</script>

<template>
  <RouterView />
  <CookieBanner />
</template>
