'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, GraduationCap, PlayCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoCourses } from '@/components/ui/empty-state'

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
  lesson_count?: number
}

const difficulties = ['All', '初級', '中級', '上級']
const categories = ['All', 'Python', 'データ分析', 'AI', '自動化']

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = courses

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty)
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [selectedDifficulty, selectedCategory, courses])

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      const coursesWithLessonCount = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)

          return {
            ...course,
            lesson_count: count || 0
          }
        })
      )

      setCourses(coursesWithLessonCount)
      setFilteredCourses(coursesWithLessonCount)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyBadgeClass = (difficulty: string | null) => {
    switch (difficulty) {
      case '初級':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case '中級':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      case '上級':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/20 rounded-2xl">
              <GraduationCap className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">スキルアップへの第一歩</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            体系的に学べるE-ラーニングコース。初心者から上級者まで、あなたのペースで学習を進められます。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* フィルターセクション */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">難易度</h3>
            <div className="flex flex-wrap gap-3">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  className={`transition-all duration-200 ${
                    selectedDifficulty === difficulty
                      ? 'bg-green-500 hover:bg-green-600 scale-105'
                      : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">カテゴリ</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-green-500 hover:bg-green-600 scale-105'
                      : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* コース一覧 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <NoCourses />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <Link key={course.id} href={`/learning/${course.slug}`}>
                <article
                  className="group bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg overflow-hidden hover:shadow-xl dark:hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {course.thumbnail ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
                        <span className="text-white text-sm font-medium drop-shadow-lg">
                          {course.lesson_count}レッスン
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {course.difficulty && (
                        <Badge className={getDifficultyBadgeClass(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      )}
                      {course.is_free ? (
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          無料
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                          ¥{course.price.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{course.duration_minutes}分</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{course.lesson_count}レッスン</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
