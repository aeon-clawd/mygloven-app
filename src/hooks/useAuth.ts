import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import type { Profile, Role } from '../data/mockData'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) setProfile(data as Profile)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }
    return { error }
  }

  const signUp = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const setRole = async (rol: Role) => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ rol, estado: 'activo' })
      .eq('id', user.id)

    if (!error) {
      await fetchProfile(user.id)
    }
  }

  const createUser = async (email: string, password: string, nombre: string, rol: Role) => {
    if (!supabaseAdmin) return { error: { message: 'Admin client not configured' } }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    })

    if (error) return { error }

    // Update the auto-created profile with the correct role and estado
    if (data.user) {
      await supabaseAdmin.from('profiles').update({
        rol,
        estado: 'activo',
        nombre,
      }).eq('id', data.user.id)
    }

    return { error: null, user: data.user }
  }

  return { user, profile, loading, signIn, signUp, signOut, setRole, createUser }
}
