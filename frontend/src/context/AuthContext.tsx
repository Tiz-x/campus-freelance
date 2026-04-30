import { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type ProfileType = {
  id: string
  email: string
  full_name: string
  role: 'sme' | 'student'
  avatar_url: string | null
  is_verified: boolean
  phone: string | null
  address: string | null
  bio: string | null
  total_jobs: number
  rating: number
  skills: string[]
  matric_number: string | null
  portfolio_url: string | null
}

type AuthContextType = {
  user: User | null
  profile: ProfileType | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef<boolean>(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (profileData && isMountedRef.current) {
        setProfile(profileData as ProfileType)
      }
      return profileData
    } catch (err) {
      console.log('Profile fetch error:', err)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMountedRef.current) return
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Auth error:', err)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMountedRef.current) return
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (data?.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }
    
    return { error }
  }

  const signOut = async () => {
    localStorage.removeItem('pendingSignup')
    sessionStorage.removeItem('lastRoute')
    sessionStorage.clear()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
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