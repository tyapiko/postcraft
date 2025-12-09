'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, GripVertical, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'

interface Lesson {
  id: string
  title: string
  sort_order: number
  is_preview: boolean
  duration_minutes: number
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  difficulty: string | null
  category: string | null
  duration_minutes: number
  is_published: boolean
  is_free: boolean
  price: number | null
  sort_order: number
  created_at: string
  lessons?: Lesson[]
}

const difficulties = ['初級', '中級', '上級']
const categories = ['Python', 'データ分析', 'AI', '自動化', 'Excel', 'ビジネス']

export default function LearningManagementPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = [...courses]

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (difficultyFilter) {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter)
    }

    if (categoryFilter) {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, difficultyFilter, categoryFilter, courses])

  const fetchCourses = async () => {
    try {
      // まずコース一覧を取得
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true })

      if (coursesError) throw coursesError

      // 各コースのレッスン数を取得
      const coursesWithLessons = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('id, title, sort_order, is_preview, duration_minutes')
            .eq('course_id', course.id)
            .order('sort_order', { ascending: true })

          if (lessonsError) {
            console.error('Failed to fetch lessons:', lessonsError)
            return { ...course, lessons: [] }
          }

          return { ...course, lessons: lessonsData || [] }
        })
      )

      setCourses(coursesWithLessons)
      setFilteredCourses(coursesWithLessons)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('コースの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      // まずレッスンを削除
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', deleteId)

      if (lessonsError) throw lessonsError

      // コースを削除
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', deleteId)

      if (courseError) throw courseError

      setCourses(courses.filter(c => c.id !== deleteId))
      toast.success('コースを削除しました')
    } catch (error) {
      console.error('Failed to delete course:', error)
      toast.error('削除に失敗しました')
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setCourses(courses.map(c =>
        c.id === id ? { ...c, is_published: !currentStatus } : c
      ))
      toast.success(!currentStatus ? 'コースを公開しました' : 'コースを非公開にしました')
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      toast.error('公開状態の変更に失敗しました')
    }
  }

  const toggleExpand = (courseId: string) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case '初級': return 'bg-green-100 text-green-800'
      case '中級': return 'bg-yellow-100 text-yellow-800'
      case '上級': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">E-ラーニング管理</h1>
          <p className="text-gray-600">コースとレッスンの作成・編集・管理</p>
        </div>
        <Button asChild className="bg-green-500 hover:bg-green-600">
          <Link href="/admin/learning/new">
            <Plus size={16} className="mr-2" />
            新規コース作成
          </Link>
        </Button>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトルまたはスラッグで検索..."
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="難易度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {difficulties.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* コース一覧 */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>難易度</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>レッスン数</TableHead>
              <TableHead>価格</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  コースがありません
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <Collapsible key={course.id} asChild open={expandedCourses.has(course.id)}>
                  <>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(course.id)}
                          >
                            {expandedCourses.has(course.id) ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <BookOpen size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.difficulty && (
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.category && (
                          <Badge variant="outline">{course.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{course.lessons?.length || 0}レッスン</TableCell>
                      <TableCell>
                        {course.is_free ? (
                          <Badge className="bg-blue-100 text-blue-800">無料</Badge>
                        ) : (
                          <span className="font-medium">¥{course.price?.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            course.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {course.is_published ? '公開' : '下書き'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublish(course.id, course.is_published)}
                            title={course.is_published ? '非公開にする' : '公開する'}
                          >
                            {course.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/learning/${course.id}`}>
                              <Edit size={16} />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(course.id)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={8} className="p-0">
                          <div className="px-8 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-700">レッスン一覧</h4>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/learning/${course.id}/lessons/new`}>
                                  <Plus size={14} className="mr-1" />
                                  レッスン追加
                                </Link>
                              </Button>
                            </div>
                            {course.lessons && course.lessons.length > 0 ? (
                              <div className="space-y-2">
                                {course.lessons.map((lesson, index) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-white rounded border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical size={16} className="text-gray-400" />
                                      <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                                      <span className="font-medium">{lesson.title}</span>
                                      {lesson.is_preview && (
                                        <Badge variant="outline" className="text-xs">プレビュー可</Badge>
                                      )}
                                      <span className="text-sm text-gray-500">
                                        {lesson.duration_minutes}分
                                      </span>
                                    </div>
                                    <Button size="sm" variant="ghost" asChild>
                                      <Link href={`/admin/learning/${course.id}/lessons/${lesson.id}`}>
                                        <Edit size={14} />
                                      </Link>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm py-4 text-center">
                                レッスンがありません
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。コースと関連するすべてのレッスンが削除されます。
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
    </div>
  )
}
