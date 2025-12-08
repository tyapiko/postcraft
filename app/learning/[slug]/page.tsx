'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, PlayCircle, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
}

export default function LearningDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/learning" className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft size={20} />
          コース一覧に戻る
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {course.thumbnail && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

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
                  <span>{course.duration_minutes}分</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={20} />
                  <span>{totalLessons}レッスン</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-black mb-6">カリキュラム</h2>
              <Accordion type="single" collapsible className="w-full">
                {lessons.map((lesson, index) => (
                  <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-black">{lesson.title}</p>
                          {lesson.duration_minutes && (
                            <p className="text-sm text-gray-500">{lesson.duration_minutes}分</p>
                          )}
                        </div>
                        {lesson.is_preview ? (
                          <Badge className="bg-blue-100 text-blue-800">プレビュー</Badge>
                        ) : (
                          <Lock size={16} className="text-gray-400" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-11 pt-2">
                        {lesson.is_preview ? (
                          <div>
                            <p className="text-gray-600 mb-3">このレッスンはプレビュー可能です</p>
                            {lesson.video_url && (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                <PlayCircle size={16} className="mr-2" />
                                プレビューを見る
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">このレッスンはコース購入後に閲覧できます</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {course.is_free ? (
                <div className="mb-6">
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">無料コース</Badge>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-black">¥{course.price.toLocaleString()}</p>
                </div>
              )}

              {user ? (
                <Button className="w-full bg-green-500 hover:bg-green-600 text-lg py-6 mb-4">
                  このコースを始める
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
