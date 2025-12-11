'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Loader2, Copy, Database, Save } from 'lucide-react'

type GeneratedContent = {
  pattern: number
  text: string
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter/X', available: true },
  { value: 'facebook', label: 'Facebook', available: false },
  { value: 'instagram', label: 'Instagram', available: false },
  { value: 'linkedin', label: 'LinkedIn', available: false },
]

export default function GeneratePage() {
  const { user } = useAuth()
  const [theme, setTheme] = useState('')
  const [tone, setTone] = useState('casual')
  const [platform, setPlatform] = useState('twitter')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GeneratedContent[]>([])

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('テーマを入力してください')
      return
    }

    setLoading(true)
    setResults([])

    try {
      // 認証トークンを取得
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('ログインが必要です')
        return
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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
      // 認証トークンを取得
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('ログインが必要です')
        return
      }

      const response = await fetch('/api/save/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">コンテンツ生成</h1>
          <p className="text-muted-foreground">
            AIがあなたのテーマに基づいてSNS投稿を生成します
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>入力フォーム</CardTitle>
            <CardDescription>投稿のテーマとトーンを選択してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">テーマ</Label>
              <Textarea
                id="theme"
                placeholder="例: 朝のルーティンについて、生産性を高める方法、最新のAI技術トレンド..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>トーン</Label>
              <RadioGroup value={tone} onValueChange={setTone}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual" className="cursor-pointer">
                    カジュアル - フレンドリーで親しみやすい
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="cursor-pointer">
                    ビジネス - プロフェッショナルで丁寧
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional" className="cursor-pointer">
                    専門的 - 技術的で詳細
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>プラットフォーム</Label>
              <RadioGroup value={platform} onValueChange={setPlatform}>
                {PLATFORMS.map((p) => (
                  <div key={p.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={p.value}
                      id={p.value}
                      disabled={!p.available}
                    />
                    <Label
                      htmlFor={p.value}
                      className={`cursor-pointer ${!p.available ? 'text-muted-foreground' : ''}`}
                    >
                      {p.label}
                      {!p.available && ' (近日対応予定)'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成する'
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">生成結果</h2>
            {results.map((result) => (
              <Card key={result.pattern}>
                <CardHeader>
                  <CardTitle className="text-lg">パターン {result.pattern}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap">
                    {result.text}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(result.text)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      コピー
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveDraft(result.text)}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      下書き保存
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveToNotion(result.text)}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Notionに保存
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}