<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

auth.init()

watch(
  () => auth.user,
  (user) => {
    if (user) router.replace({ name: 'home' })
  },
)
</script>

<template>
  <RouterView />
</template>
