'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Course, Lesson, LessonProgress } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Headphones,
  CheckCircle2,
  Circle,
  Play,
  Loader2,
  Lock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// Star field
const StarField = ({ count = 80 }: { count?: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

const contentTypeIcons = {
  video: Video,
  text: FileText,
  audio: Headphones
}

type LessonWithProgress = Lesson & { progress?: LessonProgress }

export default function CourseViewPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.courseId as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [activeLesson, setActiveLesson] = useState<LessonWithProgress | null>(null)

  useEffect(() => {
    fetchCourseData()
  }, [courseId, user])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single()

      if (courseError) throw courseError

      setCourse(courseData)

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order')

      if (lessonsError) throw lessonsError

      // Check enrollment and fetch progress if logged in
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        setIsEnrolled(!!enrollment)

        if (enrollment) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonsData?.map(l => l.id) || [])

          const lessonsWithProgress = lessonsData?.map(lesson => ({
            ...lesson,
            progress: progressData?.find(p => p.lesson_id === lesson.id)
          })) || []

          setLessons(lessonsWithProgress)

          // Set first incomplete lesson as active, or first lesson
          const firstIncomplete = lessonsWithProgress.find(l => !l.progress?.completed)
          setActiveLesson(firstIncomplete || lessonsWithProgress[0] || null)
        } else {
          setLessons(lessonsData || [])
        }
      } else {
        setLessons(lessonsData || [])
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('コースの取得に失敗しました')
      router.push('/learn')
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async (lessonId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error

      setLessons(prev =>
        prev.map(l =>
          l.id === lessonId
            ? { ...l, progress: { ...l.progress!, completed: true, completed_at: new Date().toISOString() } }
            : l
        )
      )

      toast.success('レッスン完了!')

      // Move to next lesson
      const currentIndex = lessons.findIndex(l => l.id === lessonId)
      if (currentIndex < lessons.length - 1) {
        setActiveLesson(lessons[currentIndex + 1])
      }
    } catch (error) {
      console.error('Failed to mark complete:', error)
      toast.error('進捗の保存に失敗しました')
    }
  }

  const completedCount = lessons.filter(l => l.progress?.completed).length
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
      <StarField count={80} />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/learn')}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  コース一覧
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white">{course.title}</h1>
                  {isEnrolled && (
                    <div className="flex items-center gap-3 mt-1">
                      <Progress value={progressPercent} className="w-32 h-2" />
                      <span className="text-sm text-gray-400">
                        {completedCount}/{lessons.length} 完了
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {course.is_free && <Badge className="bg-cyan-500">無料コース</Badge>}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lesson List */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    レッスン一覧
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const Icon = contentTypeIcons[lesson.content_type]
                    const isActive = activeLesson?.id === lesson.id
                    const isCompleted = lesson.progress?.completed
                    const canAccess = isEnrolled || lesson.is_preview

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => canAccess && setActiveLesson(lesson)}
                        disabled={!canAccess}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                          isActive
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : canAccess
                            ? 'hover:bg-white/5'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-400'
                            : isActive
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : canAccess ? (
                            <span className="text-sm font-medium">{index + 1}</span>
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            isActive ? 'text-white' : 'text-gray-300'
                          }`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Icon className="w-3 h-3" />
                            <span>
                              {lesson.content_type === 'video' ? '動画' :
                               lesson.content_type === 'text' ? 'テキスト' : '音声'}
                            </span>
                            {lesson.is_preview && !isEnrolled && (
                              <Badge variant="outline" className="text-[10px] py-0">プレビュー</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {activeLesson ? (
                <motion.div
                  key={activeLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Video/Audio Player or Text Content */}
                  {activeLesson.content_type === 'video' && activeLesson.content_url && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      <iframe
                        src={activeLesson.content_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {activeLesson.content_type === 'audio' && activeLesson.content_url && (
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                          <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <audio controls className="flex-1">
                          <source src={activeLesson.content_url} />
                        </audio>
                      </div>
                    </Card>
                  )}

                  {/* Lesson Info */}
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-2xl">
                            {activeLesson.title}
                          </CardTitle>
                          {activeLesson.description && (
                            <p className="text-gray-400 mt-2">{activeLesson.description}</p>
                          )}
                        </div>
                        {isEnrolled && (
                          <Button
                            onClick={() => markComplete(activeLesson.id)}
                            disabled={activeLesson.progress?.completed}
                            className={activeLesson.progress?.completed
                              ? 'bg-green-600'
                              : 'bg-gradient-to-r from-purple-600 to-cyan-600'
                            }
                          >
                            {activeLesson.progress?.completed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                完了済み
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 mr-2" />
                                完了にする
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    {activeLesson.content_type === 'text' && activeLesson.content_text && (
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-gray-300">
                            {activeLesson.content_text}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">レッスンを選択してください</p>
                </Card>
              )}

              {/* Enroll CTA for non-enrolled users */}
              {!isEnrolled && !loading && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 mt-6">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      このコースに登録しよう
                    </h3>
                    <p className="text-gray-400 mb-4">
                      登録すると全てのレッスンにアクセスでき、進捗も記録されます
                    </p>
                    <Button
                      onClick={async () => {
                        if (!user) {
                          router.push('/login')
                          return
                        }
                        const { error } = await supabase
                          .from('enrollments')
                          .insert({ user_id: user.id, course_id: courseId })
                        if (!error) {
                          setIsEnrolled(true)
                          fetchCourseData()
                          toast.success('コースに登録しました!')
                        }
                      }}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {course.is_free ? '無料で始める' : '受講を開始'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
