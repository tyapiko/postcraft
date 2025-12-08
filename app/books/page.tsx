'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  const getDifficultyBadgeClass = (difficulty: string | null) => {
    switch (difficulty) {
      case '初心者向け':
        return 'bg-green-100 text-green-800'
      case '中級者向け':
        return 'bg-yellow-100 text-yellow-800'
      case '上級者向け':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
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
          <h1 className="text-5xl font-bold mb-4">おすすめ書籍</h1>
          <p className="text-xl text-gray-300">データサイエンス学習に役立つ厳選書籍</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="All" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mb-8">
          <h3 className="font-semibold text-black mb-3">難易度</h3>
          <div className="flex flex-wrap gap-3">
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
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">書籍がまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white border-l-4 border-green-500 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex gap-4 mb-4">
                    {book.cover_image && (
                      <div className="relative w-32 h-44 flex-shrink-0 rounded overflow-hidden shadow-md">
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {book.category && (
                          <Badge variant="outline">{book.category}</Badge>
                        )}
                        {book.difficulty && (
                          <Badge className={getDifficultyBadgeClass(book.difficulty)}>
                            {book.difficulty}
                          </Badge>
                        )}
                      </div>
                      {book.rating && (
                        <div className="flex items-center gap-2">
                          {renderStars(book.rating)}
                          <span className="text-sm text-gray-600">{book.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {book.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
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
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                        <ExternalLink size={16} />
                        Amazonで見る
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
