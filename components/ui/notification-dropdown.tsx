'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Settings, X, BookOpen, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'new_course' | 'new_article' | 'comment' | 'system'
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

// 通知タイプに応じたアイコンを返す
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'new_course':
      return <BookOpen className="w-4 h-4 text-green-500" />
    case 'new_article':
      return <FileText className="w-4 h-4 text-blue-500" />
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-purple-500" />
    case 'system':
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

// 相対時間を計算
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function NotificationDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // デモ用のサンプル通知
      setNotifications([
        {
          id: '1',
          type: 'new_course',
          title: '新しいコースが追加されました',
          message: 'Python入門コースが公開されました',
          link: '/learning/python-intro',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30分前
        },
        {
          id: '2',
          type: 'new_article',
          title: '新しい記事が投稿されました',
          message: 'データ分析の基礎についての記事をチェックしてみましょう',
          link: '/blog/data-analysis-basics',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2時間前
        },
        {
          id: '3',
          type: 'system',
          title: 'システムメンテナンスのお知らせ',
          message: '明日の午前2時からメンテナンスを実施します',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1日前
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // UI上で即座に既読にする
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )

      // Supabaseを更新
      if (user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

      if (user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id))

      if (user) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      setOpen(false)
    }
  }

  if (!user) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">通知</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">通知</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                すべて既読
              </Button>
            )}
            <Link href="/admin/settings" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 通知リスト */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">通知はありません</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative group ${
                    !notification.is_read ? 'bg-green-50 dark:bg-green-900/10' : ''
                  }`}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <NotificationContent notification={notification} />
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          markAsRead(notification.id)
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="既読にする"
                      >
                        <Check className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="削除"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-center text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              すべての通知を見る
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 通知の内容コンポーネント
function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${
            notification.is_read
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-900 dark:text-white'
          }`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {getRelativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  )
}

// シンプルな通知ベルアイコン（ログインしていない場合用）
export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
      <Bell className="h-4 w-4 text-gray-400" />
      <span className="sr-only">通知</span>
    </Button>
  )
}
