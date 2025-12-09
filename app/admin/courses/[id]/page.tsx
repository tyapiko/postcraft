'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Course, Lesson, ContentType } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Headphones,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />
}

const contentTypeLabels: Record<ContentType, string> = {
  video: '動画',
  text: 'テキスト',
  audio: '音声'
}

export default function CourseEditPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)

  // New lesson form
  const [showNewLesson, setShowNewLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content_type: 'video' as ContentType,
    content_url: '',
    content_text: '',
    duration_minutes: 0,
    is_preview: false
  })

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData()
    }
  }, [courseId, user])

  const fetchCourseData = async () => {
    try {
      const [courseResult, lessonsResult] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('sort_order')
      ])

      if (courseResult.error) throw courseResult.error
      if (lessonsResult.error) throw lessonsResult.error

      setCourse(courseResult.data)
      setLessons(lessonsResult.data || [])
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('コースの取得に失敗しました')
      router.push('/admin/courses')
    } finally {
      setLoading(false)
    }
  }

  const saveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          is_free: course.is_free,
          price: course.is_free ? 0 : course.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

      if (error) throw error

      toast.success('コースを保存しました')
    } catch (error) {
      console.error('Failed to save course:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    if (!course) return

    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published, updated_at: new Date().toISOString() })
        .eq('id', courseId)

      if (error) throw error

      setCourse(prev => prev ? { ...prev, is_published: !prev.is_published } : null)
      toast.success(course.is_published ? 'コースを非公開にしました' : 'コースを公開しました')
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      toast.error('更新に失敗しました')
    }
  }

  const addLesson = async () => {
    if (!newLesson.title.trim()) {
      toast.error('レッスンタイトルを入力してください')
      return
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: newLesson.title,
          description: newLesson.description || null,
          content_type: newLesson.content_type,
          content_url: newLesson.content_url || null,
          content_text: newLesson.content_text || null,
          duration_minutes: newLesson.duration_minutes || null,
          is_preview: newLesson.is_preview,
          sort_order: lessons.length
        })
        .select()
        .single()

      if (error) throw error

      setLessons(prev => [...prev, data])
      setNewLesson({
        title: '',
        description: '',
        content_type: 'video',
        content_url: '',
        content_text: '',
        duration_minutes: 0,
        is_preview: false
      })
      setShowNewLesson(false)
      toast.success('レッスンを追加しました')
    } catch (error) {
      console.error('Failed to add lesson:', error)
      toast.error('レッスンの追加に失敗しました')
    }
  }

  const updateLesson = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: lesson.title,
          description: lesson.description,
          content_type: lesson.content_type,
          content_url: lesson.content_url,
          content_text: lesson.content_text,
          duration_minutes: lesson.duration_minutes,
          is_preview: lesson.is_preview,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id)

      if (error) throw error

      toast.success('レッスンを更新しました')
    } catch (error) {
      console.error('Failed to update lesson:', error)
      toast.error('更新に失敗しました')
    }
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('このレッスンを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      setLessons(prev => prev.filter(l => l.id !== lessonId))
      toast.success('レッスンを削除しました')
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {course.is_published ? (
                <Badge className="bg-green-500">公開中</Badge>
              ) : (
                <Badge variant="secondary">下書き</Badge>
              )}
              {course.is_free && <Badge className="bg-cyan-500">無料</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={togglePublish}>
            {course.is_published ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                非公開にする
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                公開する
              </>
            )}
          </Button>
          <Button
            onClick={saveCourse}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-cyan-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            保存
          </Button>
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle>コース情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>タイトル</Label>
            <Input
              value={course.title}
              onChange={(e) => setCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
          </div>
          <div className="space-y-2">
            <Label>説明</Label>
            <Textarea
              value={course.description || ''}
              onChange={(e) => setCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>サムネイルURL</Label>
            <Input
              value={course.thumbnail_url || ''}
              onChange={(e) => setCourse(prev => prev ? { ...prev, thumbnail_url: e.target.value } : null)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>無料コース</Label>
              <p className="text-sm text-gray-500">無料で全員がアクセス可能</p>
            </div>
            <Switch
              checked={course.is_free}
              onCheckedChange={(checked) => setCourse(prev => prev ? { ...prev, is_free: checked } : null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>レッスン ({lessons.length})</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowNewLesson(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            レッスン追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Lesson Form */}
          {showNewLesson && (
            <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>タイトル *</Label>
                    <Input
                      value={newLesson.title}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="レッスンタイトル"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>コンテンツタイプ</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-200"
                      value={newLesson.content_type}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, content_type: e.target.value as ContentType }))}
                    >
                      <option value="video">動画</option>
                      <option value="text">テキスト</option>
                      <option value="audio">音声</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>説明</Label>
                  <Textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="レッスンの説明"
                    rows={2}
                  />
                </div>
                {newLesson.content_type !== 'text' && (
                  <div className="space-y-2">
                    <Label>{newLesson.content_type === 'video' ? '動画URL' : '音声URL'}</Label>
                    <Input
                      value={newLesson.content_url}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, content_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                )}
                {newLesson.content_type === 'text' && (
                  <div className="space-y-2">
                    <Label>テキストコンテンツ</Label>
                    <Textarea
                      value={newLesson.content_text}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, content_text: e.target.value }))}
                      placeholder="レッスンの内容..."
                      rows={6}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newLesson.is_preview}
                      onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, is_preview: checked }))}
                    />
                    <Label>プレビュー公開</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowNewLesson(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={addLesson}>
                      追加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lesson List */}
          {lessons.length === 0 && !showNewLesson ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>まだレッスンがありません</p>
              <p className="text-sm">「レッスン追加」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Lesson Header */}
                  <div
                    className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 w-8">{index + 1}</span>
                    <div className="p-1.5 rounded bg-gray-100">
                      {contentTypeIcons[lesson.content_type]}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{lesson.title}</span>
                      {lesson.is_preview && (
                        <Badge variant="outline" className="ml-2 text-xs">プレビュー</Badge>
                      )}
                    </div>
                    {expandedLesson === lesson.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Lesson Edit Form */}
                  {expandedLesson === lesson.id && (
                    <div className="p-4 bg-gray-50 border-t space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>タイトル</Label>
                          <Input
                            value={lesson.title}
                            onChange={(e) => setLessons(prev =>
                              prev.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l)
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>コンテンツタイプ</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-gray-200"
                            value={lesson.content_type}
                            onChange={(e) => setLessons(prev =>
                              prev.map(l => l.id === lesson.id ? { ...l, content_type: e.target.value as ContentType } : l)
                            )}
                          >
                            <option value="video">動画</option>
                            <option value="text">テキスト</option>
                            <option value="audio">音声</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>説明</Label>
                        <Textarea
                          value={lesson.description || ''}
                          onChange={(e) => setLessons(prev =>
                            prev.map(l => l.id === lesson.id ? { ...l, description: e.target.value } : l)
                          )}
                          rows={2}
                        />
                      </div>
                      {lesson.content_type !== 'text' && (
                        <div className="space-y-2">
                          <Label>{lesson.content_type === 'video' ? '動画URL' : '音声URL'}</Label>
                          <Input
                            value={lesson.content_url || ''}
                            onChange={(e) => setLessons(prev =>
                              prev.map(l => l.id === lesson.id ? { ...l, content_url: e.target.value } : l)
                            )}
                          />
                        </div>
                      )}
                      {lesson.content_type === 'text' && (
                        <div className="space-y-2">
                          <Label>テキストコンテンツ</Label>
                          <Textarea
                            value={lesson.content_text || ''}
                            onChange={(e) => setLessons(prev =>
                              prev.map(l => l.id === lesson.id ? { ...l, content_text: e.target.value } : l)
                            )}
                            rows={6}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.is_preview}
                            onCheckedChange={(checked) => setLessons(prev =>
                              prev.map(l => l.id === lesson.id ? { ...l, is_preview: checked } : l)
                            )}
                          />
                          <Label>プレビュー公開</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            削除
                          </Button>
                          <Button size="sm" onClick={() => updateLesson(lesson)}>
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
