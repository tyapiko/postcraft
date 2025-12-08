'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  FileText,
  BookOpen,
  Library,
  MessageSquare,
  TrendingUp,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  blogPosts: number
  courses: number
  lessons: number
  books: number
  totalViews: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogPosts: 0,
    courses: 0,
    lessons: 0,
    books: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogResult, coursesResult, lessonsResult, booksResult] = await Promise.all([
          supabase.from('blog_posts').select('id, view_count', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('lessons').select('id', { count: 'exact' }),
          supabase.from('books').select('id', { count: 'exact' })
        ])

        const totalViews = blogResult.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

        setStats({
          blogPosts: blogResult.count || 0,
          courses: coursesResult.count || 0,
          lessons: lessonsResult.count || 0,
          books: booksResult.count || 0,
          totalViews
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'ブログ記事',
      value: stats.blogPosts,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/blog'
    },
    {
      title: 'コース',
      value: stats.courses,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/admin/learning'
    },
    {
      title: 'レッスン',
      value: stats.lessons,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/learning'
    },
    {
      title: '書籍',
      value: stats.books,
      icon: Library,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/admin/books'
    }
  ]

  const quickActions = [
    {
      title: 'ブログ記事を作成',
      description: '新しいブログ記事を執筆',
      icon: FileText,
      href: '/admin/blog/new',
      color: 'border-blue-500'
    },
    {
      title: 'コースを追加',
      description: '新しいE-ラーニングコースを作成',
      icon: BookOpen,
      href: '/admin/learning/new',
      color: 'border-green-500'
    },
    {
      title: '書籍を追加',
      description: 'おすすめ書籍を登録',
      icon: Library,
      href: '/admin/books/new',
      color: 'border-orange-500'
    },
    {
      title: 'SNS投稿生成',
      description: 'AI投稿生成ツールを使用',
      icon: MessageSquare,
      href: '/admin/posts',
      color: 'border-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">ダッシュボード</h1>
        <p className="text-gray-600">管理画面へようこそ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stat.value}</div>
              <Link
                href={stat.href}
                className="text-sm text-green-500 hover:text-green-600 mt-2 inline-flex items-center gap-1"
              >
                管理画面へ
                <ArrowRight size={14} />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>総閲覧数</CardTitle>
              <CardDescription>ブログ記事の合計閲覧数</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-black">{stats.totalViews.toLocaleString()}</div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-black mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, i) => (
            <Card key={i} className={`border-l-4 ${action.color} hover:shadow-lg transition-all`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <action.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>
                    開始する
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
