<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import TeamLogo from '@/components/TeamLogo.vue'
import { lfa_games } from '@/consts/games'
import AppLayout from '@/layouts/AppLayout.vue'
import MapComponent from '@/components/ui/map/Map.vue'
import MapPopup from '@/components/ui/map/MapPopup.vue'

const route = useRoute()

const BASE_URL = import.meta.env.BASE_URL

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d: string) => {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, day).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
const sid = (n: string) => n.replace(/\s+/g, '-')
const makeGameId = (week: number, home: string, away: string) =>
  `s${week}-${sid(home).toLowerCase()}-vs-${sid(away).toLowerCase()}`

// ─── Find game ────────────────────────────────────────────────────────────────
const game = computed(() => {
  const id = route.params.id as string
  const teamMap = new Map(lfa_games.map(([n, t]) => [n, t]))
  for (const [name, team] of lfa_games) {
    for (const g of team.games ?? []) {
      if (!g.goodbye && makeGameId(g.week, name, g.rival!) === id) {
        return {
          id,
          week: g.week,
          home: name,
          away: g.rival!,
          date: g.date,
          time: g.time!,
          stadium: team.stadium ?? '',
          coords: team.coords,
          website: teamMap.get(name)?.website ?? null,
        }
      }
    }
  }
  return null
})

// ─── Google Calendar link ─────────────────────────────────────────────────────
const calendarUrl = computed(() => {
  if (!game.value) return ''
  const { home, away, date, time, stadium } = game.value
  const [h, m] = time.split(':').map(Number) as [number, number]
  const [y, mo, d] = date.split('-').map(Number) as [number, number, number]
  const start = new Date(y, mo - 1, d, h, m)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000) // +3 horas
  const fmt = (dt: Date) =>
    dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${home} vs ${away} — LFA`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: stadium,
  })
  return `https://calendar.google.com/calendar/render?${params}`
})

// ─── Pick persistence ─────────────────────────────────────────────────────────
const pick = ref<string | null>(null)
onMounted(() => {
  pick.value = localStorage.getItem(`pick-${route.params.id}`)
})

function togglePick(choice: 'home' | 'away') {
  const next = pick.value === choice ? null : choice
  pick.value = next
  const key = `pick-${route.params.id}`
  if (next) localStorage.setItem(key, next)
  else localStorage.removeItem(key)
}

</script>

<template>
  <AppLayout v-if="game" :title="`Semana ${game.week}`" :theme-toggle="true" back>
    <main
      class="px-4 py-8 max-w-md mx-auto space-y-6 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-stretch">

      <!-- Columna izquierda: card + quién ganará -->
      <div class="space-y-6">
        <!-- Matchup card -->
        <div class="bg-white dark:bg-d-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-d-border">
          <div class="flex items-center justify-between gap-2">
            <!-- Home -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-24 h-24 overflow-hidden flex items-center justify-center">
                <TeamLogo :name="game.home" :size="96" />
              </div>
              <p class="font-bold text-center text-sm leading-tight">{{ game.home }}</p>
              <span
                class="flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                <img :src="`${BASE_URL}icons/home.svg`"
                  class="w-3 h-3 brightness-0 saturate-0 opacity-70 dark:brightness-0 dark:invert" alt="" />
                Local
              </span>
            </div>

            <!-- VS -->
            <span class="text-2xl font-black text-slate-300 dark:text-slate-600 shrink-0">VS</span>

            <!-- Away -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-24 h-24 overflow-hidden flex items-center justify-center">
                <TeamLogo :name="game.away" :size="96" />
              </div>
              <p class="font-bold text-center text-sm leading-tight">{{ game.away }}</p>
              <span
                class="flex items-center gap-1 text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                <img :src="`${BASE_URL}icons/away.svg`"
                  class="w-3 h-3 brightness-0 saturate-0 opacity-70 dark:brightness-0 dark:invert" alt="" />
                Visita
              </span>
            </div>
          </div>

          <!-- Date / stadium -->
          <div
            class="mt-5 pt-4 border-t border-slate-100 dark:border-d-border space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <p class="flex items-center gap-2">
              <span>📅</span>
              <span class="capitalize">{{ fmt(game.date) }}</span>
            </p>
            <p class="flex items-center gap-2">
              <span>🕐</span>
              <span>{{ game.time }} hrs</span>
            </p>
            <p v-if="game.stadium" class="flex items-center gap-2">
              <img :src="`${BASE_URL}icons/pin_map.svg`"
                class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert" alt="" />
              <span>{{ game.stadium }}</span>
            </p>
          </div>
        </div>

        <!-- ¿Quién ganará? -->
        <div class="bg-white dark:bg-d-card rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-d-border">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
            ¿Quién ganará?
          </p>
          <div class="flex gap-3">
            <button @click="togglePick('home')" :class="[
              'flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
              pick === 'home'
                ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                : 'border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500',
            ]">
              <div class="w-14 h-14 overflow-hidden flex items-center justify-center pointer-events-none">
                <TeamLogo :name="game.home" :size="56" />
              </div>
              <span class="text-xs font-semibold">{{ game.home }}</span>
            </button>

            <button @click="togglePick('away')" :class="[
              'flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
              pick === 'away'
                ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                : 'border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500',
            ]">
              <div class="w-14 h-14 overflow-hidden flex items-center justify-center pointer-events-none">
                <TeamLogo :name="game.away" :size="56" />
              </div>
              <span class="text-xs font-semibold">{{ game.away }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Columna derecha: mapa + acciones -->
      <div class="flex flex-col gap-3">
        <div v-if="game.coords"
          class="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-d-border h-52 lg:flex-1">
          <MapComponent :center="[game.coords[1], game.coords[0]]" :zoom="15" class="h-full w-full">
            <MapPopup :longitude="game.coords[1]" :latitude="game.coords[0]">
              <div
                class="bg-white dark:bg-d-card border border-slate-200 dark:border-d-border rounded-xl shadow-md px-3 py-2 space-y-0.5">
                <p class="font-semibold text-sm text-slate-800 dark:text-slate-100">{{ game.home }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ game.stadium }}</p>
              </div>
            </MapPopup>
          </MapComponent>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <a :href="calendarUrl" target="_blank" rel="noopener"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-d-border bg-white dark:bg-d-card hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200">
            <img :src="`${BASE_URL}icons/pin_map.svg`" class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert" alt="" />
            Agregar al calendario
          </a>
          <a v-if="game.website" :href="game.website" target="_blank" rel="noopener"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-d-border bg-white dark:bg-d-card hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200">
            Ver página del equipo
          </a>
        </div>
      </div>
    </main>
  </AppLayout>

  <!-- 404 -->
  <div v-else class="flex flex-col items-center justify-center min-h-screen gap-4">
    <p class="text-lg font-semibold text-slate-500">Partido no encontrado</p>
    <RouterLink to="/" class="text-amber-500 hover:underline">Volver al calendario</RouterLink>
  </div>
</template>
