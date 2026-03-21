import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export type RemoteGame = {
  id: string
  week: number
  home_team: string
  away_team: string
  starts_at: string
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
    .select('id, week, home_team, away_team, starts_at')
    .order('starts_at')
  games.value = data ?? []
  loading.value = false
}

export function useGames() {
  if (!fetched) fetchGames()
  return { games, loading }
}
