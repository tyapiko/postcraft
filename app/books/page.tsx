'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ExternalLink, Library, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  cover_image: string | null
  amazon_url: string | null
  category: string | null
  difficulty: string | null
  rating: number | null
  sort_order: number
}

const categories = ['All', 'データ分析', 'Python', 'AI', '統計学', 'ビジネス']
const difficulties = ['All', '初心者向け', '中級者向け', '上級者向け']

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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    let filtered = books

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(book => book.difficulty === selectedDifficulty)
    }

    setFilteredBooks(filtered)
  }, [selectedCategory, selectedDifficulty, books])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setBooks(data || [])
      setFilteredBooks(data || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case '初心者向け':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
      case '中級者向け':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
      case '上級者向け':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ChapikoLogo className="text-xl md:text-2xl" />
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/blog" className="text-gray-400 hover:text-green-400 transition-colors text-sm font-medium">
                Blog
              </Link>
              <Link href="/learning" className="text-gray-400 hover:text-purple-400 transition-colors text-sm font-medium">
                Learning
              </Link>
              <Link href="/generate" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium">
                AI Generator
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">ホーム</span>
            </Link>
          </div>
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
            background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
            right: '-10%',
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 mb-6">
              <Library className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Recommended Books</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
              おすすめ書籍
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              データサイエンス学習に役立つ厳選書籍
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
            <h3 className="font-semibold text-white mb-3">カテゴリ</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="ghost"
                  className={`transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                      : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 border border-transparent'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">難易度</h3>
            <div className="flex flex-wrap gap-3">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  variant="ghost"
                  className={`transition-all duration-300 ${
                    selectedDifficulty === difficulty
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">書籍がありません</h3>
            <p className="text-gray-500">条件に合う書籍が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book, index) => {
              const difficultyColors = getDifficultyColor(book.difficulty)
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <article className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative p-6">
                      <div className="flex gap-4 mb-4">
                        {book.cover_image ? (
                          <div className="relative w-28 h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg shadow-black/50">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-40 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-900/50 to-purple-900/50 flex items-center justify-center">
                            <Library className="w-10 h-10 text-orange-400/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                            {book.title}
                          </h3>
                          {book.author && (
                            <p className="text-sm text-gray-400 mb-3">{book.author}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {book.category && (
                              <Badge className="bg-white/10 text-gray-300 border border-white/20">
                                {book.category}
                              </Badge>
                            )}
                            {book.difficulty && (
                              <Badge className={`${difficultyColors.bg} ${difficultyColors.text} border ${difficultyColors.border}`}>
                                {book.difficulty}
                              </Badge>
                            )}
                          </div>
                          {book.rating && (
                            <div className="flex items-center gap-2">
                              {renderStars(book.rating)}
                              <span className="text-sm text-gray-500">{book.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {book.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {book.description}
                        </p>
                      )}

                      {book.amazon_url && (
                        <a
                          href={book.amazon_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all">
                            <ExternalLink size={16} />
                            Amazonで見る
                          </Button>
                        </a>
                      )}
                    </div>
                  </article>
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
