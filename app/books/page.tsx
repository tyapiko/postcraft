'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ExternalLink, Library } from 'lucide-react'
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
        return { bg: 'bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/30' }
      case '中級者向け':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/30' }
      case '上級者向け':
        return { bg: 'bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' }
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/30' }
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
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-b from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 mb-6">
              <Library className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">Recommended Books</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              おすすめ書籍
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              データサイエンス学習に役立つ厳選書籍
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
                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/50'
                      : 'text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 border border-transparent'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div>
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
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50'
                      : 'text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent'
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
              <div key={i} className="bg-muted rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <Library className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">書籍がありません</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'All' && selectedDifficulty !== 'All'
                ? `「${selectedCategory}」×「${selectedDifficulty}」の条件に合う書籍が見つかりませんでした。`
                : selectedCategory !== 'All'
                  ? `カテゴリ「${selectedCategory}」の書籍が見つかりませんでした。`
                  : selectedDifficulty !== 'All'
                    ? `難易度「${selectedDifficulty}」の書籍が見つかりませんでした。`
                    : '条件に合う書籍が見つかりませんでした。'
              }
            </p>
            {(selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <Button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedDifficulty('All')
                }}
                variant="outline"
                className="border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
              >
                フィルターをクリア
              </Button>
            )}
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
                  <article className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative p-6">
                      <div className="flex gap-4 mb-4">
                        {book.cover_image ? (
                          <div className="relative w-28 h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-40 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-purple-100 dark:from-orange-900/50 dark:to-purple-900/50 flex items-center justify-center">
                            <Library className="w-10 h-10 text-orange-400/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {book.title}
                          </h3>
                          {book.author && (
                            <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {book.category && (
                              <Badge className="bg-muted text-muted-foreground border border-border">
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
                              <span className="text-sm text-muted-foreground">{book.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {book.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
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
    </div>
  )
}
