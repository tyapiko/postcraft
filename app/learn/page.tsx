'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Course } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  Loader2,
  GraduationCap,
  Play,
  Users,
  Clock,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

// Star field background
const StarField = ({ count = 100 }: { count?: number }) => {
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
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
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

type CourseWithStats = Course & {
  lesson_count: number
  enrollment_count: number
  is_enrolled?: boolean
}

export default function LearnPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [user])

  const fetchCourses = async () => {
    try {
      // Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count),
          enrollments:enrollments(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError

      // If user is logged in, check enrollments
      let enrolledCourseIds: string[] = []
      if (user) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)

        enrolledCourseIds = enrollments?.map(e => e.course_id) || []
      }

      const coursesWithStats = coursesData?.map(course => ({
        ...course,
        lesson_count: course.lessons?.[0]?.count || 0,
        enrollment_count: course.enrollments?.[0]?.count || 0,
        is_enrolled: enrolledCourseIds.includes(course.id)
      })) || []

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enrollCourse = async (courseId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId
        })

      if (error) throw error

      setCourses(prev =>
        prev.map(c =>
          c.id === courseId
            ? { ...c, is_enrolled: true, enrollment_count: c.enrollment_count + 1 }
            : c
        )
      )

      router.push(`/learn/${courseId}`)
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
      <StarField count={100} />

      {/* Nebula effects */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          right: '-10%',
          top: '10%',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">E-ラーニング</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              学習コース
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              市民データサイエンティストへの道を歩むための
              <br className="hidden md:block" />
              厳選されたコースで学びましょう
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="コースを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </div>
        </motion.div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <GraduationCap className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'コースが見つかりません' : 'コースがありません'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? '別のキーワードで検索してみてください' : '近日公開予定です'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden hover:border-purple-500/50 transition-all group">
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-purple-600 to-cyan-600 relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      {course.is_free && (
                        <Badge className="bg-cyan-500 text-white">無料</Badge>
                      )}
                    </div>
                    {course.is_enrolled && (
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-green-500 text-white">受講中</Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lesson_count} レッスン
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrollment_count} 人
                      </span>
                    </div>

                    {/* Action Button */}
                    {course.is_enrolled ? (
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500"
                        onClick={() => router.push(`/learn/${course.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        学習を続ける
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                        onClick={() => enrollCourse(course.id)}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        受講を開始
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
