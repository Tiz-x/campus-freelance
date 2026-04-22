import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type{ User } from '@supabase/supabase-js'

type ProfileType = {
  id: string
  email: string
  full_name: string
  role: 'sme' | 'student'
}

type AuthContextType = {
  user: User | null
  profile: ProfileType | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        console.log('Checking auth...')
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (session?.user) {
          console.log('Session found for:', session.user.email)
          setUser(session.user)
          
          // Try to get profile (but don't wait forever)
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()
            
            if (profileData) {
              setProfile(profileData as ProfileType)
            }
          } catch (profileErr) {
            console.log('Profile fetch error:', profileErr)
          }
        } else {
          console.log('No session found')
        }
      } catch (err) {
        console.error('Auth error:', err)
      } finally {
        if (isMounted) {
          console.log('Setting loading to false')
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (data?.user) {
      setUser(data.user)
      // Try to get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
      
      if (profileData) {
        setProfile(profileData as ProfileType)
      }
    }
    
    return { error }
  }

  const signOut = async () => {
    localStorage.removeItem('pendingSignup')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
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