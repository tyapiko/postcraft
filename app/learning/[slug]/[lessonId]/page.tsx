'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  Lock,
  List,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface Course {
  id: string
  slug: string
  title: string
  is_free: boolean
}

interface Lesson {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  sort_order: number
  is_preview: boolean
}

// YouTube/Vimeo URLからembed URLを生成
function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return url
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseSlug = params?.slug as string
  const lessonId = params?.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (courseSlug && lessonId) {
      fetchData()
    }
  }, [courseSlug, lessonId])

  const fetchData = async () => {
    try {
      // コース情報を取得
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, slug, title, is_free')
        .eq('slug', courseSlug)
        .eq('is_published', true)
        .maybeSingle()

      if (courseError) throw courseError
      if (!courseData) {
        router.push('/learning')
        return
      }

      setCourse(courseData)

      // 全レッスンを取得
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .order('sort_order', { ascending: true })

      if (lessonsError) throw lessonsError
      setAllLessons(lessonsData || [])

      // 現在のレッスンを取得
      const currentLesson = lessonsData?.find(l => l.id === lessonId)
      if (!currentLesson) {
        router.push(`/learning/${courseSlug}`)
        return
      }

      // アクセス権限チェック
      if (!currentLesson.is_preview && !courseData.is_free && !user) {
        router.push(`/learning/${courseSlug}`)
        return
      }

      setLesson(currentLesson)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      router.push('/learning')
    } finally {
      setLoading(false)
    }
  }

  // 前後のレッスンを取得
  const navigation = useMemo(() => {
    if (!lesson || allLessons.length === 0) return { prev: null, next: null }

    const currentIndex = allLessons.findIndex(l => l.id === lesson.id)
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    }
  }, [lesson, allLessons])

  // 進捗率を計算
  const progress = useMemo(() => {
    if (allLessons.length === 0) return 0
    return Math.round((completedLessons.size / allLessons.length) * 100)
  }, [completedLessons, allLessons])

  // レッスン完了をトグル
  const toggleComplete = () => {
    if (!lesson) return
    const newCompleted = new Set(completedLessons)
    if (newCompleted.has(lesson.id)) {
      newCompleted.delete(lesson.id)
    } else {
      newCompleted.add(lesson.id)
    }
    setCompletedLessons(newCompleted)
  }

  // レッスンがアクセス可能かチェック
  const canAccessLesson = (l: Lesson) => {
    return l.is_preview || course?.is_free || user
  }

  const embedUrl = lesson?.video_url ? getEmbedUrl(lesson.video_url) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">レッスンが見つかりません</h1>
          <Link href="/learning">
            <Button className="bg-green-500 hover:bg-green-600">
              コース一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/learning/${courseSlug}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-sm text-gray-400">{course.title}</p>
              <h1 className="text-white font-semibold truncate max-w-md">{lesson.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 進捗バー */}
            <div className="hidden md:flex items-center gap-3">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>

            {/* レッスン一覧トグル */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-400 hover:text-white"
            >
              <List size={20} />
              <span className="ml-2 hidden sm:inline">レッスン一覧</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* メインコンテンツ */}
        <main className={`flex-1 transition-all ${showSidebar ? 'lg:mr-80' : ''}`}>
          {/* ビデオプレーヤー */}
          {embedUrl && (
            <div className="relative bg-black">
              <div className="aspect-video max-h-[70vh]">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* レッスンコンテンツ */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* レッスン情報 */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {lesson.is_preview && (
                      <Badge className="bg-blue-500/20 text-blue-400">プレビュー</Badge>
                    )}
                    {lesson.duration_minutes && (
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {lesson.duration_minutes}分
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
                </div>
                <Button
                  onClick={toggleComplete}
                  variant={completedLessons.has(lesson.id) ? 'default' : 'outline'}
                  className={completedLessons.has(lesson.id)
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'border-gray-600 text-gray-400 hover:text-white'
                  }
                >
                  {completedLessons.has(lesson.id) ? (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      完了済み
                    </>
                  ) : (
                    <>
                      <Circle size={16} className="mr-2" />
                      完了にする
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* レッスン本文 */}
            {lesson.content && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-green-400 prose-code:bg-gray-700 prose-code:text-gray-200 prose-pre:bg-gray-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {lesson.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* ナビゲーション */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              {navigation.prev ? (
                <Link href={`/learning/${courseSlug}/${navigation.prev.id}`}>
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    <ChevronLeft size={20} className="mr-2" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500">前のレッスン</p>
                      <p className="text-sm">{navigation.prev.title}</p>
                    </div>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {navigation.next ? (
                canAccessLesson(navigation.next) ? (
                  <Link href={`/learning/${courseSlug}/${navigation.next.id}`}>
                    <Button className="bg-green-500 hover:bg-green-600">
                      <div className="text-right">
                        <p className="text-xs text-green-200">次のレッスン</p>
                        <p className="text-sm">{navigation.next.title}</p>
                      </div>
                      <ChevronRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="bg-gray-700 text-gray-500">
                    <Lock size={16} className="mr-2" />
                    次のレッスン（ロック中）
                  </Button>
                )
              ) : (
                <Link href={`/learning/${courseSlug}`}>
                  <Button className="bg-green-500 hover:bg-green-600">
                    コース完了！
                    <CheckCircle size={16} className="ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* サイドバー：レッスン一覧 */}
        <aside
          className={`fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform z-40 ${
            showSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">レッスン一覧</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-120px)]">
            {allLessons.map((l, index) => {
              const isAccessible = canAccessLesson(l)
              const isActive = l.id === lesson.id
              const isCompleted = completedLessons.has(l.id)

              return (
                <div
                  key={l.id}
                  className={`border-b border-gray-700 ${isActive ? 'bg-gray-700' : ''}`}
                >
                  {isAccessible ? (
                    <Link
                      href={`/learning/${courseSlug}/${l.id}`}
                      className={`flex items-start gap-3 p-4 hover:bg-gray-700 transition-colors ${
                        isActive ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500'
                            : 'bg-gray-600 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle size={14} /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-green-400' : 'text-white'
                        }`}>
                          {l.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {l.duration_minutes && (
                            <span className="text-xs text-gray-500">{l.duration_minutes}分</span>
                          )}
                          {l.is_preview && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs py-0">
                              プレビュー
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isActive && (
                        <PlayCircle size={16} className="text-green-400 flex-shrink-0" />
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 p-4 opacity-50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                        <Lock size={12} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-400 truncate">{l.title}</p>
                        {l.duration_minutes && (
                          <span className="text-xs text-gray-500">{l.duration_minutes}分</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* サイドバーオーバーレイ（モバイル） */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}
