'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { toast } from 'sonner'

interface LessonForm {
  title: string
  content: string
  video_url: string
  duration_minutes: number
  is_preview: boolean
}

export default function NewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string

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
    if (courseId) {
      fetchCourseName()
    }
  }, [courseId])

  const fetchCourseName = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

      if (error) throw error
      if (data) setCourseName(data.title)
    } catch (error) {
      console.error('Failed to fetch course:', error)
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
      // 最大のsort_orderを取得
      const { data: maxOrderData } = await supabase
        .from('lessons')
        .select('sort_order')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const newSortOrder = (maxOrderData?.sort_order || 0) + 1

      const lessonData = {
        course_id: courseId,
        title: form.title,
        content: form.content || null,
        video_url: form.video_url || null,
        duration_minutes: form.duration_minutes,
        is_preview: form.is_preview,
        sort_order: newSortOrder,
      }

      const { error } = await supabase
        .from('lessons')
        .insert([lessonData])

      if (error) throw error

      toast.success('レッスンを作成しました')
      router.push(`/admin/learning/${courseId}`)
    } catch (error) {
      console.error('Failed to save lesson:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const videoInfo = form.video_url ? extractVideoId(form.video_url) : null

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
            <h1 className="text-3xl font-bold text-black">新規レッスン作成</h1>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600"
        >
          <Save size={16} className="mr-2" />
          保存
        </Button>
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
