'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check, CheckCheck, Trash2, Filter, BookOpen, FileText, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { InlineLoader } from '@/components/ui/loading-skeleton'

interface Notification {
  id: string
  type: 'new_course' | 'new_article' | 'comment' | 'system'
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

type FilterType = 'all' | 'unread' | 'new_course' | 'new_article' | 'comment' | 'system'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'new_course':
      return <BookOpen className="w-5 h-5 text-green-500" />
    case 'new_article':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'comment':
      return <MessageSquare className="w-5 h-5 text-purple-500" />
    case 'system':
      return <AlertCircle className="w-5 h-5 text-orange-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

function getTypeLabel(type: Notification['type']) {
  switch (type) {
    case 'new_course':
      return 'コース'
    case 'new_article':
      return '記事'
    case 'comment':
      return 'コメント'
    case 'system':
      return 'システム'
    default:
      return '通知'
  }
}

function getTypeBadgeClass(type: Notification['type']) {
  switch (type) {
    case 'new_course':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
    case 'new_article':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    case 'comment':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
    case 'system':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨日'
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else {
    return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchNotifications()
    }
  }, [user, authLoading, router])

  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // デモ用のサンプルデータ
      setNotifications([
        {
          id: '1',
          type: 'new_course',
          title: '新しいコースが追加されました',
          message: 'Python入門コースが公開されました。今すぐ学習を始めましょう！',
          link: '/learning/python-intro',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          type: 'new_article',
          title: '新しい記事が投稿されました',
          message: 'データ分析の基礎についての記事をチェックしてみましょう。初心者にもわかりやすく解説しています。',
          link: '/blog/data-analysis-basics',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '3',
          type: 'comment',
          title: 'あなたの記事にコメントが付きました',
          message: '田中さんがあなたの記事「Pythonで始めるデータ分析」にコメントしました。',
          link: '/blog/python-data-analysis#comments',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
        },
        {
          id: '4',
          type: 'system',
          title: 'システムメンテナンスのお知らせ',
          message: '明日の午前2時から午前4時までメンテナンスを実施します。この間、サービスをご利用いただけません。',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: '5',
          type: 'new_course',
          title: 'コースが更新されました',
          message: '機械学習入門コースに新しいレッスンが追加されました。',
          link: '/learning/ml-intro',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )

    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)
    }
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))

    if (user) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    }
  }

  const deleteAllRead = async () => {
    const readIds = notifications.filter(n => n.is_read).map(n => n.id)
    setNotifications(prev => prev.filter(n => !n.is_read))

    if (user && readIds.length > 0) {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.is_read
    return notification.type === filter
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <InlineLoader text="通知を読み込み中..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">通知</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : 'すべての通知を確認済みです'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="dark:border-gray-600"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  すべて既読
                </Button>
              )}
              {notifications.some(n => n.is_read) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAllRead}
                  className="dark:border-gray-600 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  既読を削除
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">フィルター</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all' as FilterType, label: 'すべて' },
              { value: 'unread' as FilterType, label: '未読' },
              { value: 'new_course' as FilterType, label: 'コース' },
              { value: 'new_article' as FilterType, label: '記事' },
              { value: 'comment' as FilterType, label: 'コメント' },
              { value: 'system' as FilterType, label: 'システム' },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={filter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(value)}
                className={filter === value ? 'bg-green-500 hover:bg-green-600' : 'dark:border-gray-600'}
              >
                {label}
                {value === 'unread' && unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* 通知リスト */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              通知はありません
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {filter !== 'all' ? '選択したフィルターに一致する通知がありません' : '新しい通知が届くとここに表示されます'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group ${
                  !notification.is_read ? 'bg-green-50 dark:bg-green-900/10' : ''
                }`}
              >
                {notification.link ? (
                  <Link
                    href={notification.link}
                    onClick={() => markAsRead(notification.id)}
                    className="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <NotificationItem notification={notification} />
                  </Link>
                ) : (
                  <div className="p-4 sm:p-6">
                    <NotificationItem notification={notification} />
                  </div>
                )}

                {/* アクションボタン */}
                <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                      className="h-8 w-8"
                      title="既読にする"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-medium ${
                notification.is_read
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {notification.title}
              </h3>
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
              <Badge className={`${getTypeBadgeClass(notification.type)} text-xs`}>
                {getTypeLabel(notification.type)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {formatDate(notification.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
