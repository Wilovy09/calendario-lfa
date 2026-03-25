import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

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

  async function signInWithFacebook() {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, init, signInWithGoogle, signInWithFacebook, signOut }
})
