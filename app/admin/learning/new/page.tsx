'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import ImageUploader from '@/components/admin/ImageUploader'
import { STORAGE_BUCKETS } from '@/lib/storage'
import { generateSlug } from '@/lib/slugify'
import { toast } from 'sonner'

interface CourseForm {
  title: string
  slug: string
  description: string
  thumbnail: string | null
  difficulty: string | null
  category: string | null
  duration_minutes: number
  is_published: boolean
  is_free: boolean
  price: number | null
}

const difficulties = ['初級', '中級', '上級']
const categories = ['Python', 'データ分析', 'AI', '自動化', 'Excel', 'ビジネス']

export default function NewCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<CourseForm>({
    title: '',
    slug: '',
    description: '',
    thumbnail: null,
    difficulty: null,
    category: null,
    duration_minutes: 0,
    is_published: false,
    is_free: true,
    price: null,
  })

  const updateForm = (updates: Partial<CourseForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title)
    updateForm({ title, slug: newSlug })
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

    if (!form.is_free && (!form.price || form.price <= 0)) {
      toast.error('有料コースの場合は価格を設定してください')
      return
    }

    setSaving(true)
    try {
      // 最大のsort_orderを取得
      const { data: maxOrderData } = await supabase
        .from('courses')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const newSortOrder = (maxOrderData?.sort_order || 0) + 1

      const courseData = {
        title: form.title,
        slug,
        description: form.description || null,
        thumbnail: form.thumbnail,
        difficulty: form.difficulty,
        category: form.category,
        duration_minutes: form.duration_minutes,
        is_published: publish,
        is_free: form.is_free,
        price: form.is_free ? null : form.price,
        sort_order: newSortOrder,
      }

      const { error } = await supabase
        .from('courses')
        .insert([courseData])

      if (error) throw error

      toast.success(publish ? 'コースを公開しました' : '下書きを保存しました')
      router.push('/admin/learning')
    } catch (error: unknown) {
      console.error('Failed to save course:', error)
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
            <Link href="/admin/learning">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">新規コース作成</h1>
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
                placeholder="コースのタイトルを入力"
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="slug">スラッグ <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => updateForm({ slug: e.target.value })}
                placeholder="course-slug"
                className="mt-2 font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /learning/{form.slug || 'slug'}
              </p>
            </div>

            <div>
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="コースの詳細な説明を入力してください"
                className="mt-2"
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* 右: サイドバー設定 */}
        <div className="space-y-6">
          {/* サムネイル画像 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">サムネイル画像</h3>
            <ImageUploader
              value={form.thumbnail || ''}
              onChange={(url) => updateForm({ thumbnail: url })}
              onRemove={() => updateForm({ thumbnail: null })}
              bucket={STORAGE_BUCKETS.COURSE_THUMBNAILS}
            />
          </div>

          {/* コース設定 */}
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-900">コース設定</h3>

            <div>
              <Label htmlFor="difficulty">難易度</Label>
              <Select
                value={form.difficulty || ''}
                onValueChange={(value) => updateForm({ difficulty: value || null })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="難易度を選択" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">所要時間（分）</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={form.duration_minutes}
                onChange={(e) => updateForm({ duration_minutes: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
          </div>

          {/* 価格設定 */}
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-900">価格設定</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_free">無料コース</Label>
              <Switch
                id="is_free"
                checked={form.is_free}
                onCheckedChange={(checked) => updateForm({ is_free: checked, price: checked ? null : form.price })}
              />
            </div>

            {!form.is_free && (
              <div>
                <Label htmlFor="price">価格（円）</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price || ''}
                  onChange={(e) => updateForm({ price: parseInt(e.target.value) || null })}
                  placeholder="例: 9800"
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
