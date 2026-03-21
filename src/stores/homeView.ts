import { ref } from 'vue'
import { defineStore } from 'pinia'
import { lfa_games } from '@/consts/games'

export const useHomeViewStore = defineStore('homeView', () => {
  const view = ref<'weeks' | 'teams'>('weeks')
  const weekIndex = ref(0)
  const activeTeam = ref(lfa_games[0]![0]!)

  return { view, weekIndex, activeTeam }
})
