'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-black via-gray-900 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">スキルアップへの第一歩</h1>
          <p className="text-xl text-gray-300">体系的に学べるE-ラーニングコース</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h3 className="font-semibold text-black mb-3">難易度</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                className={selectedDifficulty === difficulty ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {difficulty}
              </Button>
            ))}
          </div>

          <h3 className="font-semibold text-black mb-3">カテゴリ</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={selectedCategory === category ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">コースがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/learning/${course.slug}`}>
                <div className="bg-white border-l-4 border-green-500 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {course.thumbnail && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {course.difficulty && (
                        <Badge className={getDifficultyBadgeClass(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      )}
                      {course.is_free ? (
                        <Badge className="bg-blue-100 text-blue-800">無料</Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800">
                          ¥{course.price.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-black line-clamp-2">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
