import { createContext, useContext, useEffect, useState } from 'react'
import type{  ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type Profile = {
  id: string
  email: string
  full_name: string
  role: 'sme' | 'student'
  matric_number?: string
  is_verified: boolean
  avatar_url?: string
  bio?: string
  skills?: string[]
  rating?: number
  total_jobs?: number
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      console.log('Profile fetched:', data)
      setProfile(data as Profile)
    } else {
      console.log('Profile fetch error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    console.log('AuthProvider mounted, checking session...')
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session check result:', session ? 'Has session' : 'No session')
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    console.log('Signing up with:', { email, fullName, role })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    console.log('Sign up response:', { data, error })

    if (!error && data.user) {
      console.log('User created with ID:', data.user.id)
      
      // Create profile in profiles table
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        is_verified: role === 'student' ? false : true,
      })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
      } else {
        console.log('✅ Profile created successfully')
      }
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting login with:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })
    
    if (error) {
      console.error('Login error:', error.message)
    } else {
      console.log('Login successful:', data.user?.email)
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    localStorage.removeItem('pendingSignup')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') }
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : null)
    }
    
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}