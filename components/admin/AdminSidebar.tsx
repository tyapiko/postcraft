'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Library,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

const menuItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'SNS投稿AI', icon: MessageSquare },
  { href: '/admin/blog', label: 'ブログ管理', icon: FileText },
  { href: '/admin/learning', label: 'E-ラーニング', icon: BookOpen },
  { href: '/admin/books', label: '書籍管理', icon: Library },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname?.startsWith(item.href + '/')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`bg-gray-900 dark:bg-gray-950 text-white min-h-screen flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* ヘッダー */}
        <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 text-green-400 font-bold text-xl hover:text-green-300 transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span>Admin</span>
              <ExternalLink size={14} />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
            aria-label={collapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const active = isActive(item)
            const linkContent = (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-green-500 text-black font-semibold shadow-lg shadow-green-500/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* フッター */}
        <div className={`p-4 border-t border-gray-800 space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {/* テーマ切り替え */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
            {!collapsed && <span className="text-sm text-gray-400">テーマ</span>}
            <ThemeToggle />
          </div>

          {/* ログアウト */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
                >
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                ログアウト
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-gray-800"
            >
              <LogOut size={20} className="mr-3" />
              ログアウト
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
