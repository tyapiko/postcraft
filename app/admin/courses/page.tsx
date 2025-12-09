'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Course } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Loader2,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'

type CourseWithStats = Course & {
  lesson_count: number
  enrollment_count: number
}

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count),
          enrollments:enrollments(count)
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const coursesWithStats = data?.map(course => ({
        ...course,
        lesson_count: course.lessons?.[0]?.count || 0,
        enrollment_count: course.enrollments?.[0]?.count || 0
      })) || []

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('コースの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (course: CourseWithStats) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published, updated_at: new Date().toISOString() })
        .eq('id', course.id)

      if (error) throw error

      setCourses(prev =>
        prev.map(c =>
          c.id === course.id ? { ...c, is_published: !c.is_published } : c
        )
      )
      toast.success(course.is_published ? 'コースを非公開にしました' : 'コースを公開しました')
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      toast.error('更新に失敗しました')
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('このコースを削除しますか？関連するレッスンも全て削除されます。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      setCourses(prev => prev.filter(c => c.id !== courseId))
      toast.success('コースを削除しました')
    } catch (error) {
      console.error('Failed to delete course:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">コース管理</h1>
          <p className="text-gray-600 mt-1">E-ラーニングコースの作成と管理</p>
        </div>
        <Button
          onClick={() => router.push('/admin/courses/new')}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規コース作成
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">総コース数</CardTitle>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">公開中</CardTitle>
            <Eye className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {courses.filter(c => c.is_published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">総受講者数</CardTitle>
            <Users className="w-5 h-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {courses.reduce((sum, c) => sum + c.enrollment_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            コースがありません
          </h3>
          <p className="text-gray-500 mb-6">
            最初のコースを作成して、受講者に価値あるコンテンツを提供しましょう
          </p>
          <Button
            onClick={() => router.push('/admin/courses/new')}
            className="bg-gradient-to-r from-purple-600 to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            コースを作成
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-purple-500 to-cyan-500 relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {course.is_published ? (
                    <Badge className="bg-green-500">公開中</Badge>
                  ) : (
                    <Badge variant="secondary">下書き</Badge>
                  )}
                  {course.is_free && (
                    <Badge className="bg-cyan-500">無料</Badge>
                  )}
                </div>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                {course.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lesson_count} レッスン
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollment_count} 受講者
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(course)}
                  >
                    {course.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
