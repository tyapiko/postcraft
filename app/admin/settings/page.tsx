'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Key,
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  RefreshCw
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface UserProfile {
  display_name: string
  email: string
  bio: string
}

interface NotificationSettings {
  email_notifications: boolean
  new_comments: boolean
  weekly_digest: boolean
}

interface APIKey {
  id: string
  name: string
  key_preview: string
  created_at: string
  last_used: string | null
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // プロファイル設定
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    email: user?.email || '',
    bio: ''
  })

  // 通知設定
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    new_comments: true,
    weekly_digest: false
  })

  // サイト設定
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'Citizen DS',
    site_description: '市民データサイエンティスト育成プラットフォーム',
    default_language: 'ja',
    analytics_enabled: true
  })

  // APIキー（モック）
  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key_preview: 'sk-...abc123',
      created_at: '2024-01-15',
      last_used: '2024-03-01'
    },
    {
      id: '2',
      name: 'Development Key',
      key_preview: 'sk-...xyz789',
      created_at: '2024-02-01',
      last_used: null
    }
  ])

  useEffect(() => {
    setMounted(true)
    if (user?.email) {
      setProfile(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // 実際のアプリではSupabaseにプロファイルを保存
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('プロファイルを保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('通知設定を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSiteSettings = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('サイト設定を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const generateNewApiKey = () => {
    toast.info('新しいAPIキーを生成しました（デモ）')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">設定</h1>
          <p className="text-gray-600 dark:text-gray-400">アプリケーションとアカウントの設定を管理</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <User size={16} />
            プロファイル
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Palette size={16} />
            外観
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Bell size={16} />
            通知
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Globe size={16} />
            サイト
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Key size={16} />
            API
          </TabsTrigger>
        </TabsList>

        {/* プロファイル設定 */}
        <TabsContent value="profile">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">プロファイル設定</CardTitle>
              <CardDescription className="dark:text-gray-400">
                公開プロファイル情報を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="dark:text-gray-200">表示名</Label>
                  <Input
                    id="display_name"
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="表示名を入力"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-200">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    メールアドレスは変更できません
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="dark:text-gray-200">自己紹介</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="自己紹介を入力..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {saving ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外観設定 */}
        <TabsContent value="appearance">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">外観設定</CardTitle>
              <CardDescription className="dark:text-gray-400">
                アプリケーションの見た目をカスタマイズします
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="dark:text-gray-200">テーマ</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'ライト', icon: '☀️' },
                    { value: 'dark', label: 'ダーク', icon: '🌙' },
                    { value: 'system', label: 'システム', icon: '💻' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === option.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className={`font-medium ${theme === option.value ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {option.label}
                      </div>
                      {theme === option.value && (
                        <Check size={16} className="mx-auto mt-2 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  現在のテーマ: {resolvedTheme === 'dark' ? 'ダークモード' : 'ライトモード'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">通知設定</CardTitle>
              <CardDescription className="dark:text-gray-400">
                通知の受信方法を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">メール通知</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">重要な更新をメールで受け取る</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">新規コメント</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">記事にコメントがついた時に通知</p>
                  </div>
                  <Switch
                    checked={notifications.new_comments}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, new_comments: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">週次ダイジェスト</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">週に一度、統計サマリーを受け取る</p>
                  </div>
                  <Switch
                    checked={notifications.weekly_digest}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, weekly_digest: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {saving ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* サイト設定 */}
        <TabsContent value="site">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">サイト設定</CardTitle>
              <CardDescription className="dark:text-gray-400">
                サイト全体の設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name" className="dark:text-gray-200">サイト名</Label>
                  <Input
                    id="site_name"
                    value={siteSettings.site_name}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_language" className="dark:text-gray-200">デフォルト言語</Label>
                  <Select
                    value={siteSettings.default_language}
                    onValueChange={(value) => setSiteSettings(prev => ({ ...prev, default_language: value }))}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description" className="dark:text-gray-200">サイト説明</Label>
                <textarea
                  id="site_description"
                  value={siteSettings.site_description}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">アナリティクス</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">訪問者データを収集する</p>
                </div>
                <Switch
                  checked={siteSettings.analytics_enabled}
                  onCheckedChange={(checked) =>
                    setSiteSettings(prev => ({ ...prev, analytics_enabled: checked }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSiteSettings}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {saving ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API設定 */}
        <TabsContent value="api">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">APIキー管理</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    外部連携用のAPIキーを管理します
                  </CardDescription>
                </div>
                <Button onClick={generateNewApiKey} className="bg-green-500 hover:bg-green-600">
                  <Key size={16} className="mr-2" />
                  新規キーを生成
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">{key.name}</p>
                        {key.last_used ? (
                          <Badge variant="outline" className="text-green-600 border-green-300 dark:text-green-400 dark:border-green-800">
                            使用中
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-600">
                            未使用
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono">
                          {showApiKey ? 'sk-xxxxxxxxxxxxx' : key.key_preview}
                        </span>
                        <span>作成日: {key.created_at}</span>
                        {key.last_used && <span>最終使用: {key.last_used}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">セキュリティに関する注意</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      APIキーは安全な場所に保管してください。公開リポジトリにコミットしたり、
                      クライアントサイドのコードに含めないでください。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
