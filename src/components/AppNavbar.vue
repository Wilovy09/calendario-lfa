<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const props = withDefaults(
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

const BASE_URL = import.meta.env.BASE_URL
const { isDark, sync, toggle } = useTheme()
const authStore = useAuthStore()
const { user, isAdmin } = storeToRefs(authStore)
const { signOut } = authStore
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </RouterLink>
      <span v-else class="text-xl">
        <img :src="`${BASE_URL}icons/icon.png`" alt="Logo" class="w-6 h-6 mr-1 inline-block -mt-1" />
      </span>
      <span class="font-bold tracking-tight text-base sm:text-lg">{{ props.title }}</span>
    </div>

    <div class="flex items-center gap-2">
      <RouterLink
        v-if="isAdmin"
        :to="{ name: 'admin' }"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors text-xs font-bold"
        aria-label="Admin"
      >
        Admin
      </RouterLink>
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
      <button
        v-if="user"
        @click="signOut"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-d-card hover:bg-d-raised transition-colors"
        aria-label="Cerrar sesión"
      >
        <span class="text-sm font-medium">{{ user.user_metadata.full_name }}</span>
        <img :src="`${BASE_URL}icons/logout.svg`" class="w-5 h-5 brightness-0 invert" alt="" />
      </button>
      <RouterLink
        v-else
        :to="{ name: 'login' }"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-d-card hover:bg-d-raised transition-colors"
        aria-label="Iniciar sesión"
      >
        <span class="text-sm font-medium">Iniciar sesión</span>
        <img :src="`${BASE_URL}icons/login.svg`" class="w-5 h-5 brightness-0 invert" alt="" />
      </RouterLink>
    </div>
  </header>
</template>
