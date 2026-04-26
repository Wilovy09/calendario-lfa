<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import AppLayout from '@/layouts/AppLayout.vue'

type Entry = {
  id: string
  name: string
  avatar_url: string | null
  aciertos: number
  jugados: number
  porcentaje: number
}

const entries = ref<Entry[]>([])
const loading = ref(true)

onMounted(async () => {
  const EXCLUDED = new Set([''])
  const { data } = await supabase.from('leaderboard').select('*').limit(20)
  entries.value = (data ?? []).filter((e) => !EXCLUDED.has(e.name ?? '')).slice(0, 10)
  loading.value = false
})

const medalColors: Record<number, string> = { 0: '#FFD700', 1: '#C0C0C0', 2: '#CD7F32' }
</script>

<template>
  <AppLayout title="Clasificación" :theme-toggle="true" back>
    <main class="px-4 py-8 max-w-md mx-auto">
      <!-- Skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 10" :key="n"
          class="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-d-card border border-slate-100 dark:border-d-border animate-pulse">
          <div class="w-6 shrink-0" />
          <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-d-raised shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 w-32 rounded-full bg-slate-200 dark:bg-d-raised" />
            <div class="h-3 w-20 rounded-full bg-slate-200 dark:bg-d-raised" />
          </div>
          <div class="h-6 w-8 rounded-full bg-slate-200 dark:bg-d-raised" />
        </div>
      </div>

      <!-- Empty -->
      <p v-else-if="entries.length === 0" class="text-center text-slate-400 text-sm py-16">
        Aún no hay predicciones resueltas
      </p>

      <!-- List -->
      <div v-else class="space-y-3">
        <div v-for="(entry, i) in entries" :key="entry.id"
          class="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-d-card border border-slate-100 dark:border-d-border"
          :class="i === 0 ? 'ring-2 ring-amber-400/60' : ''">
          <!-- Position -->
          <div class="w-6 flex items-center justify-center shrink-0">
            <svg v-if="medalColors[i]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"
              :fill="medalColors[i]">
              <path
                d="M216,96A88,88,0,1,0,72,163.83V240a8,8,0,0,0,11.58,7.16L128,225l44.43,22.21A8.07,8.07,0,0,0,176,248a8,8,0,0,0,8-8V163.83A87.85,87.85,0,0,0,216,96ZM56,96a72,72,0,1,1,72,72A72.08,72.08,0,0,1,56,96ZM168,227.06l-36.43-18.21a8,8,0,0,0-7.16,0L88,227.06V174.37a87.89,87.89,0,0,0,80,0ZM128,152A56,56,0,1,0,72,96,56.06,56.06,0,0,0,128,152Zm0-96A40,40,0,1,1,88,96,40,40,0,0,1,128,56Z" />
            </svg>
            <span v-else class="text-sm font-semibold text-slate-400">{{ i + 1 }}</span>
          </div>

          <!-- Avatar -->
          <img v-if="entry.avatar_url" :src="entry.avatar_url" :alt="entry.name ?? ''" referrerpolicy="no-referrer"
            class="w-10 h-10 rounded-full shrink-0 object-cover" />
          <div v-else
            class="w-10 h-10 rounded-full shrink-0 bg-slate-200 dark:bg-d-raised flex items-center justify-center text-slate-500 font-bold text-sm">
            {{ (entry.name ?? '?')[0]?.toUpperCase() }}
          </div>

          <!-- Name + stats -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {{ entry.name ?? 'Usuario' }}
            </p>
            <p class="text-xs text-slate-400">
              {{ entry.jugados }} prediccion{{ entry.jugados !== 1 ? 'es' : '' }}
            </p>
          </div>

          <!-- Porcentaje -->
          <div class="text-right shrink-0">
            <p class="font-black text-lg leading-none"
              :class="i === 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'">
              {{ entry.porcentaje }}%
            </p>
            <p class="text-[10px] text-slate-400 uppercase tracking-wide">{{ entry.aciertos }}/{{ entry.jugados }}</p>
          </div>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
