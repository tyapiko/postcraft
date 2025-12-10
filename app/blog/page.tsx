'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, FileText, ArrowLeft, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleCardSkeleton } from '@/components/ui/loading-skeleton'
import { NoArticles } from '@/components/ui/empty-state'
import { motion } from 'framer-motion'

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
            background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)',
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
              AI Blog
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              データサイエンスとAIの最新情報をお届け。
              <br className="hidden sm:block" />
              実践的なテクニックから業界トレンドまで。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap gap-3 mb-8 justify-center"
          role="group"
          aria-label="カテゴリフィルター"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant="ghost"
              aria-pressed={selectedCategory === category}
              className={`transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-transparent'
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">記事がありません</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory !== 'All'
                ? `カテゴリ「${selectedCategory}」の記事が見つかりませんでした。`
                : 'まだ記事が投稿されていません。'
              }
            </p>
            {selectedCategory !== 'All' && (
              <Button
                onClick={() => setSelectedCategory('All')}
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <article className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {post.cover_image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
                      </div>
                    )}
                    <div className="relative p-6">
                      {post.category && (
                        <Badge className="mb-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                          {post.category}
                        </Badge>
                      )}
                      <h2 className="text-lg font-bold mb-3 text-white line-clamp-2 group-hover:text-green-400 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            {new Date(post.published_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          <span>{post.view_count.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
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
