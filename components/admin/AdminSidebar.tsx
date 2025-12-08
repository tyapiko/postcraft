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
  LogOut
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

const menuItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'SNS投稿AI', icon: MessageSquare },
  { href: '/admin/blog', label: 'ブログ管理', icon: FileText },
  { href: '/admin/learning', label: 'E-ラーニング', icon: BookOpen },
  { href: '/admin/books', label: '書籍管理', icon: Library },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-green-400 font-bold text-xl">
          CDS Admin
          <ExternalLink size={14} />
        </Link>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition ${
                isActive
                  ? 'bg-green-500 text-black font-semibold'
                  : 'hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-gray-800"
        >
          <LogOut size={20} className="mr-3" />
          ログアウト
        </Button>
      </div>
    </aside>
  )
}
