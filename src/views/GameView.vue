<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import TeamLogo from '@/components/TeamLogo.vue'
import { lfa_games } from '@/consts/games'
import AppLayout from '@/layouts/AppLayout.vue'
import MapComponent from '@/components/ui/map/Map.vue'
import MapPopup from '@/components/ui/map/MapPopup.vue'
import { useVotesStore } from '@/stores/votes'
import { useAuthStore } from '@/stores/auth'
import { useGames, gameLocalTime } from '@/composables/useGames'

const route = useRoute()

const BASE_URL = import.meta.env.BASE_URL
const teamsByName = new Map(lfa_games)
const { games: remoteGames } = useGames()

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

// ─── Find game desde Supabase ─────────────────────────────────────────────────
const game = computed(() => {
  const id = route.params.id as string
  const remote = remoteGames.value.find((g) => g.id === id)
  if (!remote) return null
  const homeTeam = teamsByName.get(remote.home_team)
  const { date, time } = gameLocalTime(remote.starts_at)
  return {
    id: remote.id,
    week: remote.week,
    home: remote.home_team,
    away: remote.away_team,
    date,
    time,
    starts_at: remote.starts_at,
    stadium: homeTeam?.stadium ?? '',
    coords: homeTeam?.coords,
    website: homeTeam?.website ?? null,
  }
})

// ─── Google Calendar link ─────────────────────────────────────────────────────
const calendarUrl = computed(() => {
  if (!game.value) return ''
  const { home, away, date, time, stadium } = game.value
  const [h, m] = time.split(':').map(Number) as [number, number]
  const [y, mo, d] = date.split('-').map(Number) as [number, number, number]
  const start = new Date(y, mo - 1, d, h, m)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000) // +3 horas
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${home} vs ${away} — LFA`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: stadium,
  })
  return `https://calendar.google.com/calendar/render?${params}`
})

// ─── Votes ────────────────────────────────────────────────────────────────────
const votesStore = useVotesStore()
const auth = useAuthStore()

onMounted(() => {
  if (game.value) votesStore.fetchVotes(game.value.id)
})

const votes = computed(() => votesStore.getVotes(game.value?.id ?? ''))
const isLoadingVotes = computed(() => votesStore.loading[game.value?.id ?? ''] ?? true)
const pick = computed(() => votes.value.userVote)
const homePct = computed(() =>
  votes.value.total === 0 ? 50 : Math.round((votes.value.home / votes.value.total) * 100),
)
const awayPct = computed(() => (votes.value.total === 0 ? 50 : 100 - homePct.value))
const homeTeamColor = computed(() =>
  game.value ? (teamsByName.get(game.value.home)?.color ?? '#22c55e') : '#22c55e',
)
const awayTeamColor = computed(() =>
  game.value ? (teamsByName.get(game.value.away)?.color ?? '#3b82f6') : '#3b82f6',
)

const isVoteLocked = computed(() => {
  if (!game.value) return false
  return Date.now() >= new Date(game.value.starts_at).getTime() - 30 * 60 * 1000
})

async function togglePick(choice: 'home' | 'away') {
  if (!auth.user) {
    auth.signInWithGoogle()
    return
  }
  if (game.value) await votesStore.castVote(game.value.id, choice)
}
</script>

<template>
  <AppLayout v-if="game" :title="`Semana ${game.week}`" :theme-toggle="true" back>
    <main
      class="px-4 py-8 max-w-md mx-auto space-y-6 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-stretch"
    >
      <!-- Columna izquierda: card + quién ganará -->
      <div class="space-y-6">
        <!-- Matchup card -->
        <div
          class="bg-white dark:bg-d-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-d-border"
        >
          <div class="flex items-center justify-between gap-2">
            <!-- Home -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-24 h-24 overflow-hidden flex items-center justify-center">
                <TeamLogo :name="game.home" :size="96" />
              </div>
            </div>

            <!-- VS -->
            <span class="text-2xl font-black text-slate-300 dark:text-slate-600 shrink-0">VS</span>

            <!-- Away -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-24 h-24 overflow-hidden flex items-center justify-center">
                <TeamLogo :name="game.away" :size="96" />
              </div>
            </div>
          </div>

          <!-- Date / stadium -->
          <div
            class="mt-5 pt-4 border-t border-slate-100 dark:border-d-border space-y-1.5 text-sm text-slate-500 dark:text-slate-400"
          >
            <p class="flex items-center gap-2">
              <img
                :src="`${BASE_URL}icons/calendar.svg`"
                class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert"
                alt=""
              />
              <span class="capitalize">{{ fmt(game.date) }}</span>
            </p>
            <p class="flex items-center gap-2">
              <img
                :src="`${BASE_URL}icons/clock.svg`"
                class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert"
                alt=""
              />
              <span>{{ game.time }} hrs</span>
            </p>
            <p v-if="game.stadium" class="flex items-center gap-2">
              <img
                :src="`${BASE_URL}icons/pin_map.svg`"
                class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert"
                alt=""
              />
              <span>{{ game.stadium }}</span>
            </p>
          </div>
        </div>

        <!-- ¿Quién ganará? -->
        <div
          class="bg-white dark:bg-d-card rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-d-border"
        >
          <p
            class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center"
          >
            ¿Quién ganará?
          </p>

          <!-- Skeleton -->
          <template v-if="isLoadingVotes">
            <div class="flex gap-3">
              <div
                v-for="n in 2"
                :key="n"
                class="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-slate-100 dark:border-d-border animate-pulse"
              >
                <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-d-raised" />
                <div class="h-3 w-16 rounded-full bg-slate-200 dark:bg-d-raised" />
              </div>
            </div>
            <div class="mt-4 space-y-2 animate-pulse">
              <div class="h-3 rounded-full bg-slate-200 dark:bg-d-raised" />
              <div class="flex justify-between">
                <div class="h-3 w-20 rounded-full bg-slate-200 dark:bg-d-raised" />
                <div class="h-3 w-14 rounded-full bg-slate-200 dark:bg-d-raised" />
                <div class="h-3 w-20 rounded-full bg-slate-200 dark:bg-d-raised" />
              </div>
            </div>
          </template>

          <!-- Content -->
          <template v-else>
            <div class="flex gap-3">
              <button
                @click="togglePick('home')"
                :disabled="isVoteLocked"
                :class="[
                  'flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
                  isVoteLocked
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-d-border'
                    : pick === 'home'
                      ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                      : 'border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500',
                ]"
              >
                <div
                  class="w-14 h-14 overflow-hidden flex items-center justify-center pointer-events-none"
                >
                  <TeamLogo :name="game.home" :size="56" />
                </div>
                <span class="text-xs font-semibold">{{ game.home }}</span>
              </button>

              <button
                @click="togglePick('away')"
                :disabled="isVoteLocked"
                :class="[
                  'flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all',
                  isVoteLocked
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-d-border'
                    : pick === 'away'
                      ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                      : 'border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500',
                ]"
              >
                <div
                  class="w-14 h-14 overflow-hidden flex items-center justify-center pointer-events-none"
                >
                  <TeamLogo :name="game.away" :size="56" />
                </div>
                <span class="text-xs font-semibold">{{ game.away }}</span>
              </button>
            </div>
            <p v-if="isVoteLocked" class="mt-3 text-center text-xs text-slate-400">
              Las votaciones cerraron 30 min antes del partido
            </p>

            <!-- Barra de porcentaje -->
            <div v-if="votes.total > 0" class="mt-4 space-y-1">
              <div class="flex overflow-hidden rounded-full h-3 bg-slate-100 dark:bg-d-raised">
                <div
                  class="transition-all duration-500"
                  :style="{ width: `${homePct}%`, backgroundColor: homeTeamColor }"
                />
                <div
                  class="transition-all duration-500"
                  :style="{ width: `${awayPct}%`, backgroundColor: awayTeamColor }"
                />
              </div>
              <div
                class="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium"
              >
                <span :style="{ color: homeTeamColor }">{{ homePct }}% {{ game.home }}</span>
                <span class="text-slate-400">{{ votes.total }} votos</span>
                <span :style="{ color: awayTeamColor }">{{ game.away }} {{ awayPct }}%</span>
              </div>
            </div>
            <p v-else class="mt-3 text-center text-xs text-slate-400">Sé el primero en votar</p>
          </template>
        </div>
      </div>

      <!-- Columna derecha: mapa + acciones -->
      <div class="flex flex-col gap-3">
        <div
          v-if="game.coords"
          class="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-d-border h-52 lg:flex-1"
        >
          <MapComponent :center="[game.coords[1], game.coords[0]]" :zoom="15" class="h-full w-full">
            <MapPopup :longitude="game.coords[1]" :latitude="game.coords[0]">
              <div
                class="bg-white dark:bg-d-card border border-slate-200 dark:border-d-border rounded-xl shadow-md px-3 py-2 space-y-0.5"
              >
                <p class="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {{ game.home }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ game.stadium }}</p>
              </div>
            </MapPopup>
          </MapComponent>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <a
            :href="calendarUrl"
            target="_blank"
            rel="noopener"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-d-border bg-white dark:bg-d-card hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <img
              :src="`${BASE_URL}icons/calendar.svg`"
              class="w-4 h-4 shrink-0 opacity-60 dark:brightness-0 dark:invert"
              alt=""
            />
            Agregar al calendario
          </a>
          <a
            v-if="game.website"
            :href="game.website"
            target="_blank"
            rel="noopener"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-d-border bg-white dark:bg-d-card hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
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
