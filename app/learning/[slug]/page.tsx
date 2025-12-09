'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, PlayCircle, Lock, CheckCircle, Users, Star, Share2, Twitter, Facebook, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useAuth } from '@/lib/auth-context'

interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnail: string | null
  difficulty: string | null
  duration_minutes: number
  category: string | null
  is_free: boolean
  price: number
}

interface Lesson {
  id: string
  title: string
  duration_minutes: number | null
  sort_order: number
  is_preview: boolean
  video_url: string | null
  content: string | null
}

export default function LearningDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (slug) {
      fetchCourse()
    }
  }, [slug])

  const fetchCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (courseError) throw courseError

      if (courseData) {
        setCourse(courseData)

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true })

        if (lessonsError) throw lessonsError
        setLessons(lessonsData || [])
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyBadgeClass = (difficulty: string | null) => {
    switch (difficulty) {
      case '初級':
        return 'bg-green-100 text-green-800'
      case '中級':
        return 'bg-yellow-100 text-yellow-800'
      case '上級':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 進捗率を計算
  const progress = useMemo(() => {
    if (lessons.length === 0) return 0
    return Math.round((completedLessons.size / lessons.length) * 100)
  }, [completedLessons, lessons])

  // シェア機能
  const shareOnTwitter = () => {
    const url = window.location.href
    const text = course?.title || ''
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  // レッスンがアクセス可能かチェック
  const canAccessLesson = (lesson: Lesson) => {
    return lesson.is_preview || course?.is_free || user
  }

  // 最初のアクセス可能なレッスンを取得
  const firstAccessibleLesson = useMemo(() => {
    return lessons.find(l => canAccessLesson(l))
  }, [lessons, course, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">コースが見つかりません</h1>
          <Link href="/learning">
            <Button className="bg-green-500 hover:bg-green-600">
              コース一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalLessons = lessons.length
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      {course.thumbnail && (
        <div className="relative h-[40vh] min-h-[300px] w-full">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                {course.difficulty && (
                  <Badge className={getDifficultyBadgeClass(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="outline" className="border-white/50 text-white">
                    {course.category}
                  </Badge>
                )}
                {course.is_free && (
                  <Badge className="bg-blue-500 text-white">無料</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{totalDuration}分</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={18} />
                  <span>{totalLessons}レッスン</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/learning" className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft size={20} />
          コース一覧に戻る
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* サムネイルがない場合のヘッダー */}
            {!course.thumbnail && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {course.difficulty && (
                    <Badge className={getDifficultyBadgeClass(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  )}
                  {course.category && (
                    <Badge variant="outline">{course.category}</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-black mb-4">{course.title}</h1>
                <p className="text-gray-600 text-lg mb-6">{course.description}</p>
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>{totalDuration}分</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle size={20} />
                    <span>{totalLessons}レッスン</span>
                  </div>
                </div>
              </div>
            )}

            {/* コース説明（サムネイルがある場合） */}
            {course.thumbnail && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <h2 className="text-xl font-bold text-black mb-4">コース概要</h2>
                <p className="text-gray-600 text-lg">{course.description}</p>
              </div>
            )}

            {/* 進捗バー（ログイン時のみ） */}
            {user && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-black">学習進捗</h3>
                  <span className="text-sm text-gray-500">
                    {completedLessons.size} / {totalLessons} 完了
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-gray-500 mt-2">{progress}% 完了</p>
              </div>
            )}

            {/* カリキュラム */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">カリキュラム</h2>
                <span className="text-sm text-gray-500">
                  {totalLessons}レッスン・{totalDuration}分
                </span>
              </div>
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isAccessible = canAccessLesson(lesson)
                  const isCompleted = completedLessons.has(lesson.id)

                  return (
                    <div
                      key={lesson.id}
                      className={`border rounded-lg transition-all ${
                        isAccessible
                          ? 'hover:border-green-300 hover:shadow-md cursor-pointer'
                          : 'bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      {isAccessible ? (
                        <Link
                          href={`/learning/${slug}/${lesson.id}`}
                          className="flex items-center gap-4 p-4"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isCompleted ? <CheckCircle size={20} /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-black">{lesson.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {lesson.duration_minutes && (
                                <span className="text-sm text-gray-500">
                                  {lesson.duration_minutes}分
                                </span>
                              )}
                              {lesson.video_url && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <PlayCircle size={14} />
                                  動画
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.is_preview && (
                              <Badge className="bg-blue-100 text-blue-800">プレビュー</Badge>
                            )}
                            <PlayCircle size={20} className="text-green-500" />
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 p-4 opacity-60">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-600">{lesson.title}</p>
                            {lesson.duration_minutes && (
                              <span className="text-sm text-gray-400">{lesson.duration_minutes}分</span>
                            )}
                          </div>
                          <Lock size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* シェアボタン */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="font-semibold text-black mb-4">このコースをシェア</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={shareOnTwitter} variant="outline" size="sm" className="gap-2">
                  <Twitter size={16} />
                  Twitter
                </Button>
                <Button onClick={shareOnFacebook} variant="outline" size="sm" className="gap-2">
                  <Facebook size={16} />
                  Facebook
                </Button>
                <Button onClick={copyLink} variant="outline" size="sm" className="gap-2">
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-500" />
                      コピー完了
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      リンクをコピー
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {course.is_free ? (
                <div className="mb-6">
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">無料コース</Badge>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-black">¥{course.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">税込</p>
                </div>
              )}

              {firstAccessibleLesson ? (
                <Link href={`/learning/${slug}/${firstAccessibleLesson.id}`}>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-lg py-6 mb-4">
                    <PlayCircle size={20} className="mr-2" />
                    {user ? '学習を始める' : 'プレビューを見る'}
                  </Button>
                </Link>
              ) : user ? (
                <Button className="w-full bg-green-500 hover:bg-green-600 text-lg py-6 mb-4">
                  このコースを購入
                </Button>
              ) : (
                <div>
                  <Link href="/signup">
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-lg py-6 mb-2">
                      無料登録して始める
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    アカウント登録は無料です
                  </p>
                </div>
              )}

              <div className="border-t pt-6 mt-6 space-y-4">
                <h3 className="font-semibold text-black mb-3">このコースに含まれるもの</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>{totalLessons}本の動画レッスン</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>総学習時間: {totalDuration}分</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>無期限アクセス</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span>モバイル/PC対応</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
