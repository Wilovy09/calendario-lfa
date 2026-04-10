<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TeamLogo from '@/components/TeamLogo.vue'
import { useGames, gameLocalTime, updateGameTime, updateGameScore } from '@/composables/useGames'

const { games, loading } = useGames()

// ─── Datetime edit state ──────────────────────────────────────────────────────
const timeEdits = ref<Record<string, string>>({})
const timeSaving = ref<Record<string, boolean>>({})
const timeSaved = ref<Record<string, boolean>>({})
const timeErrors = ref<Record<string, string>>({})

function localValue(startsAt: string): string {
  const { date, time } = gameLocalTime(startsAt)
  return `${date}T${time}`
}

function localDate(id: string, startsAt: string): string {
  return (timeEdits.value[id] ?? localValue(startsAt)).split('T')[0] ?? ''
}

function localTime(id: string, startsAt: string): string {
  return (timeEdits.value[id] ?? localValue(startsAt)).split('T')[1] ?? '00:00'
}

function onDatePartInput(id: string, startsAt: string, datePart: string) {
  onTimeInput(id, `${datePart}T${localTime(id, startsAt)}`)
}

function onTimePartInput(id: string, startsAt: string, timePart: string) {
  onTimeInput(id, `${localDate(id, startsAt)}T${timePart}`)
}

function isTimeDirty(id: string, startsAt: string): boolean {
  return timeEdits.value[id] !== undefined && timeEdits.value[id] !== localValue(startsAt)
}

function onTimeInput(id: string, value: string) {
  timeEdits.value[id] = value
  timeSaved.value[id] = false
  timeErrors.value[id] = ''
}

async function saveTime(id: string) {
  const value = timeEdits.value[id]
  if (!value) return
  timeSaving.value[id] = true
  timeErrors.value[id] = ''
  try {
    await updateGameTime(id, value)
    timeSaved.value[id] = true
    delete timeEdits.value[id]
  } catch {
    timeErrors.value[id] = 'Error al guardar'
  } finally {
    timeSaving.value[id] = false
  }
}

// ─── Score edit state ─────────────────────────────────────────────────────────
type ScoreEdit = { home: string; away: string }
const scoreEdits = ref<Record<string, ScoreEdit>>({})
const scoreSaving = ref<Record<string, boolean>>({})
const scoreSaved = ref<Record<string, boolean>>({})
const scoreErrors = ref<Record<string, string>>({})

function initScoreEdit(id: string, homeScore: number | null, awayScore: number | null) {
  if (!scoreEdits.value[id]) {
    scoreEdits.value[id] = {
      home: homeScore !== null ? String(homeScore) : '',
      away: awayScore !== null ? String(awayScore) : '',
    }
  }
}

function isScoreDirty(id: string, homeScore: number | null, awayScore: number | null): boolean {
  const e = scoreEdits.value[id]
  if (!e) return false
  const origHome = homeScore !== null ? String(homeScore) : ''
  const origAway = awayScore !== null ? String(awayScore) : ''
  return e.home !== origHome || e.away !== origAway
}

function onScoreInput(id: string, side: 'home' | 'away', value: string) {
  const g = games.value.find((g) => g.id === id)
  initScoreEdit(id, g?.home_score ?? null, g?.away_score ?? null)
  scoreEdits.value[id]![side] = value
  scoreSaved.value[id] = false
}

async function saveScore(id: string) {
  const e = scoreEdits.value[id]
  if (!e) return
  scoreSaving.value[id] = true
  scoreErrors.value[id] = ''
  try {
    const home = e.home === '' ? null : parseInt(e.home, 10)
    const away = e.away === '' ? null : parseInt(e.away, 10)
    await updateGameScore(id, home, away)
    scoreSaved.value[id] = true
  } catch {
    scoreErrors.value[id] = 'Error al guardar'
  } finally {
    scoreSaving.value[id] = false
  }
}

const sortedGames = computed(() =>
  [...games.value].sort((a, b) => a.week - b.week || a.starts_at.localeCompare(b.starts_at)),
)
</script>

<template>
  <AppLayout title="Admin" :back="true">
    <main class="max-w-2xl mx-auto px-4 py-6 space-y-4">

      <div v-if="loading" class="space-y-3 animate-pulse">
        <div v-for="n in 5" :key="n" class="h-40 rounded-2xl bg-slate-200 dark:bg-d-card" />
      </div>

      <div v-else class="space-y-4">
        <div v-for="g in sortedGames" :key="g.id"
          class="bg-white dark:bg-d-card rounded-2xl border border-slate-100 dark:border-d-border shadow-sm overflow-hidden">
          <!-- Header: semana + equipos -->
          <div
            class="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-d-raised border-b border-slate-100 dark:border-d-border">
            <span class="text-amber-500 font-black text-2xl w-8 text-center shrink-0 leading-none">
              {{ g.week }}
            </span>
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <div class="w-9 h-9 shrink-0 flex items-center justify-center overflow-hidden">
                <TeamLogo :name="g.home_team" :size="36" />
              </div>
              <span class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ g.home_team }}</span>
              <span class="text-slate-300 dark:text-slate-600 font-bold text-xs shrink-0">VS</span>
              <div class="w-9 h-9 shrink-0 flex items-center justify-center overflow-hidden">
                <TeamLogo :name="g.away_team" :size="36" />
              </div>
              <span class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ g.away_team }}</span>
            </div>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-d-border">

            <!-- Fecha y hora -->
            <div class="px-4 py-3 space-y-2">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fecha y hora</p>
              <div class="flex gap-2">
                <input type="date" :value="localDate(g.id, g.starts_at)"
                  @input="onDatePartInput(g.id, g.starts_at, ($event.target as HTMLInputElement).value)"
                  class="flex-1 rounded-xl border border-slate-200 dark:border-d-border bg-slate-50 dark:bg-d-raised text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors" />
                <input type="time" :value="localTime(g.id, g.starts_at)"
                  @input="onTimePartInput(g.id, g.starts_at, ($event.target as HTMLInputElement).value)"
                  class="w-28 rounded-xl border border-slate-200 dark:border-d-border bg-slate-50 dark:bg-d-raised text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors" />
              </div>
              <div v-if="isTimeDirty(g.id, g.starts_at) || timeSaved[g.id] || timeErrors[g.id]"
                class="flex items-center gap-2">
                <button v-if="isTimeDirty(g.id, g.starts_at)" :disabled="timeSaving[g.id]" @click="saveTime(g.id)"
                  class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                  {{ timeSaving[g.id] ? 'Guardando...' : 'Guardar fecha y hora' }}
                </button>
                <span v-else-if="timeSaved[g.id]" class="text-sm text-green-500 font-semibold">✓ Guardado</span>
                <span v-if="timeErrors[g.id]" class="text-sm text-red-500">{{ timeErrors[g.id] }}</span>
              </div>
            </div>

            <!-- Marcador -->
            <div class="px-4 py-3 space-y-3">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Resultado</p>
              <div class="flex items-center justify-center gap-4">
                <!-- Local -->
                <div class="flex flex-col items-center gap-1.5 flex-1">
                  <div class="w-10 h-10 flex items-center justify-center overflow-hidden">
                    <TeamLogo :name="g.home_team" :size="40" />
                  </div>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">{{
                    g.home_team }}</span>
                  <input type="number" min="0"
                    :value="scoreEdits[g.id]?.home ?? (g.home_score !== null ? g.home_score : '')"
                    @focus="initScoreEdit(g.id, g.home_score, g.away_score)"
                    @input="onScoreInput(g.id, 'home', ($event.target as HTMLInputElement).value)" placeholder="—"
                    class="w-full text-2xl font-black text-center rounded-xl border border-slate-200 dark:border-d-border bg-slate-50 dark:bg-d-raised text-slate-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                </div>

                <span class="text-2xl font-black text-slate-300 dark:text-slate-600 pb-1 shrink-0">–</span>

                <!-- Visita -->
                <div class="flex flex-col items-center gap-1.5 flex-1">
                  <div class="w-10 h-10 flex items-center justify-center overflow-hidden">
                    <TeamLogo :name="g.away_team" :size="40" />
                  </div>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">{{
                    g.away_team }}</span>
                  <input type="number" min="0"
                    :value="scoreEdits[g.id]?.away ?? (g.away_score !== null ? g.away_score : '')"
                    @focus="initScoreEdit(g.id, g.home_score, g.away_score)"
                    @input="onScoreInput(g.id, 'away', ($event.target as HTMLInputElement).value)" placeholder="—"
                    class="w-full text-2xl font-black text-center rounded-xl border border-slate-200 dark:border-d-border bg-slate-50 dark:bg-d-raised text-slate-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                </div>
              </div>

              <div v-if="isScoreDirty(g.id, g.home_score, g.away_score) || scoreSaved[g.id] || scoreErrors[g.id]">
                <button v-if="isScoreDirty(g.id, g.home_score, g.away_score)" :disabled="scoreSaving[g.id]"
                  @click="saveScore(g.id)"
                  class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                  {{ scoreSaving[g.id] ? 'Guardando...' : 'Guardar resultado' }}
                </button>
                <p v-else-if="scoreSaved[g.id]" class="text-center text-sm text-green-500 font-semibold">✓ Resultado
                  guardado</p>
                <p v-if="scoreErrors[g.id]" class="text-center text-sm text-red-500">{{ scoreErrors[g.id] }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
