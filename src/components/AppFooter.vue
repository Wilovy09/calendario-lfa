<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="mt-auto border-t border-slate-200 bg-[#FAF9F6] dark:border-d-border dark:bg-d-header">
    <div class="mx-auto max-w-5xl px-4 py-6">
      <div class="grid grid-cols-3 items-center text-xs text-slate-500 dark:text-slate-500">
        <p>Sitio no oficial creado por un fan</p>
        <RouterLink
          :to="{ name: 'privacy' }"
          class="text-center underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Políticas de Privacidad
        </RouterLink>
        <a
          href="https://github.com/Wilovy09/calendario-lfa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver código fuente en GitHub"
          class="ml-auto transition-opacity hover:opacity-70"
        >
          <img src="/icons/github.svg" alt="GitHub" class="h-7 w-7 dark:invert" />
        </a>
      </div>
    </div>
  </footer>
</template>
