<script setup lang="ts">
import { useCookieConsent } from '@/composables/useCookieConsent'

const { showBanner, accept, decline } = useCookieConsent()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showBanner"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Aviso de cookies"
    >
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        appear
      >
        <div
          class="w-full max-w-md rounded-2xl border border-slate-200 bg-[#FAF9F6] p-6 shadow-2xl dark:border-d-border dark:bg-d-card"
        >
          <!-- Header -->
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Bienvenido a Calendario LFA
            </h2>
          </div>

          <!-- Body -->
          <div class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <span class="font-medium text-slate-800 dark:text-slate-200">Calendario LFA</span> es
              un sitio no oficial de la Liga de Fútbol Americano, creado por un fan para ofrecer una
              mejor visualización de los partidos y equipos de la liga.
            </p>
            <p>
              Para mejorar tu experiencia, usamos
              <span class="font-medium text-slate-800 dark:text-slate-200">Microsoft Clarity</span>,
              una herramienta de analítica que nos ayuda a entender cómo se usa el sitio mediante
              mapas de calor y grabaciones de sesión.
            </p>
            <p>
              Clarity puede almacenar cookies en tu navegador para identificar tu sesión. No
              recopilamos ni vendemos datos personales. Si rechazas, Clarity seguirá inicializándose
              pero sin registrar tu actividad.
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex gap-3">
            <button
              class="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              @click="accept"
            >
              Aceptar
            </button>
            <button
              class="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-d-border dark:text-slate-300 dark:hover:bg-d-raised"
              @click="decline"
            >
              Rechazar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
