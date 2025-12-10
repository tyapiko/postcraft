'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, GraduationCap, PlayCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

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

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case '初級':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
      case '中級':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
      case '上級':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 dark:to-background">
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">E-Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              スキルアップへの第一歩
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              体系的に学べるE-ラーニングコース。
              <br className="hidden sm:block" />
              初心者から上級者まで、あなたのペースで学習を進められます。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16">
        {/* Filter Section */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-6">
            <h3 id="difficulty-filter-label" className="font-semibold text-foreground mb-3">難易度</h3>
            <div className="flex flex-wrap gap-3" role="group" aria-labelledby="difficulty-filter-label">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  variant="ghost"
                  aria-pressed={selectedDifficulty === difficulty}
                  className={`transition-all duration-300 ${
                    selectedDifficulty === difficulty
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/50'
                      : 'text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 border border-transparent'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 id="category-filter-label" className="font-semibold text-foreground mb-3">カテゴリ</h3>
            <div className="flex flex-wrap gap-3" role="group" aria-labelledby="category-filter-label">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="ghost"
                  aria-pressed={selectedCategory === category}
                  className={`transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50'
                      : 'text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">コースがありません</h3>
            <p className="text-muted-foreground mb-4">
              {selectedDifficulty !== 'All' && selectedCategory !== 'All'
                ? `「${selectedDifficulty}」×「${selectedCategory}」の条件に合うコースが見つかりませんでした。`
                : selectedDifficulty !== 'All'
                  ? `難易度「${selectedDifficulty}」のコースが見つかりませんでした。`
                  : selectedCategory !== 'All'
                    ? `カテゴリ「${selectedCategory}」のコースが見つかりませんでした。`
                    : '条件に合うコースが見つかりませんでした。'
              }
            </p>
            {(selectedDifficulty !== 'All' || selectedCategory !== 'All') && (
              <Button
                onClick={() => {
                  setSelectedDifficulty('All')
                  setSelectedCategory('All')
                }}
                variant="outline"
                className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const difficultyColors = getDifficultyColor(course.difficulty)
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/learning/${course.slug}`}>
                    <article className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      {course.thumbnail ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                          <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <PlayCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <span className="text-foreground text-sm font-medium">
                              {course.lesson_count}レッスン
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/50 dark:to-cyan-900/50 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-purple-400/50" />
                        </div>
                      )}
                      <div className="relative p-6">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {course.difficulty && (
                            <Badge className={`${difficultyColors.bg} ${difficultyColors.text} border ${difficultyColors.border}`}>
                              {course.difficulty}
                            </Badge>
                          )}
                          {course.is_free ? (
                            <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                              無料
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                              ¥{course.price.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-bold mb-3 text-foreground line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>{course.duration_minutes}分</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} />
                            <span>{course.lesson_count}レッスン</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
