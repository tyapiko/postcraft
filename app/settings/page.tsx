'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, Profile } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        toast.error('プロフィールの読み込みに失敗しました')
      } else if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('プロフィールを更新しました')

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
      }
    } catch (error: any) {
      toast.error('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>読み込み中...</div>
      </DashboardLayout>
    )
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'Free'
      case 'starter':
        return 'Starter'
      case 'pro':
        return 'Pro'
      default:
        return plan
    }
  }

  const getPlanLimit = (plan: string) => {
    switch (plan) {
      case 'free':
        return '月10回まで'
      case 'starter':
        return '月100回まで'
      case 'pro':
        return '無制限'
      default:
        return '-'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">設定</h1>
          <p className="text-muted-foreground">
            プロフィールとアカウント設定を管理します
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>表示名とアカウント情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="山田太郎"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>現在のプラン</CardTitle>
            <CardDescription>サブスクリプションとご利用状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {getPlanName(profile?.plan || 'free')}プラン
                </div>
                <div className="text-sm text-muted-foreground">
                  {getPlanLimit(profile?.plan || 'free')}
                </div>
              </div>
              <Badge variant={profile?.plan === 'free' ? 'secondary' : 'default'}>
                {getPlanName(profile?.plan || 'free')}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">今月の使用状況</div>
              <div className="text-2xl font-bold">
                {profile?.generation_count || 0}回生成
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notion連携</CardTitle>
            <CardDescription>Notionとの連携状態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">連携状態</div>
                {profile?.plan === 'free' ? (
                  <>
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">
                      Starterプラン以上で利用可能
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">利用可能</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}