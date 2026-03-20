import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from './auth'

type VoteSummary = {
  home: number
  away: number
  total: number
  userVote: 'home' | 'away' | null
}

export const useVotesStore = defineStore('votes', () => {
  const cache = ref<Record<string, VoteSummary>>({})
  const loading = ref<Record<string, boolean>>({})

  async function fetchVotes(gameId: string) {
    loading.value[gameId] = true

    const auth = useAuthStore()

    const [{ data: counts }, { data: userVoteData }] = await Promise.all([
      supabase.from('votes').select('team').eq('game_id', gameId),
      auth.user
        ? supabase
            .from('votes')
            .select('team')
            .eq('game_id', gameId)
            .eq('user_id', auth.user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const home = counts?.filter((v) => v.team === 'home').length ?? 0
    const away = counts?.filter((v) => v.team === 'away').length ?? 0

    cache.value[gameId] = {
      home,
      away,
      total: home + away,
      userVote: (userVoteData?.team as 'home' | 'away') ?? null,
    }

    loading.value[gameId] = false
  }

  async function castVote(gameId: string, team: 'home' | 'away') {
    const auth = useAuthStore()
    if (!auth.user) return

    const current = cache.value[gameId]?.userVote

    const entry = cache.value[gameId]
    if (!entry) return

    if (current === team) {
      // Toggle off — remove vote
      await supabase.from('votes').delete().eq('game_id', gameId).eq('user_id', auth.user.id)

      entry.userVote = null
      entry[team]--
      entry.total--
    } else {
      // Insert or update vote
      await supabase
        .from('votes')
        .upsert({ game_id: gameId, user_id: auth.user.id, team }, { onConflict: 'game_id,user_id' })

      if (current) {
        entry[current]--
      } else {
        entry.total++
      }
      entry[team]++
      entry.userVote = team
    }
  }

  function getVotes(gameId: string): VoteSummary {
    return cache.value[gameId] ?? { home: 0, away: 0, total: 0, userVote: null }
  }

  return { cache, loading, fetchVotes, castVote, getVotes }
})
