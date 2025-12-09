'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from './supabase'
import { PlanType, PLANS, canAccessFeature, getRemainingAIGenerations } from './plans'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  plan: PlanType
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  // 権限チェック用のヘルパー関数
  canAccess: (feature: keyof typeof PLANS['free']['limitations']) => boolean
  remainingAIGenerations: number
  isPro: boolean
  isEnterprise: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  plan: 'free',
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  canAccess: () => false,
  remainingAIGenerations: 0,
  isPro: false,
  isEnterprise: false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // プロファイルを取得する関数
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Failed to fetch profile:', error)
        return null
      }

      return data as Profile | null
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      return null
    }
  }, [])

  // プロファイルをリフレッシュする関数（外部から呼び出し可能）
  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // 現在のプランを取得
  const plan: PlanType = (profile?.plan as PlanType) || 'free'

  // 権限チェック関数
  const canAccess = useCallback((feature: keyof typeof PLANS['free']['limitations']) => {
    return canAccessFeature(plan, feature)
  }, [plan])

  // AI生成の残り回数
  const remainingAIGenerations = getRemainingAIGenerations(
    plan,
    profile?.generation_count || 0
  )

  // プランのショートカット
  const isPro = plan === 'pro' || plan === 'enterprise'
  const isEnterprise = plan === 'enterprise'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      plan,
      loading,
      signOut,
      refreshProfile,
      canAccess,
      remainingAIGenerations,
      isPro,
      isEnterprise,
    }}>
      {children}
    </AuthContext.Provider>
  )
}