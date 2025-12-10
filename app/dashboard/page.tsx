'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, Content } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
  Star,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Rocket
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function DashboardPage() {
  const { user, profile, plan, remainingAIGenerations, isPro, isEnterprise, canAccess } = useAuth()
  const [recentContents, setRecentContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  const currentPlan = PLANS[plan]

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
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

  const getPlanIcon = () => {
    switch (plan) {
      case 'enterprise': return Crown
      case 'pro': return Zap
      default: return Star
    }
  }

  const getPlanColor = () => {
    switch (plan) {
      case 'enterprise': return 'from-purple-500 to-pink-500'
      case 'pro': return 'from-cyan-500 to-blue-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const PlanIcon = getPlanIcon()
  const aiLimit = currentPlan.limitations.aiGenerationLimit
  const usedGenerations = profile?.generation_count || 0
  const usagePercent = aiLimit === -1 ? 0 : Math.min(100, (usedGenerations / aiLimit) * 100)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6" role="status" aria-label="ダッシュボードを読み込み中">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="h-9 w-48 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30" />
                <CardHeader className="relative">
                  <div className="h-6 w-24 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="h-10 w-20 bg-muted rounded animate-pulse mb-3" />
                  <div className="h-2 w-full bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Banner Skeleton */}
          <Card className="relative overflow-hidden">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                <div>
                  <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
            </CardContent>
          </Card>

          {/* Recent Contents Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-36 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse mb-1" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-3" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                      <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <span className="sr-only">読み込み中...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
            <p className="text-muted-foreground">
              ようこそ、{profile?.display_name || 'ゲスト'}さん
            </p>
          </div>

          {/* Plan Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getPlanColor()} text-white`}>
            <PlanIcon className="w-4 h-4" />
            <span className="font-semibold">{currentPlan.name}プラン</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* AI Generation Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-purple-400" />
                AI生成
              </CardTitle>
              <CardDescription>今月の使用状況</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold">{usedGenerations}</span>
                <span className="text-muted-foreground">
                  / {aiLimit === -1 ? '∞' : aiLimit}回
                </span>
              </div>
              {aiLimit !== -1 && (
                <Progress value={usagePercent} className="h-2 mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {remainingAIGenerations === Infinity
                  ? '無制限'
                  : `残り ${remainingAIGenerations} 回`}
              </p>
            </CardContent>
          </Card>

          {/* Quick Action Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-600">
            <CardHeader>
              <CardTitle className="text-white">新しいコンテンツを生成</CardTitle>
              <CardDescription className="text-white/80">
                AIがあなたのSNS投稿を作成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-white text-purple-600 hover:bg-white/90">
                <Link href="/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成する
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Learning Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-cyan-400" />
                学習
              </CardTitle>
              <CardDescription>スキルアップしよう</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/learning">
                  コースを見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/blog">
                  ブログを読む
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Banner (for free users) */}
        {plan === 'free' && (
          <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">プロプランにアップグレード</h3>
                  <p className="text-sm text-muted-foreground">
                    全コースへのアクセス、LMS管理機能、AI生成100回/月など
                  </p>
                </div>
              </div>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                <Link href="/pricing">
                  プランを見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LMS Access Banner (for pro+ users) */}
        {isPro && (
          <Card className="relative overflow-hidden border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">LMS管理機能</h3>
                  <p className="text-sm text-muted-foreground">
                    自社コースの作成・受講者管理ができます
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10">
                <Link href="/admin">
                  管理画面へ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Contents */}
        <Card>
          <CardHeader>
            <CardTitle>最近の生成履歴</CardTitle>
            <CardDescription>最新3件を表示しています</CardDescription>
          </CardHeader>
          <CardContent>
            {recentContents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>まだコンテンツを生成していません</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/generate">最初のコンテンツを生成する</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContents.map((content) => (
                  <div key={content.id} className="border rounded-lg p-4 hover:border-purple-500/30 transition-colors">
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
                      <Badge variant="secondary">{content.tone}</Badge>
                      <Badge variant="secondary">{content.platform}</Badge>
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