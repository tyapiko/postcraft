'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Crown, Rocket, ArrowLeft } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isPro, plan, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      // 認証ローディング中は待機
      if (authLoading) return

      if (!user) {
        router.push('/login')
        return
      }

      // Pro以上のプランか、admin_usersテーブルに登録されているかチェック
      if (isPro) {
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // 従来のadmin_usersテーブルでもチェック（管理者向け）
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (data && !error) {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Admin check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, isPro, authLoading, router])

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">認証確認中...</p>
        </div>
      </div>
    )
  }

  // アクセス権がない場合はアップグレード案内を表示
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] px-4">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-purple-500/20 inline-block mb-6">
            <Crown className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            LMS管理機能はProプラン以上で利用可能です
          </h1>
          <p className="text-gray-400 mb-8">
            プロプランにアップグレードすると、自社コースの作成、受講者管理、進捗トラッキングなどの機能が利用できます。
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
              <Link href="/pricing">
                <Rocket className="w-4 h-4 mr-2" />
                プランを確認する
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
