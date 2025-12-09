'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { toast } from 'sonner'

interface LessonForm {
  title: string
  content: string
  video_url: string
  duration_minutes: number
  is_preview: boolean
}

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  const lessonId = params?.lessonId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseName, setCourseName] = useState('')

  const [form, setForm] = useState<LessonForm>({
    title: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
    is_preview: false,
  })

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData()
    }
  }, [courseId, lessonId])

  const fetchData = async () => {
    try {
      // コース名を取得
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      if (courseData) setCourseName(courseData.title)

      // レッスンデータを取得
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError

      if (lessonData) {
        setForm({
          title: lessonData.title || '',
          content: lessonData.content || '',
          video_url: lessonData.video_url || '',
          duration_minutes: lessonData.duration_minutes || 0,
          is_preview: lessonData.is_preview || false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('データの取得に失敗しました')
      router.push(`/admin/learning/${courseId}`)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (updates: Partial<LessonForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const extractVideoId = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (youtubeMatch) return { type: 'youtube', id: youtubeMatch[1] }

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/)
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] }

    return null
  }

  const handleSave = async () => {
    if (!form.title) {
      toast.error('タイトルは必須です')
      return
    }

    setSaving(true)
    try {
      const lessonData = {
        title: form.title,
        content: form.content || null,
        video_url: form.video_url || null,
        duration_minutes: form.duration_minutes,
        is_preview: form.is_preview,
      }

      const { error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', lessonId)

      if (error) throw error

      toast.success('レッスンを更新しました')
      router.push(`/admin/learning/${courseId}`)
    } catch (error) {
      console.error('Failed to save lesson:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      toast.success('レッスンを削除しました')
      router.push(`/admin/learning/${courseId}`)
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      toast.error('削除に失敗しました')
    }
  }

  const videoInfo = form.video_url ? extractVideoId(form.video_url) : null

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
            <Link href={`/admin/learning/${courseId}`}>
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <p className="text-sm text-gray-500">{courseName}</p>
            <h1 className="text-3xl font-bold text-black">レッスン編集</h1>
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
                <AlertDialogTitle>レッスンを削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。レッスン「{form.title}」は完全に削除されます。
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

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save size={16} className="mr-2" />
            保存
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
                placeholder="レッスンのタイトルを入力"
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="video_url">動画URL</Label>
              <Input
                id="video_url"
                value={form.video_url}
                onChange={(e) => updateForm({ video_url: e.target.value })}
                placeholder="YouTube または Vimeo の URL を入力"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                YouTube・Vimeo の動画URLを入力してください
              </p>
              {videoInfo && (
                <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {videoInfo.type === 'youtube' && (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoInfo.id}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  )}
                  {videoInfo.type === 'vimeo' && (
                    <iframe
                      src={`https://player.vimeo.com/video/${videoInfo.id}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <Label className="mb-4 block">本文</Label>
            <MarkdownEditor
              value={form.content}
              onChange={(content) => updateForm({ content })}
              placeholder="レッスンの内容をMarkdownで記述してください..."
            />
          </div>
        </div>

        {/* 右: サイドバー設定 */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-900">レッスン設定</h3>

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

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="is_preview">プレビュー可能</Label>
                <p className="text-sm text-gray-500">未購入でも閲覧可能にする</p>
              </div>
              <Switch
                id="is_preview"
                checked={form.is_preview}
                onCheckedChange={(checked) => updateForm({ is_preview: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
