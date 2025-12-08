'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, ArrowLeft, Share2, Twitter, Facebook, Linkedin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  category: string | null
  tags: string[] | null
  published_at: string
  view_count: number
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setPost(data)
        await incrementViewCount(data.id)
        if (data.category) {
          fetchRelatedPosts(data.category, data.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (postId: string) => {
    try {
      const { data: currentPost } = await supabase
        .from('blog_posts')
        .select('view_count')
        .eq('id', postId)
        .maybeSingle()

      if (currentPost) {
        await supabase
          .from('blog_posts')
          .update({ view_count: (currentPost.view_count || 0) + 1 })
          .eq('id', postId)
      }
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  const fetchRelatedPosts = async (category: string, currentPostId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setRelatedPosts(data || [])
    } catch (error) {
      console.error('Failed to fetch related posts:', error)
    }
  }

  const shareOnTwitter = () => {
    const url = window.location.href
    const text = post?.title || ''
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = window.location.href
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">記事が見つかりません</h1>
          <Link href="/blog">
            <Button className="bg-green-500 hover:bg-green-600">
              ブログ一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft size={20} />
          ブログ一覧に戻る
        </Link>

        {post.cover_image && (
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {post.category}
              </Badge>
            )}
            {post.tags && post.tags.map((tag, i) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-black mb-4">{post.title}</h1>

          <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.published_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{post.view_count} views</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-black mb-4">この記事をシェア</h3>
            <div className="flex gap-3">
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Twitter size={16} />
                Twitter
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Facebook size={16} />
                Facebook
              </Button>
              <Button
                onClick={shareOnLinkedIn}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Linkedin size={16} />
                LinkedIn
              </Button>
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">関連記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.cover_image && (
                      <div className="relative h-40">
                        <Image
                          src={relatedPost.cover_image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-black line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(relatedPost.published_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
