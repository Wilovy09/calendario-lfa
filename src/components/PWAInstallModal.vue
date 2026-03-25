<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; install: [] }>()
const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative w-full max-w-md rounded-2xl bg-white dark:bg-d-card p-6 shadow-xl flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="`${BASE_URL}icons/icon.png`" alt="LFA" class="w-10 h-10 rounded-xl" />
            <div>
              <p class="font-bold text-slate-900 dark:text-white">Calendario LFA</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">wilovy09.github.io/calendario-lfa/</p>
            </div>
          </div>
          <button @click="emit('close')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-d-raised transition-colors"
            aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Al instalar la app en tu dispositivo obtienes una experiencia nativa: acceso directo
            desde tu pantalla de inicio, carga más rápida y uso sin conexión.
          </p>
          <p>
            Elegimos esta tecnología (PWA) en lugar de publicar en las tiendas de apps
            <span class="font-semibold text-slate-800 dark:text-white">para no depender de anuncios</span>.
            Sin intermediarios, sin trackers de terceros, sin costos ocultos para ti.
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500">
            No se instala ningún APK ni ejecutable — es solo un acceso directo a este sitio web, gestionado por tu
            propio navegador.
          </p>
          <p class="text-xs font-medium text-amber-600 dark:text-amber-400">
            Para una instalación completa en el cajón de apps, se recomienda usar
            <span class="font-bold">Google Chrome</span>.
          </p>
        </div>

        <div class="flex gap-3 pt-1">
          <button @click="emit('close')"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-d-border text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
            Ahora no
          </button>
          <button @click="emit('install')"
            class="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity">
            Instalar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
