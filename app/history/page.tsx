'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, Content } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Copy, Database, Search, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function HistoryPage() {
  const { user } = useAuth()
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTone, setFilterTone] = useState('all')
  const [filterSaved, setFilterSaved] = useState('all')

  useEffect(() => {
    if (!user) return

    const loadContents = async () => {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('履歴の読み込みに失敗しました')
      } else if (data) {
        setContents(data)
        setFilteredContents(data)
      }

      setLoading(false)
    }

    loadContents()
  }, [user])

  useEffect(() => {
    let filtered = [...contents]

    if (searchQuery) {
      filtered = filtered.filter(
        (content) =>
          content.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.generated_text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterTone !== 'all') {
      filtered = filtered.filter((content) => content.tone === filterTone)
    }

    if (filterSaved === 'saved') {
      filtered = filtered.filter((content) => content.is_saved_to_notion)
    } else if (filterSaved === 'draft') {
      filtered = filtered.filter((content) => content.is_draft)
    }

    setFilteredContents(filtered)
  }, [searchQuery, filterTone, filterSaved, contents])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('クリップボードにコピーしました')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    const { error } = await supabase.from('contents').delete().eq('id', id)

    if (error) {
      toast.error('削除に失敗しました')
    } else {
      setContents(contents.filter((c) => c.id !== id))
      toast.success('削除しました')
    }
  }

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
          <h1 className="text-3xl font-bold mb-2">生成履歴</h1>
          <p className="text-muted-foreground">
            過去に生成したコンテンツを確認できます
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="テーマやテキストで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTone} onValueChange={setFilterTone}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="トーン" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="casual">カジュアル</SelectItem>
                  <SelectItem value="business">ビジネス</SelectItem>
                  <SelectItem value="professional">専門的</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSaved} onValueChange={setFilterSaved}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="保存状態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="saved">Notion保存済み</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredContents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchQuery || filterTone !== 'all' || filterSaved !== 'all'
                ? '条件に一致するコンテンツが見つかりませんでした'
                : 'まだコンテンツを生成していません'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContents.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{content.theme}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{content.tone}</Badge>
                          <Badge variant="secondary">{content.platform}</Badge>
                          {content.is_saved_to_notion && (
                            <Badge variant="default">
                              <Database className="mr-1 h-3 w-3" />
                              Notion保存済み
                            </Badge>
                          )}
                          {content.is_draft && (
                            <Badge variant="outline">下書き</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(content.created_at), 'PPP', { locale: ja })}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap">
                      {content.generated_text}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(content.generated_text)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        コピー
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(content.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </Button>
                    </div>
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