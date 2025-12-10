'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, FileText, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
              <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              AI Blog
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              データサイエンスとAIの最新情報をお届け。
              <br className="hidden sm:block" />
              実践的なテクニックから業界トレンドまで。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16">
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
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/50'
                  : 'text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 border border-transparent'
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
              <div key={i} className="bg-muted rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">記事がありません</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'All'
                ? `カテゴリ「${selectedCategory}」の記事が見つかりませんでした。`
                : 'まだ記事が投稿されていません。'
              }
            </p>
            {selectedCategory !== 'All' && (
              <Button
                onClick={() => setSelectedCategory('All')}
                variant="outline"
                className="border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10"
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
                  <article className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {post.cover_image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      </div>
                    )}
                    <div className="relative p-6">
                      {post.category && (
                        <Badge className="mb-3 bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 hover:bg-green-500/30">
                          {post.category}
                        </Badge>
                      )}
                      <h2 className="text-lg font-bold mb-3 text-foreground line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
    </div>
  )
}
