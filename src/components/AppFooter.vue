<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePWAInstall } from '@/components/usePWAInstall'
import PWAInstallModal from '@/components/PWAInstallModal.vue'

const BASE_URL = import.meta.env.BASE_URL
const { isInstallable, install, isMobile, isChrome } = usePWAInstall()
const showModal = ref(false)

const showInstallSection = computed(() => isMobile.value && (isInstallable.value || !isChrome.value))

async function handleInstall() {
  showModal.value = false
  await install()
}
</script>

<template>
  <footer class="mt-auto border-t border-slate-200 bg-[#FAF9F6] dark:border-d-border dark:bg-d-header">
    <div class="mx-auto max-w-5xl px-4 py-6">
      <div
        v-if="showInstallSection"
        class="mb-4 pb-4 border-b border-slate-200 dark:border-d-border flex items-center justify-between gap-4"
      >
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Llévalo en tu bolsillo</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sin App Store, sin anuncios, sin costo.</p>
        </div>
        <button
          @click="showModal = true"
          class="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <img :src="`${BASE_URL}icons/download.svg`" alt="" class="w-3.5 h-3.5 invert dark:invert-0" />
          Instalar App
        </button>
      </div>

      <div class="grid grid-cols-3 items-center text-xs text-slate-500 dark:text-slate-500">
        <p>Sitio no oficial creado por un fan</p>
        <RouterLink :to="{ name: 'privacy' }"
          class="text-center underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300">
          Políticas de Privacidad
        </RouterLink>
        <a href="https://github.com/Wilovy09/calendario-lfa" target="_blank" rel="noopener noreferrer"
          aria-label="Ver código fuente en GitHub" class="ml-auto transition-opacity hover:opacity-70">
          <img :src="`${BASE_URL}icons/github.svg`" alt="GitHub" class="h-7 w-7 dark:invert" />
        </a>
      </div>
    </div>
  </footer>

  <PWAInstallModal :open="showModal" :isChrome="isChrome" @close="showModal = false" @install="handleInstall" />
</template>
