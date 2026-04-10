import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

const ADMIN_USER_ID = '07d157cd-571e-47e8-94db-9a6552cd57a0'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAdmin = computed(() => user.value?.id === ADMIN_USER_ID)

  async function init() {
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, isAdmin, init, signInWithGoogle, signOut }
})
