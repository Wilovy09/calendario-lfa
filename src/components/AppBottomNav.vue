<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const BASE_URL = import.meta.env.BASE_URL

const isActive = (name: string) => route.name === name
</script>

<template>
  <nav
    class="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-d-header border-t border-d-border
      flex items-stretch"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <!-- Home -->
    <RouterLink
      :to="{ name: 'home' }"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
      :class="isActive('home') ? 'text-white' : 'text-slate-500'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span class="text-[10px] font-medium leading-none">Inicio</span>
    </RouterLink>

    <!-- Posiciones -->
    <RouterLink
      :to="{ name: 'standings' }"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
      :class="isActive('standings') ? 'text-white' : 'text-slate-500'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>
      </svg>
      <span class="text-[10px] font-medium leading-none">Posiciones</span>
    </RouterLink>

    <!-- Leaderboard -->
    <RouterLink
      :to="{ name: 'leaderboard' }"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
      :class="isActive('leaderboard') ? 'text-white' : 'text-slate-500'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
      <span class="text-[10px] font-medium leading-none">Ranking</span>
    </RouterLink>

    <!-- Profile -->
    <RouterLink
      :to="user ? { name: 'home' } : { name: 'login' }"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
      :class="isActive('login') ? 'text-white' : 'text-slate-500'"
    >
      <template v-if="user?.user_metadata?.avatar_url">
        <img
          :src="user.user_metadata.avatar_url"
          referrerpolicy="no-referrer"
          class="w-6 h-6 rounded-full object-cover"
          :class="isActive('login') ? 'ring-2 ring-white' : ''"
          alt=""
        />
      </template>
      <template v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </template>
      <span class="text-[10px] font-medium leading-none">{{ user ? 'Perfil' : 'Entrar' }}</span>
    </RouterLink>
  </nav>
</template>
