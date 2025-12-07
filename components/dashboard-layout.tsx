'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, History, Settings, LogOut, Menu, X } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('ログアウトしました')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: Sparkles },
    { href: '/generate', label: '生成する', icon: Sparkles },
    { href: '/history', label: '履歴', icon: History },
    { href: '/settings', label: '設定', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-muted/40">
        <div className="p-6 border-b">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Postcraft
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b p-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            Postcraft
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-muted/40">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </nav>
          </div>
        )}

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}