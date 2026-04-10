import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export type RemoteGame = {
  id: string
  week: number
  home_team: string
  away_team: string
  starts_at: string
  home_score: number | null
  away_score: number | null
}

// Convierte starts_at (UTC) a fecha y hora en zona horaria de México (UTC-6 permanente desde 2023)
export function gameLocalTime(startsAt: string): { date: string; time: string } {
  const d = new Date(startsAt)
  const date = d.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) // YYYY-MM-DD
  const time = d.toLocaleTimeString('en-GB', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) // HH:MM
  return { date, time }
}

// Singleton: se fetcha una sola vez por sesión
const games = ref<RemoteGame[]>([])
const loading = ref(true)
let fetched = false

async function fetchGames() {
  if (fetched) return
  fetched = true
  const { data } = await supabase
    .from('games')
    .select('id, week, home_team, away_team, starts_at, home_score, away_score')
    .order('starts_at')
  games.value = data ?? []
  loading.value = false
}

export async function updateGameScore(
  id: string,
  home_score: number | null,
  away_score: number | null,
): Promise<void> {
  const { error } = await supabase.from('games').update({ home_score, away_score }).eq('id', id)
  if (error) throw error

  const game = games.value.find((g) => g.id === id)
  if (game) {
    game.home_score = home_score
    game.away_score = away_score
  }
}

export async function updateGameTime(id: string, mexicoDateTimeLocal: string): Promise<void> {
  // mexicoDateTimeLocal is "YYYY-MM-DDTHH:MM" in America/Mexico_City (UTC-6, no DST)
  const [datePart, timePart] = mexicoDateTimeLocal.split('T')
  const [y, m, d] = datePart.split('-').map(Number) as [number, number, number]
  const [h, min] = timePart.split(':').map(Number) as [number, number]
  const starts_at = new Date(Date.UTC(y, m - 1, d, h + 6, min)).toISOString()

  const { error } = await supabase.from('games').update({ starts_at }).eq('id', id)
  if (error) throw error

  const game = games.value.find((g) => g.id === id)
  if (game) game.starts_at = starts_at
}

export function useGames() {
  if (!fetched) fetchGames()
  return { games, loading }
}
