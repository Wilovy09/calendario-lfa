<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import TeamLogo from '@/components/TeamLogo.vue'
import { useStandings } from '@/composables/useStandings'

const { standings, loading } = useStandings()

const formColor: Record<string, string> = {
  G: 'bg-emerald-500 text-white',
  P: 'bg-red-500 text-white',
  E: 'bg-slate-400 text-white',
  '?': 'bg-slate-200 dark:bg-d-raised text-slate-400',
}
</script>

<template>
  <AppLayout title="Posiciones" :theme-toggle="true" back>
    <main class="px-4 py-6 max-w-2xl mx-auto">

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-2">
        <div v-for="n in 7" :key="n"
          class="h-14 rounded-xl bg-white dark:bg-d-card border border-slate-100 dark:border-d-border animate-pulse" />
      </div>

      <template v-else>
        <!-- Classification label -->
        <p v-if="standings[0]?.classification" class="text-xs text-slate-400 mb-3 text-center">
          {{ standings[0].classification }}
        </p>

        <!-- Header -->
        <div class="grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_3.5rem_4rem] gap-x-2 items-center
          px-3 mb-1 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
          <span class="text-center">#</span>
          <span>Equipo</span>
          <span class="text-center">PJ</span>
          <span class="text-center">G</span>
          <span class="text-center">P</span>
          <span class="text-center">PT</span>
          <span class="text-center">Forma</span>
        </div>

        <!-- Rows -->
        <div class="space-y-1.5">
          <div
            v-for="row in standings"
            :key="row.team"
            class="grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_3.5rem_4rem] gap-x-2 items-center
              px-3 py-2.5 rounded-xl bg-white dark:bg-d-card border border-slate-100 dark:border-d-border"
          >
            <!-- Position -->
            <span
              class="text-xs font-bold text-center rounded-md px-0.5 py-0.5 leading-none"
              :class="row.classification ? 'bg-blue-700 text-white' : 'text-slate-400'"
            >
              {{ row.position }}
            </span>

            <!-- Team -->
            <div class="flex items-center gap-2 min-w-0">
              <TeamLogo :name="row.team" :size="28" class="shrink-0" />
              <span class="text-sm font-semibold truncate text-slate-900 dark:text-white">
                {{ row.team }}
              </span>
            </div>

            <!-- PJ -->
            <span class="text-xs text-center text-slate-500 dark:text-slate-400">{{ row.pj }}</span>

            <!-- G -->
            <span class="text-xs text-center font-semibold text-slate-900 dark:text-white">{{ row.wins }}</span>

            <!-- P -->
            <span class="text-xs text-center text-slate-500 dark:text-slate-400">{{ row.losses }}</span>

            <!-- PT -->
            <span class="text-xs text-center text-slate-500 dark:text-slate-400">
              {{ row.pts_for }}:{{ row.pts_against }}
            </span>

            <!-- Form -->
            <div class="flex gap-0.5 justify-center">
              <span
                v-for="(f, fi) in row.form.slice(-4)"
                :key="fi"
                class="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center leading-none"
                :class="formColor[f] ?? formColor['?']"
              >{{ f }}</span>
            </div>
          </div>
        </div>

        <p class="text-[10px] text-slate-400 text-center mt-4">
          Fuente: Flashscore · PT = Puntos totales (favor:contra)
        </p>
      </template>
    </main>
  </AppLayout>
</template>
