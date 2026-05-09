import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export type Standing = {
  team: string
  position: number
  pj: number
  wins: number
  draws: number
  losses: number
  pts_for: number
  pts_against: number
  win_pct: number
  form: string[]
  classification: string | null
}

const standings = ref<Standing[]>([])
const loading = ref(true)
let fetched = false

async function fetchStandings() {
  if (fetched) return
  fetched = true
  const { data } = await supabase
    .from('standings')
    .select('*')
    .order('position')
  standings.value = data ?? []
  loading.value = false
}

export function useStandings() {
  if (!fetched) fetchStandings()
  return { standings, loading }
}
