<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import TeamLogo from '@/components/TeamLogo.vue'
import { lfa_games } from '@/consts/games'
import AppLayout from '@/layouts/AppLayout.vue'
import { useHomeViewStore } from '@/stores/homeView'
import { storeToRefs } from 'pinia'
import { useGames, gameLocalTime } from '@/composables/useGames'

const homeView = useHomeViewStore()
const { view, weekIndex, activeTeam } = storeToRefs(homeView)

const BASE_URL = import.meta.env.BASE_URL
const { games: remoteGames, loading: gamesLoading } = useGames()

// ─── Team metadata (estadio, coords, color) sigue viniendo de lfa_games ───────
const stadiums = new Map(lfa_games.map(([n, t]) => [n, t.stadium ?? '']))

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d: string) => {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, day).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
const sid = (n: string) => n.replace(/\s+/g, '-')
const gameId = (week: number, home: string, away: string) =>
  `s${week}-${sid(home).toLowerCase()}-vs-${sid(away).toLowerCase()}`

// ─── Build weeks data desde Supabase ──────────────────────────────────────────
type WeekGame = { home: string; away: string; date: string; time: string; stadium: string; home_score: number | null; away_score: number | null }
type WeekData = { games: WeekGame[]; byes: string[] }

const weeks = computed(() => {
  const weekMap = new Map<number, WeekData>()

  // Juegos desde Supabase
  for (const g of remoteGames.value) {
    if (!weekMap.has(g.week)) weekMap.set(g.week, { games: [], byes: [] })
    const { date, time } = gameLocalTime(g.starts_at)
    weekMap.get(g.week)!.games.push({
      home: g.home_team,
      away: g.away_team,
      date,
      time,
      stadium: stadiums.get(g.home_team) ?? '',
      home_score: g.home_score,
      away_score: g.away_score,
    })
  }

  // Byes siguen viniendo de lfa_games
  for (const [name, team] of lfa_games) {
    for (const g of team.games ?? []) {
      if (g.goodbye) {
        if (!weekMap.has(g.week)) weekMap.set(g.week, { games: [], byes: [] })
        weekMap.get(g.week)!.byes.push(name)
      }
    }
  }

  return [...weekMap.entries()].sort(([a], [b]) => a - b)
})

// ─── Local state ──────────────────────────────────────────────────────────────
const showCalendarMenu = ref(false)
const calendarStep = ref<'options' | 'google'>('options')

type ScheduleRow = {
  week: number
  rival: string
  date: string
  time: string
  isHome: boolean
  goodbye?: boolean
}

const teamSchedule = computed((): ScheduleRow[] => {
  const name = activeTeam.value
  const rows: ScheduleRow[] = []

  // Juegos desde Supabase
  for (const g of remoteGames.value) {
    const { date, time } = gameLocalTime(g.starts_at)
    if (g.home_team === name) {
      rows.push({ week: g.week, rival: g.away_team, date, time, isHome: true })
    } else if (g.away_team === name) {
      rows.push({ week: g.week, rival: g.home_team, date, time, isHome: false })
    }
  }

  // Byes desde lfa_games
  for (const g of lfa_games.find(([n]) => n === name)?.[1].games ?? []) {
    if (g.goodbye) rows.push({ week: g.week, rival: '', date: g.date, time: '', isHome: true, goodbye: true })
  }

  return rows.sort((a, b) => a.week - b.week)
})

function googleCalendarUrl(g: ScheduleRow): string {
  const name = activeTeam.value
  const teamData = lfa_games.find(([n]) => n === name)?.[1]
  const home = g.isHome ? name : g.rival
  const away = g.isHome ? g.rival : name
  const stadium = g.isHome
    ? (teamData?.stadium ?? '')
    : (lfa_games.find(([n]) => n === g.rival)?.[1].stadium ?? '')
  const [h, m] = g.time.split(':').map(Number) as [number, number]
  const [y, mo, d] = g.date.split('-').map(Number) as [number, number, number]
  const start = new Date(y, mo - 1, d, h, m)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${home} vs ${away} — LFA`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: stadium,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function openCalendarMenu() {
  calendarStep.value = 'options'
  showCalendarMenu.value = !showCalendarMenu.value
}
</script>

<template>
  <AppLayout title="Calendario LFA 2026" :theme-toggle="true">
    <main class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <!-- View toggle -->
      <div class="flex gap-1 bg-slate-200 dark:bg-d-card p-1 rounded-xl w-fit mx-auto shadow-inner">
        <button
          @click="view = 'weeks'"
          :class="[
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            view === 'weeks'
              ? 'bg-white dark:bg-d-raised shadow text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          ]"
        >
          Por Semana
        </button>
        <button
          @click="view = 'teams'"
          :class="[
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
            view === 'teams'
              ? 'bg-white dark:bg-d-raised shadow text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          ]"
        >
          Por Equipo
        </button>
      </div>

      <!-- Skeleton de carga -->
      <div v-if="gamesLoading" class="space-y-3 animate-pulse">
        <div v-for="n in 2" :key="n" class="bg-white dark:bg-d-card rounded-2xl p-4 border border-slate-100 dark:border-d-border">
          <div class="h-3 w-32 rounded-full bg-slate-200 dark:bg-d-raised mb-4" />
          <div class="flex items-center gap-2">
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-d-raised" />
              <div class="h-3 w-16 rounded-full bg-slate-200 dark:bg-d-raised" />
            </div>
            <div class="h-4 w-6 rounded bg-slate-200 dark:bg-d-raised" />
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-d-raised" />
              <div class="h-3 w-16 rounded-full bg-slate-200 dark:bg-d-raised" />
            </div>
          </div>
        </div>
      </div>

      <!-- ════ VISTA: POR SEMANA ════ -->
      <div v-show="view === 'weeks' && !gamesLoading">
        <!-- Week carousel -->
        <div class="flex items-center gap-4 justify-center">
          <button
            @click="weekIndex--"
            :disabled="weekIndex === 0"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-d-card border-2 border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-300 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div class="text-center min-w-36">
            <p class="text-xl font-black tracking-tight">Semana {{ weeks[weekIndex]?.[0] }}</p>
            <div class="flex gap-1.5 justify-center mt-2">
              <button
                v-for="([w], i) in weeks"
                :key="w"
                @click="weekIndex = i"
                :class="[
                  'h-1.5 rounded-full transition-all duration-300 hover:opacity-80',
                  i === weekIndex ? 'w-5 bg-amber-500' : 'w-1.5 bg-slate-300 dark:bg-d-raised',
                ]"
                :aria-label="`Semana ${w}`"
              />
            </div>
          </div>

          <button
            @click="weekIndex++"
            :disabled="weekIndex === weeks.length - 1"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-d-card border-2 border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-300 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <!-- Week content panels -->
        <template v-for="([w, data], i) in weeks" :key="w">
          <div v-show="i === weekIndex" class="space-y-4 mt-4">
            <!-- Game cards -->
            <div
              class="grid gap-3 sm:grid-cols-2 [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:w-1/2 [&>*:last-child:nth-child(odd)]:sm:mx-auto"
            >
              <RouterLink
                v-for="g in data.games"
                :key="gameId(w, g.home, g.away)"
                :to="`/game/${gameId(w, g.home, g.away)}`"
                class="block bg-white dark:bg-d-card rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
              >
                <p class="text-xs font-medium text-slate-400 dark:text-slate-500 mb-3">
                  {{ fmt(g.date) }} · {{ g.time }} hrs
                </p>
                <div class="flex items-center gap-2">
                  <!-- Home -->
                  <div class="flex flex-col items-center gap-1 flex-1">
                    <div class="w-14 h-14 overflow-hidden flex items-center justify-center">
                      <TeamLogo :name="g.home" :size="56" />
                    </div>
                    <span class="text-xs font-semibold text-center leading-tight">{{ g.home }}</span>
                    <span
                      class="flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium"
                    >
                      <img
                        :src="`${BASE_URL}icons/home.svg`"
                        class="w-3 h-3 brightness-0 saturate-0 opacity-70 dark:brightness-0 dark:invert"
                        alt=""
                      />
                      Local
                    </span>
                  </div>
                  <!-- Score / VS -->
                  <div class="flex flex-col items-center shrink-0">
                    <template v-if="g.home_score !== null && g.away_score !== null">
                      <div class="flex items-center gap-1.5">
                        <span
                          class="text-xl font-black"
                          :class="g.home_score >= g.away_score ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'"
                        >{{ g.home_score }}</span>
                        <span class="text-slate-300 dark:text-slate-600 font-bold text-sm">–</span>
                        <span
                          class="text-xl font-black"
                          :class="g.away_score >= g.home_score ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'"
                        >{{ g.away_score }}</span>
                      </div>
                      <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Final</span>
                    </template>
                    <span v-else class="text-slate-300 dark:text-slate-600 font-black text-sm">VS</span>
                  </div>
                  <!-- Away -->
                  <div class="flex flex-col items-center gap-1 flex-1">
                    <div class="w-14 h-14 overflow-hidden flex items-center justify-center">
                      <TeamLogo :name="g.away" :size="56" />
                    </div>
                    <span class="text-xs font-semibold text-center leading-tight">{{ g.away }}</span>
                    <span
                      class="flex items-center gap-1 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium"
                    >
                      <img
                        :src="`${BASE_URL}icons/away.svg`"
                        class="w-3 h-3 brightness-0 saturate-0 opacity-70 dark:brightness-0 dark:invert"
                        alt=""
                      />
                      Visita
                    </span>
                  </div>
                </div>
                <div
                  v-if="g.stadium"
                  class="mt-3 pt-3 border-t border-slate-100 dark:border-d-border text-xs text-slate-400 flex items-start gap-1.5"
                >
                  <img
                    :src="`${BASE_URL}icons/pin_map.svg`"
                    class="w-3.5 h-3.5 shrink-0 mt-px opacity-60 dark:brightness-0 dark:invert"
                    alt=""
                  />
                  <span>{{ g.stadium }}</span>
                </div>
              </RouterLink>
            </div>

            <!-- BYEs -->
            <div v-if="data.byes.length > 0">
              <hr class="border-slate-200 dark:border-d-border" />
              <div class="flex flex-wrap gap-3 justify-center pt-3">
                <div v-for="b in data.byes" :key="b" class="flex flex-col items-center gap-1">
                  <div class="w-10 h-10 overflow-hidden flex items-center justify-center">
                    <TeamLogo :name="b" :size="40" />
                  </div>
                  <span class="text-xs text-slate-400 dark:text-slate-500">{{ b }} (BYE)</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ════ VISTA: POR EQUIPO ════ -->
      <div v-show="view === 'teams' && !gamesLoading" class="space-y-4">
        <!-- Team selector -->
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="[name] in lfa_games"
            :key="name"
            @click="activeTeam = name"
            :class="[
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all',
              activeTeam === name
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                : 'border-transparent hover:border-amber-400',
            ]"
          >
            <div class="w-12 h-12 overflow-hidden flex items-center justify-center">
              <TeamLogo :name="name" :size="48" />
            </div>
            <span
              class="text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight text-center max-w-14"
            >
              {{ name }}
            </span>
          </button>
        </div>

        <!-- Team panels -->
        <template v-for="[teamName, team] in lfa_games" :key="teamName">
          <div v-show="teamName === activeTeam">
            <!-- Team header -->
            <div
              class="flex items-center gap-3 mb-3 p-3 bg-white dark:bg-d-card rounded-xl shadow-sm border border-slate-100 dark:border-d-border"
            >
              <div class="w-12 h-12 overflow-hidden flex items-center justify-center shrink-0">
                <TeamLogo :name="teamName" :size="48" />
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="font-bold text-slate-900 dark:text-white">{{ teamName }}</h2>
                <p v-if="team.stadium" class="text-xs text-slate-400 flex items-center gap-1">
                  <span>📍</span>{{ team.stadium }}
                </p>
              </div>
              <div class="relative shrink-0">
                <button
                  @click="openCalendarMenu"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-d-border bg-slate-50 dark:bg-d-raised hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Guardar calendario
                </button>

                <!-- Backdrop -->
                <div
                  v-if="showCalendarMenu"
                  class="fixed inset-0 z-10"
                  @click="showCalendarMenu = false"
                />

                <!-- Dropdown -->
                <div
                  v-if="showCalendarMenu"
                  class="absolute right-0 top-full mt-1.5 z-20 bg-white dark:bg-d-card border border-slate-200 dark:border-d-border rounded-xl shadow-lg overflow-hidden min-w-56"
                >
                  <!-- Step: opciones -->
                  <template v-if="calendarStep === 'options'">
                    <button
                      @click="calendarStep = 'google'"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48">
                        <path
                          fill="#4285F4"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#34A853"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#EA4335"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                      Google Calendar
                      <svg
                        class="ml-auto opacity-40"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </template>

                  <!-- Step: Google Calendar — juegos individuales -->
                  <template v-else>
                    <div
                      class="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-d-border"
                    >
                      <button
                        @click="calendarStep = 'options'"
                        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400"
                        >Agregar a Google Calendar</span
                      >
                    </div>
                    <a
                      v-for="g in teamSchedule.filter((g) => !g.goodbye)"
                      :key="g.week"
                      :href="googleCalendarUrl(g)"
                      target="_blank"
                      rel="noopener"
                      @click="showCalendarMenu = false"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors"
                    >
                      <span
                        class="text-amber-500 font-black text-base w-5 text-center leading-none"
                        >{{ g.week }}</span
                      >
                      <span class="flex-1 min-w-0">
                        <span class="font-medium">{{ g.isHome ? activeTeam : g.rival }}</span>
                        <span class="text-slate-400"> vs </span>
                        <span class="font-medium">{{ g.isHome ? g.rival : activeTeam }}</span>
                      </span>
                      <svg
                        class="shrink-0 opacity-40"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </template>
                </div>
              </div>
            </div>

            <!-- Game rows -->
            <div class="flex flex-col gap-2">
              <component
                :is="g.goodbye ? 'div' : RouterLink"
                v-for="g in teamSchedule"
                :key="g.week"
                :to="g.goodbye ? undefined : `/game/${gameId(g.week, g.isHome ? activeTeam : g.rival, g.isHome ? g.rival : activeTeam)}`"
                class="bg-white dark:bg-d-card rounded-xl px-4 py-3 shadow-sm border border-slate-100 dark:border-d-border flex items-center gap-3 transition-colors"
                :class="{ 'hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer': !g.goodbye }"
              >
                <div class="flex flex-col items-center w-9 shrink-0">
                  <span class="text-[10px] text-slate-400 uppercase leading-none">Sem</span>
                  <span class="text-2xl font-black text-amber-500 leading-tight">{{ g.week }}</span>
                </div>

                <p v-if="g.goodbye" class="flex-1 text-sm text-slate-400 italic">
                  Semana de descanso · BYE
                </p>
                <template v-else>
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      class="w-10 h-10 overflow-hidden flex items-center justify-center shrink-0"
                    >
                      <TeamLogo :name="g.rival" :size="40" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-sm truncate">{{ g.rival }}</p>
                      <p class="text-xs text-slate-400">{{ fmt(g.date) }} · {{ g.time }} hrs</p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'shrink-0 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1',
                      g.isHome
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                    ]"
                  >
                    <img
                      :src="`${BASE_URL}icons/${g.isHome ? 'home' : 'away'}.svg`"
                      class="w-3.5 h-3.5 brightness-0 saturate-0 opacity-70 dark:brightness-0 dark:invert"
                      alt=""
                    />
                    {{ g.isHome ? 'Local' : 'Visita' }}
                  </span>
                </template>
              </component>
            </div>
          </div>
        </template>
      </div>
    </main>
  </AppLayout>
</template>
