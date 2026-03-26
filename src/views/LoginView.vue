<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'

const BASE_URL = import.meta.env.BASE_URL
const { signInWithGoogle } = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-d-bg flex items-center justify-center">
    <div class="bg-d-card rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl w-full max-w-sm mx-4 border border-white/5">

      <img :src="`${BASE_URL}icons/icon.png`" alt="Logo" class="w-16 h-16 rounded-2xl shadow-lg" />
      <div class="text-center">
        <h1 class="text-white font-bold text-2xl">Calendario LFA</h1>
        <p class="text-slate-400 text-sm mt-1">Inicia sesión para guardar tus favoritos</p>
      </div>

      <div class="w-full flex flex-col gap-3 pt-1">
        <button
          @click="signInWithGoogle"
          class="group flex items-center gap-3 bg-white text-gray-800 font-medium px-6 py-3 rounded-xl w-full justify-center shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5 shrink-0">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,19.000,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <p class="text-xs text-slate-500 text-center">
        Al continuar aceptas nuestras
        <RouterLink :to="{ name: 'privacy' }" class="underline underline-offset-2 hover:text-slate-300 transition-colors">
          Políticas de Privacidad
        </RouterLink>
      </p>
    </div>
  </div>
</template>
