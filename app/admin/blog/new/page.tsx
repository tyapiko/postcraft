'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import ImageUploader from '@/components/admin/ImageUploader'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { STORAGE_BUCKETS } from '@/lib/storage'
import { generateSlug } from '@/lib/slugify'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface BlogPostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  category: string | null
  tags: string[]
  is_published: boolean
}

const categories = [
  'AI活用',
  'データ分析',
  '自動化',
  'Python',
  'Excel',
  'プログラミング',
  'ビジネス',
  '機械学習',
]

export default function BlogNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const [form, setForm] = useState<BlogPostForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: null,
    category: null,
    tags: [],
    is_published: false,
  })

  // 自動保存（30秒ごと）
  const autoSave = useCallback(async () => {
    if (!form.title || !hasChanges) return

    setAutoSaving(true)
    try {
      const postData = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        is_published: false,
        view_count: 0,
      }

      if (draftId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', draftId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single()

        if (error) throw error
        if (data) {
          setDraftId(data.id)
        }
      }

      setLastSaved(new Date())
      setHasChanges(false)
    } catch (error) {
      console.error('Auto save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [form, draftId, hasChanges])

  // 30秒ごとの自動保存タイマー設定
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (hasChanges && form.title) {
        autoSave()
      }
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [autoSave, hasChanges, form.title])

  // フォーム変更時にhasChangesをtrueに
  const updateForm = (updates: Partial<BlogPostForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title)
    updateForm({ title, slug: newSlug })
  }

  const handleAddTag = () => {
    if (tagInput && !form.tags.includes(tagInput)) {
      updateForm({ tags: [...form.tags, tagInput] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    updateForm({ tags: form.tags.filter(t => t !== tag) })
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title) {
      toast.error('タイトルは必須です')
      return
    }

    const slug = form.slug || generateSlug(form.title)
    if (!slug) {
      toast.error('スラッグを入力してください')
      return
    }

    setSaving(true)
    try {
      const postData = {
        ...form,
        slug,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        view_count: 0,
      }

      if (draftId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', draftId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData])

        if (error) throw error
      }

      toast.success(publish ? '記事を公開しました' : '下書きを保存しました')
      router.push('/admin/blog')
    } catch (error: unknown) {
      console.error('Failed to save post:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        toast.error('このスラッグは既に使用されています')
      } else {
        toast.error('保存に失敗しました')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">新規記事作成</h1>
            {lastSaved && (
              <p className="text-sm text-gray-500 mt-1">
                最終自動保存: {lastSaved.toLocaleTimeString('ja-JP')}
                {autoSaving && <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin" />}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* プレビューボタン */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Eye size={16} className="mr-2" />
                プレビュー
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>プレビュー</SheetTitle>
                <SheetDescription>記事のプレビューを確認できます</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {form.cover_image && (
                  <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                    <img
                      src={form.cover_image}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold mb-4">{form.title || 'タイトル未設定'}</h1>
                {form.category && (
                  <Badge className="mb-4 bg-green-100 text-green-800">{form.category}</Badge>
                )}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {form.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
                {form.excerpt && (
                  <p className="text-gray-600 mb-6 text-lg">{form.excerpt}</p>
                )}
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {form.content || '*本文がありません*'}
                  </ReactMarkdown>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            variant="outline"
          >
            下書き保存
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save size={16} className="mr-2" />
            公開
          </Button>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左: メインフォーム */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-6">
            <div>
              <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="記事のタイトルを入力"
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="slug">スラッグ <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => updateForm({ slug: e.target.value })}
                placeholder="article-slug"
                className="mt-2 font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /blog/{form.slug || 'slug'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                タイトルから自動生成されます（日本語はローマ字に変換）
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt">抜粋</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => updateForm({ excerpt: e.target.value })}
                placeholder="記事の簡単な説明（検索結果やSNSシェア時に表示されます）"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <Label className="mb-4 block">本文</Label>
            <MarkdownEditor
              value={form.content}
              onChange={(content) => updateForm({ content })}
              placeholder="Markdownで記事を書いてください..."
            />
          </div>
        </div>

        {/* 右: サイドバー設定 */}
        <div className="space-y-6">
          {/* カテゴリ・タグ */}
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-900">カテゴリ・タグ</h3>

            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={form.category || ''}
                onValueChange={(value) => updateForm({ category: value || null })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">タグ</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="タグを入力"
                />
                <Button onClick={handleAddTag} type="button" variant="secondary">
                  追加
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-green-200"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-green-500 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* カバー画像 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">カバー画像</h3>
            <ImageUploader
              value={form.cover_image || ''}
              onChange={(url) => updateForm({ cover_image: url })}
              onRemove={() => updateForm({ cover_image: null })}
              bucket={STORAGE_BUCKETS.BLOG_IMAGES}
            />
          </div>

          {/* 公開設定 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">公開設定</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">ステータス</span>
                <Badge variant={form.is_published ? 'default' : 'secondary'}>
                  {form.is_published ? '公開' : '下書き'}
                </Badge>
              </div>
              {hasChanges && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-700">未保存の変更があります</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
