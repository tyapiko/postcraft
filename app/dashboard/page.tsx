'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, Profile, Content } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentContents, setRecentContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData)
      }

      const { data: contentsData } = await supabase
        .from('contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (contentsData) {
        setRecentContents(contentsData)
      }

      setLoading(false)
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <DashboardLayout>
        <div>読み込み中...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
          <p className="text-muted-foreground">
            ようこそ、{profile?.display_name || 'ゲスト'}さん
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                今月の生成数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile?.generation_count || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">
                プラン: {profile?.plan === 'free' ? 'Free' : profile?.plan === 'starter' ? 'Starter' : 'Pro'}
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg">
            <CardHeader>
              <CardTitle className="text-white">新しいコンテンツを生成</CardTitle>
              <CardDescription className="text-white/80">
                AIがあなたのSNS投稿を作成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-white text-blue-600 hover:bg-white/90">
                <Link href="/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成する
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>最近の生成履歴</CardTitle>
            <CardDescription>最新3件を表示しています</CardDescription>
          </CardHeader>
          <CardContent>
            {recentContents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                まだコンテンツを生成していません
              </div>
            ) : (
              <div className="space-y-4">
                {recentContents.map((content) => (
                  <div key={content.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{content.theme}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(content.created_at), 'PP', { locale: ja })}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.generated_text}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-secondary">
                        {content.tone}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-secondary">
                        {content.platform}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentContents.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/history">すべての履歴を見る</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}