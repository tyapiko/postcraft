'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, ArrowLeft, Twitter, Facebook, Linkedin, Copy, Check, List } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
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

interface TocItem {
  id: string
  title: string
  level: number
}

// 目次を生成する関数
function generateToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = title
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '')
      .replace(/\s+/g, '-')

    toc.push({ id, title, level })
  }

  return toc
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showToc, setShowToc] = useState(false)

  // 目次を生成
  const toc = useMemo(() => {
    if (!post?.content) return []
    return generateToc(post.content)
  }, [post?.content])

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowToc(false)
    }
  }

  // 読了時間を計算（日本語は400文字/分として計算）
  const readingTime = useMemo(() => {
    if (!post?.content) return 0
    const charCount = post.content.length
    return Math.max(1, Math.ceil(charCount / 400))
  }, [post?.content])

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
      {/* ヒーローセクション（カバー画像） */}
      {post.cover_image && (
        <div className="relative h-[50vh] min-h-[400px] w-full">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.category && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    {post.category}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{new Date(post.published_at).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span>{post.view_count} views</span>
                </div>
                <span className="text-sm">約{readingTime}分で読めます</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-green-500 hover:text-green-600">
            <ArrowLeft size={20} />
            ブログ一覧に戻る
          </Link>

          {/* 目次トグルボタン（モバイル用） */}
          {toc.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowToc(!showToc)}
            >
              <List size={16} className="mr-2" />
              目次
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー：目次（デスクトップ） */}
          {toc.length > 0 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                  <List size={18} />
                  目次
                </h3>
                <nav className="space-y-2">
                  {toc.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm hover:text-green-500 transition-colors ${
                        item.level === 2 ? 'font-medium text-gray-700' : 'pl-4 text-gray-500'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className={toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* カバー画像がない場合のヘッダー */}
            {!post.cover_image && (
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
                <div className="flex items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{new Date(post.published_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={18} />
                    <span>{post.view_count} views</span>
                  </div>
                  <span className="text-sm">約{readingTime}分で読めます</span>
                </div>
              </div>
            )}

            {/* タグ（カバー画像がある場合） */}
            {post.cover_image && post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="bg-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* モバイル目次（トグル表示） */}
            {showToc && toc.length > 0 && (
              <div className="lg:hidden bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="font-semibold text-black mb-4">目次</h3>
                <nav className="space-y-2">
                  {toc.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm hover:text-green-500 transition-colors ${
                        item.level === 2 ? 'font-medium text-gray-700' : 'pl-4 text-gray-500'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* 記事本文 */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              {post.excerpt && (
                <p className="text-lg text-gray-600 mb-8 pb-8 border-b italic">
                  {post.excerpt}
                </p>
              )}

              <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-700 prose-a:text-green-500 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSlug]}
                  components={{
                    h2: ({ children, ...props }) => (
                      <h2 {...props} className="text-2xl font-bold text-black mt-12 mb-4 pb-2 border-b">
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3 {...props} className="text-xl font-semibold text-black mt-8 mb-3">
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* シェアボタン */}
              <div className="border-t pt-8 mt-12">
                <h3 className="text-lg font-semibold text-black mb-4">この記事をシェア</h3>
                <div className="flex flex-wrap gap-3">
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
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-500" />
                        コピー完了
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        リンクをコピー
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 関連記事 */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">関連記事</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                        {relatedPost.cover_image ? (
                          <div className="relative h-40">
                            <Image
                              src={relatedPost.cover_image}
                              alt={relatedPost.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              {relatedPost.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-black line-clamp-2 mb-2 hover:text-green-500 transition-colors">
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
      </div>
    </div>
  )
}
