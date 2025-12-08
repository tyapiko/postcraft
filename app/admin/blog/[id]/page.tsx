'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import ImageUploader from '@/components/admin/ImageUploader'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { STORAGE_BUCKETS } from '@/lib/storage'
import { toast } from 'sonner'

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

const categories = ['AI活用', 'データ分析', '自動化', 'Python']

export default function BlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
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

  useEffect(() => {
    if (!isNew && id) {
      fetchPost()
    }
  }, [id, isNew])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          cover_image: data.cover_image,
          category: data.category,
          tags: data.tags || [],
          is_published: data.is_published || false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      toast.error('記事の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title })
    if (isNew && !form.slug) {
      setForm({ ...form, title, slug: generateSlug(title) })
    }
  }

  const handleAddTag = () => {
    if (tagInput && !form.tags.includes(tagInput)) {
      setForm({ ...form, tags: [...form.tags, tagInput] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title || !form.slug) {
      toast.error('タイトルとスラッグは必須です')
      return
    }

    setSaving(true)
    try {
      const postData = {
        ...form,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        view_count: 0,
      }

      if (isNew) {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData])

        if (error) throw error
        toast.success('記事を作成しました')
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)

        if (error) throw error
        toast.success('記事を更新しました')
      }

      router.push('/admin/blog')
    } catch (error) {
      console.error('Failed to save post:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">
              {isNew ? '新規記事作成' : '記事編集'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            {form.is_published ? '更新して公開' : '公開'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-6">
            <div>
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="記事のタイトル"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="slug">スラッグ *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="article-slug"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /blog/{form.slug || 'slug'}
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt">抜粋</Label>
              <Input
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="記事の簡単な説明"
                className="mt-2"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <Label className="mb-4 block">本文 *</Label>
            <MarkdownEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={form.category || ''}
                onValueChange={(value) => setForm({ ...form, category: value })}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="タグを入力"
                />
                <Button onClick={handleAddTag} type="button">追加</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <Label className="mb-4 block">カバー画像</Label>
            <ImageUploader
              value={form.cover_image || ''}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              onRemove={() => setForm({ ...form, cover_image: null })}
              bucket={STORAGE_BUCKETS.BLOG_IMAGES}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
