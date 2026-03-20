<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import TeamLogo from '@/components/TeamLogo.vue'
import { lfa_games } from '@/consts/games'
import AppLayout from '@/layouts/AppLayout.vue'

const BASE_URL = import.meta.env.BASE_URL

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

// ─── Build weeks data ─────────────────────────────────────────────────────────
type WeekGame = { home: string; away: string; date: string; time: string; stadium: string }
type WeekData = { games: WeekGame[]; byes: string[] }

const stadiums = new Map(lfa_games.map(([n, t]) => [n, t.stadium ?? '']))

const weeks = computed(() => {
  const weekMap = new Map<number, WeekData>()
  for (const [name, team] of lfa_games) {
    for (const g of team.games ?? []) {
      if (!weekMap.has(g.week)) weekMap.set(g.week, { games: [], byes: [] })
      const wd = weekMap.get(g.week)!
      if (g.goodbye) wd.byes.push(name)
      else
        wd.games.push({
          home: name,
          away: g.rival!,
          date: g.date,
          time: g.time!,
          stadium: stadiums.get(name) ?? '',
        })
    }
  }
  return [...weekMap.entries()].sort(([a], [b]) => a - b)
})

// ─── State ────────────────────────────────────────────────────────────────────
const view = ref<'weeks' | 'teams'>('weeks')
const weekIndex = ref(0)
const activeTeam = ref(lfa_games[0]![0]!)
const showCalendarMenu = ref(false)
const calendarStep = ref<'options' | 'google'>('options')

type ScheduleRow = { week: number; rival: string; date: string; time: string; isHome: boolean; goodbye?: boolean }

const teamSchedule = computed((): ScheduleRow[] => {
  const name = activeTeam.value
  const rows: ScheduleRow[] = []

  for (const [teamName, team] of lfa_games) {
    for (const g of team.games ?? []) {
      if (teamName === name) {
        if (g.goodbye)
          rows.push({ week: g.week, rival: '', date: g.date, time: '', isHome: true, goodbye: true })
        else
          rows.push({ week: g.week, rival: g.rival!, date: g.date, time: g.time!, isHome: true })
      } else if (!g.goodbye && g.rival === name) {
        rows.push({ week: g.week, rival: teamName, date: g.date, time: g.time!, isHome: false })
      }
    }
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

function downloadTeamCalendar(target: 'apple' | 'outlook' | 'samsung' | 'ics') {
  showCalendarMenu.value = false
  const name = activeTeam.value
  const teamData = lfa_games.find(([n]) => n === name)?.[1]
  const games = teamSchedule.value.filter(g => !g.goodbye)

  const fmtDt = (date: string, time: string) => {
    const [y, m, d] = date.split('-')
    const [h, mi] = time.split(':')
    return `${y}${m}${d}T${h}${mi}00`
  }
  const addHours = (date: string, time: string, hrs: number) => {
    const dt = new Date(`${date}T${time}:00`)
    dt.setHours(dt.getHours() + hrs)
    return dt.toISOString().replace(/[-:]/g, '').split('.')[0]
  }

  const events = games.map(g => {
    const home = g.isHome ? name : g.rival
    const away = g.isHome ? g.rival : name
    const stadium = g.isHome ? (teamData?.stadium ?? '') : (lfa_games.find(([n]) => n === g.rival)?.[1].stadium ?? '')
    return [
      'BEGIN:VEVENT',
      `DTSTART:${fmtDt(g.date, g.time)}`,
      `DTEND:${addHours(g.date, g.time, 3)}`,
      `SUMMARY:${home} vs ${away} — LFA Semana ${g.week}`,
      `LOCATION:${stadium}`,
      'END:VEVENT',
    ].join('\r\n')
  }).join('\r\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendario LFA 2026//ES',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-lfa-2026.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function openCalendarMenu() {
  calendarStep.value = 'options'
  showCalendarMenu.value = !showCalendarMenu.value
}

function addAllToGoogle() {
  downloadTeamCalendar('ics')
  window.open('https://calendar.google.com/calendar/r/settings/export', '_blank')
}
</script>

<template>
  <AppLayout title="Calendario LFA 2026" :theme-toggle="true">
    <main class="max-w-3xl mx-auto px-4 py-6 space-y-6">
    <!-- View toggle -->
    <div
      class="flex gap-1 bg-slate-200 dark:bg-d-card p-1 rounded-xl w-fit mx-auto shadow-inner"
    >
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

    <!-- ════ VISTA: POR SEMANA ════ -->
    <div v-show="view === 'weeks'">
      <!-- Week carousel -->
      <div class="flex items-center gap-4 justify-center">
        <button
          @click="weekIndex--"
          :disabled="weekIndex === 0"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-d-card border-2 border-slate-200 dark:border-d-border hover:border-amber-400 dark:hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-300 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
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
                <!-- VS -->
                <span class="text-slate-300 dark:text-slate-600 font-black text-sm shrink-0">VS</span>
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
    <div v-show="view === 'teams'" class="space-y-4">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Guardar calendario
              </button>

              <!-- Backdrop -->
              <div v-if="showCalendarMenu" class="fixed inset-0 z-10" @click="showCalendarMenu = false" />

              <!-- Dropdown -->
              <div
                v-if="showCalendarMenu"
                class="absolute right-0 top-full mt-1.5 z-20 bg-white dark:bg-d-card border border-slate-200 dark:border-d-border rounded-xl shadow-lg overflow-hidden min-w-56"
              >
                <!-- Step: opciones -->
                <template v-if="calendarStep === 'options'">
                  <button @click="calendarStep = 'google'"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
                    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Google Calendar
                    <svg class="ml-auto opacity-40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  <button @click="downloadTeamCalendar('apple')"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    Apple Calendar
                  </button>
                  <button @click="downloadTeamCalendar('outlook')"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0078D4"/><path fill="white" d="M7 6h5.5C14.4 6 16 7.6 16 9.5S14.4 13 12.5 13H9v5H7V6zm2 5h3.5c.8 0 1.5-.7 1.5-1.5S13.3 8 12.5 8H9v3z"/></svg>
                    Outlook
                  </button>
                  <button @click="downloadTeamCalendar('samsung')"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Samsung Calendar
                  </button>
                  <div class="border-t border-slate-100 dark:border-d-border" />
                  <button @click="downloadTeamCalendar('ics')"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Descargar .ics
                  </button>
                </template>

                <!-- Step: Google Calendar — juegos individuales -->
                <template v-else>
                  <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-d-border">
                    <button @click="calendarStep = 'options'" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Agregar a Google Calendar</span>
                  </div>
                  <a
                    v-for="g in teamSchedule.filter(g => !g.goodbye)"
                    :key="g.week"
                    :href="googleCalendarUrl(g)"
                    target="_blank"
                    rel="noopener"
                    @click="showCalendarMenu = false"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors"
                  >
                    <span class="text-amber-500 font-black text-base w-5 text-center leading-none">{{ g.week }}</span>
                    <span class="flex-1 min-w-0">
                      <span class="font-medium">{{ g.isHome ? activeTeam : g.rival }}</span>
                      <span class="text-slate-400"> vs </span>
                      <span class="font-medium">{{ g.isHome ? g.rival : activeTeam }}</span>
                    </span>
                    <svg class="shrink-0 opacity-40" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                  <div class="border-t border-slate-100 dark:border-d-border" />
                  <button
                    @click="addAllToGoogle"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-d-raised transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Agregar todos (.ics)
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Game rows -->
          <div class="flex flex-col gap-2">
            <div
              v-for="g in teamSchedule"
              :key="g.week"
              class="bg-white dark:bg-d-card rounded-xl px-4 py-3 shadow-sm border border-slate-100 dark:border-d-border flex items-center gap-3"
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
                  <div class="w-10 h-10 overflow-hidden flex items-center justify-center shrink-0">
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
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
  </AppLayout>
</template>
