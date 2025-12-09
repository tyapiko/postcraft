'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, GraduationCap, PlayCircle, ArrowLeft } from 'lucide-react'
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

// Chapiko Logo component
const ChapikoLogo = ({ className = '' }: { className?: string }) => (
  <div className={`font-bold tracking-tight ${className}`}>
    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Chapiko
    </span>
    <span className="text-gray-400 font-normal ml-1">Inc.</span>
  </div>
)

// Star field
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
    <div className="absolute inset-0 overflow-hidden">
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
            opacity: [0.2, 1, 0.2],
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
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ChapikoLogo className="text-xl md:text-2xl" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">ホームに戻る</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <StarField count={100} />

        {/* Nebula effect */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            left: '-10%',
            top: '0%',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">E-Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              スキルアップへの第一歩
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              体系的に学べるE-ラーニングコース。
              <br className="hidden sm:block" />
              初心者から上級者まで、あなたのペースで学習を進められます。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        {/* Filter Section */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">難易度</h3>
            <div className="flex flex-wrap gap-3">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  variant="ghost"
                  className={`transition-all duration-300 ${
                    selectedDifficulty === difficulty
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 border border-transparent'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">カテゴリ</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="ghost"
                  className={`transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent'
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
              <div key={i} className="bg-white/5 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">コースがありません</h3>
            <p className="text-gray-500">条件に合うコースが見つかりませんでした。</p>
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
                    <article className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {course.thumbnail ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
                          <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <PlayCircle className="w-6 h-6 text-purple-400" />
                            <span className="text-white text-sm font-medium">
                              {course.lesson_count}レッスン
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center">
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
                            <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              無料
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              ¥{course.price.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-bold mb-3 text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
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

      {/* Footer */}
      <footer className="relative border-t border-purple-500/20 py-8">
        <div className="container mx-auto px-6 text-center">
          <ChapikoLogo className="text-lg justify-center flex mb-4" />
          <p className="text-sm text-gray-500">© 2024 Chapiko Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
