'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleCardSkeleton } from '@/components/ui/loading-skeleton'
import { NoArticles } from '@/components/ui/empty-state'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image: string | null
  category: string | null
  published_at: string
  view_count: number
}

const categories = ['All', 'AI活用', 'データ分析', '自動化', 'Python']

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory))
    }
  }, [selectedCategory, posts])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
      setFilteredPosts(data || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FileText className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-5xl font-bold">AI Blog</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl">
            データサイエンスとAIの最新情報をお届け。実践的なテクニックから業界トレンドまで。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* カテゴリーフィルター */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-green-500 hover:bg-green-600 scale-105'
                  : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* ローディング状態 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <NoArticles />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article
                  className={`group bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg overflow-hidden hover:shadow-xl dark:hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {post.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <Badge className="mb-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100">
                        {post.category}
                      </Badge>
                    )}
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {new Date(post.published_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{post.view_count.toLocaleString()}</span>
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
