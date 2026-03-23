import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { mockProfile, type Profile, type Role } from '../data/mockData'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    if (DEMO_MODE) {
      const stored = localStorage.getItem('mygloven_demo_profile')
      if (stored) {
        setProfile(JSON.parse(stored))
      }
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) setProfile(data)
  }, [])

  useEffect(() => {
    if (DEMO_MODE) {
      const stored = localStorage.getItem('mygloven_demo_user')
      if (stored) {
        const demoUser = JSON.parse(stored)
        setUser(demoUser)
        const storedProfile = localStorage.getItem('mygloven_demo_profile')
        if (storedProfile) setProfile(JSON.parse(storedProfile))
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      const demoUser = { id: 'demo-user', email } as User
      setUser(demoUser)
      localStorage.setItem('mygloven_demo_user', JSON.stringify(demoUser))
      const stored = localStorage.getItem('mygloven_demo_profile')
      if (stored) setProfile(JSON.parse(stored))
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (DEMO_MODE) {
      const demoUser = { id: 'demo-user', email } as User
      setUser(demoUser)
      localStorage.setItem('mygloven_demo_user', JSON.stringify(demoUser))
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    return { error }
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null)
      setProfile(null)
      localStorage.removeItem('mygloven_demo_user')
      localStorage.removeItem('mygloven_demo_profile')
      return
    }

    await supabase.auth.signOut()
    setProfile(null)
  }

  const setRole = async (role: Role, displayName: string) => {
    const newProfile: Profile = {
      ...mockProfile,
      role,
      display_name: displayName,
      user_id: user?.id ?? 'demo-user',
    }

    if (DEMO_MODE) {
      setProfile(newProfile)
      localStorage.setItem('mygloven_demo_profile', JSON.stringify(newProfile))
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      user_id: user?.id,
      role,
      display_name: displayName,
    })

    if (!error) {
      setProfile(newProfile)
    }
  }

  return { user, profile, loading, signIn, signUp, signOut, setRole }
}
