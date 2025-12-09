'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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

interface Lesson {
  id: string
  title: string
  sort_order: number
  is_preview: boolean
  duration_minutes: number
}

const difficulties = ['初級', '中級', '上級']
const categories = ['Python', 'データ分析', 'AI', '自動化', 'Excel', 'ビジネス']

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)

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

  useEffect(() => {
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      if (courseData) {
        setForm({
          title: courseData.title || '',
          slug: courseData.slug || '',
          description: courseData.description || '',
          thumbnail: courseData.thumbnail,
          difficulty: courseData.difficulty,
          category: courseData.category,
          duration_minutes: courseData.duration_minutes || 0,
          is_published: courseData.is_published || false,
          is_free: courseData.is_free ?? true,
          price: courseData.price,
        })
      }

      // レッスン一覧を取得
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, sort_order, is_preview, duration_minutes')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true })

      if (lessonsError) throw lessonsError
      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('コースの取得に失敗しました')
      router.push('/admin/learning')
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (updates: Partial<CourseForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title) {
      toast.error('タイトルは必須です')
      return
    }

    if (!form.slug) {
      toast.error('スラッグは必須です')
      return
    }

    if (!form.is_free && (!form.price || form.price <= 0)) {
      toast.error('有料コースの場合は価格を設定してください')
      return
    }

    setSaving(true)
    try {
      const courseData = {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        thumbnail: form.thumbnail,
        difficulty: form.difficulty,
        category: form.category,
        duration_minutes: form.duration_minutes,
        is_published: publish,
        is_free: form.is_free,
        price: form.is_free ? null : form.price,
      }

      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId)

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

  const handleDeleteCourse = async () => {
    try {
      // まずレッスンを削除
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId)

      if (lessonsError) throw lessonsError

      // コースを削除
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (courseError) throw courseError

      toast.success('コースを削除しました')
      router.push('/admin/learning')
    } catch (error) {
      console.error('Failed to delete course:', error)
      toast.error('削除に失敗しました')
    }
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', deleteLessonId)

      if (error) throw error

      setLessons(lessons.filter(l => l.id !== deleteLessonId))
      toast.success('レッスンを削除しました')
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      toast.error('削除に失敗しました')
    } finally {
      setDeleteLessonId(null)
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
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/learning">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">コース編集</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 size={16} className="mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。コース「{form.title}」と関連するすべてのレッスンが削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCourse}
                  className="bg-red-500 hover:bg-red-600"
                >
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                onChange={(e) => updateForm({ title: e.target.value })}
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

          {/* レッスン管理 */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">レッスン管理</h3>
              <Button size="sm" asChild>
                <Link href={`/admin/learning/${courseId}/lessons/new`}>
                  <Plus size={14} className="mr-1" />
                  レッスン追加
                </Link>
              </Button>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-gray-400 cursor-move" />
                      <span className="text-gray-500 text-sm w-8">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.is_preview && (
                            <Badge variant="outline" className="text-xs">プレビュー可</Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {lesson.duration_minutes}分
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/learning/${courseId}/lessons/${lesson.id}`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteLessonId(lesson.id)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>レッスンがまだありません</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href={`/admin/learning/${courseId}/lessons/new`}>
                    <Plus size={14} className="mr-1" />
                    最初のレッスンを追加
                  </Link>
                </Button>
              </div>
            )}
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

          {/* 公開設定 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">公開設定</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">ステータス</span>
              <Badge
                className={form.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              >
                {form.is_published ? '公開中' : '下書き'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* レッスン削除確認ダイアログ */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={() => setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>レッスンを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。レッスンは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
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
