'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Loader2,
  Save,
  Database,
  Wand2,
  Send,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type GeneratedContent = {
  pattern: number
  text: string
}

interface Content {
  id: string
  user_id: string
  theme: string
  tone: string
  platform: string
  generated_text: string
  is_draft: boolean
  is_saved_to_notion: boolean
  saved_to_notion_at: string | null
  created_at: string
}

interface Stats {
  total: number
  twitter: number
  linkedin: number
  facebook: number
  instagram: number
  thisWeek: number
  thisMonth: number
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, available: true },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, available: true },
  { value: 'facebook', label: 'Facebook', icon: Facebook, available: true },
  { value: 'instagram', label: 'Instagram', icon: Instagram, available: false },
]

const TONES = [
  { value: 'casual', label: 'カジュアル', description: 'フレンドリーで親しみやすい' },
  { value: 'business', label: 'ビジネス', description: 'プロフェッショナルで丁寧' },
  { value: 'professional', label: '専門的', description: '技術的で詳細' },
]

export default function PostsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('generate')

  // 生成フォーム状態
  const [theme, setTheme] = useState('')
  const [tone, setTone] = useState('casual')
  const [platform, setPlatform] = useState('twitter')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GeneratedContent[]>([])

  // 履歴・管理状態
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    twitter: 0,
    linkedin: 0,
    facebook: 0,
    instagram: 0,
    thisWeek: 0,
    thisMonth: 0,
  })

  // 履歴データ取得
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'stats') {
      fetchContents()
    }
  }, [activeTab])

  // フィルタリング
  useEffect(() => {
    let filtered = [...contents]

    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.generated_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.theme.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (platformFilter) {
      filtered = filtered.filter(content => content.platform === platformFilter)
    }

    setFilteredContents(filtered)
  }, [searchQuery, platformFilter, contents])

  const fetchContents = async () => {
    if (!user) return

    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const contentsData = data || []
      setContents(contentsData)
      setFilteredContents(contentsData)

      // 統計計算
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      setStats({
        total: contentsData.length,
        twitter: contentsData.filter(c => c.platform === 'twitter').length,
        linkedin: contentsData.filter(c => c.platform === 'linkedin').length,
        facebook: contentsData.filter(c => c.platform === 'facebook').length,
        instagram: contentsData.filter(c => c.platform === 'instagram').length,
        thisWeek: contentsData.filter(c => new Date(c.created_at) >= weekAgo).length,
        thisMonth: contentsData.filter(c => new Date(c.created_at) >= monthAgo).length,
      })
    } catch (error) {
      console.error('Failed to fetch contents:', error)
      toast.error('履歴の取得に失敗しました')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('テーマを入力してください')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          tone,
          platform,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成に失敗しました')
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results)
        toast.success('生成が完了しました')
      } else {
        throw new Error('生成結果が取得できませんでした')
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || '生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('クリップボードにコピーしました')
  }

  const handleSaveDraft = async (text: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('contents').insert({
        user_id: user.id,
        theme,
        tone,
        platform,
        generated_text: text,
        is_draft: true,
      })

      if (error) throw error

      toast.success('下書きとして保存しました')
    } catch (error: any) {
      toast.error('保存に失敗しました')
    }
  }

  const handleSaveToNotion = async (text: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/save/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          tone,
          platform,
          text,
        }),
      })

      if (!response.ok) {
        throw new Error('Notionへの保存に失敗しました')
      }

      const { error } = await supabase.from('contents').insert({
        user_id: user.id,
        theme,
        tone,
        platform,
        generated_text: text,
        is_saved_to_notion: true,
        saved_to_notion_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success('Notionに保存しました')
    } catch (error: any) {
      toast.error(error.message || 'Notionへの保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setContents(contents.filter(c => c.id !== deleteId))
      toast.success('削除しました')
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('削除に失敗しました')
    } finally {
      setDeleteId(null)
    }
  }

  const getPlatformIcon = (platformValue: string) => {
    const p = PLATFORMS.find(pl => pl.value === platformValue)
    if (p) {
      const Icon = p.icon
      return <Icon size={16} />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">SNS投稿管理</h1>
          <p className="text-gray-600">AIがあなたのテーマに基づいてSNS投稿を生成します</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 size={16} />
            生成
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock size={16} />
            履歴
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 size={16} />
            統計
          </TabsTrigger>
        </TabsList>

        {/* 生成タブ */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 入力フォーム */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500" />
                  投稿を生成
                </CardTitle>
                <CardDescription>テーマとトーンを選択してAIに投稿を生成させましょう</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">テーマ <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="theme"
                    placeholder="例: 朝のルーティンについて、生産性を高める方法、最新のAI技術トレンド..."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>トーン</Label>
                  <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-1 gap-2">
                    {TONES.map((t) => (
                      <div
                        key={t.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          tone === t.value ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setTone(t.value)}
                      >
                        <RadioGroupItem value={t.value} id={t.value} />
                        <Label htmlFor={t.value} className="cursor-pointer flex-1">
                          <span className="font-medium">{t.label}</span>
                          <span className="text-sm text-gray-500 ml-2">- {t.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>プラットフォーム</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        disabled={!p.available}
                        onClick={() => setPlatform(p.value)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          platform === p.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : p.available
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <p.icon size={20} />
                        <span className="text-sm font-medium">{p.label}</span>
                        {!p.available && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            準備中
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !theme.trim()}
                  className="w-full bg-green-500 hover:bg-green-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      投稿を生成
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* テンプレート */}
            <Card>
              <CardHeader>
                <CardTitle>クイックテンプレート</CardTitle>
                <CardDescription>人気のテーマをワンクリックで設定</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { theme: '今日の学びと気づき', emoji: '💡' },
                    { theme: '仕事の生産性を上げるコツ', emoji: '📈' },
                    { theme: 'AIツールの活用法', emoji: '🤖' },
                    { theme: 'プログラミング初心者へのアドバイス', emoji: '💻' },
                    { theme: '朝のルーティン', emoji: '🌅' },
                    { theme: 'リモートワークのコツ', emoji: '🏠' },
                    { theme: 'おすすめの本・学習リソース', emoji: '📚' },
                    { theme: '週末のリフレッシュ方法', emoji: '🧘' },
                  ].map((template) => (
                    <Button
                      key={template.theme}
                      variant="outline"
                      className="justify-start h-auto py-3"
                      onClick={() => setTheme(template.theme)}
                    >
                      <span className="mr-2">{template.emoji}</span>
                      {template.theme}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 生成結果 */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                生成結果
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <Card key={result.pattern} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">パターン {result.pattern}</Badge>
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(platform)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-50 whitespace-pre-wrap text-sm text-black min-h-[150px]">
                        {result.text}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(result.text)}
                        >
                          <Copy className="mr-1 h-4 w-4" />
                          コピー
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveDraft(result.text)}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveToNotion(result.text)}
                        >
                          <Database className="mr-1 h-4 w-4" />
                          Notion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* 履歴タブ */}
        <TabsContent value="history" className="space-y-4">
          {/* フィルター */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="テーマまたは内容で検索..."
                className="pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="プラットフォーム" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center gap-2">
                      <p.icon size={14} />
                      {p.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchContents}>
              <RefreshCw size={16} className="mr-2" />
              更新
            </Button>
          </div>

          {/* 履歴一覧 */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="bg-white rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>テーマ</TableHead>
                    <TableHead>プラットフォーム</TableHead>
                    <TableHead>トーン</TableHead>
                    <TableHead>Notion</TableHead>
                    <TableHead>日時</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        履歴がありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContents.map((content) => (
                      <TableRow key={content.id} className="hover:bg-gray-50">
                        <TableCell className="max-w-xs">
                          <p className="font-medium truncate">{content.theme}</p>
                          <p className="text-sm text-gray-500 truncate">{content.generated_text}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(content.platform)}
                            <span className="text-sm">
                              {PLATFORMS.find(p => p.value === content.platform)?.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TONES.find(t => t.value === content.tone)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {content.is_saved_to_notion ? (
                            <Badge className="bg-green-100 text-green-800">保存済み</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {new Date(content.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{content.theme}</DialogTitle>
                                  <DialogDescription>
                                    {PLATFORMS.find(p => p.value === content.platform)?.label} • {TONES.find(t => t.value === content.tone)?.label}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                  {content.generated_text}
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCopy(content.generated_text)}
                                  >
                                    <Copy size={16} className="mr-2" />
                                    コピー
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(content.generated_text)}
                            >
                              <Copy size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(content.id)}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* 統計タブ */}
        <TabsContent value="stats" className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総生成数</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">すべての生成済み投稿</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今週の生成</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <p className="text-xs text-gray-500">過去7日間</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今月の生成</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500">過去30日間</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">1日平均</CardTitle>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.thisMonth > 0 ? (stats.thisMonth / 30).toFixed(1) : 0}
                </div>
                <p className="text-xs text-gray-500">投稿/日</p>
              </CardContent>
            </Card>
          </div>

          {/* プラットフォーム別 */}
          <Card>
            <CardHeader>
              <CardTitle>プラットフォーム別統計</CardTitle>
              <CardDescription>各プラットフォームの生成数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PLATFORMS.map((p) => {
                  const count = stats[p.value as keyof Stats] as number || 0
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={p.value} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-32">
                        <p.icon size={20} />
                        <span className="font-medium">{p.label}</span>
                      </div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。投稿は完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
