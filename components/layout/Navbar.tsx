'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeToggleSimple } from '@/components/ui/theme-toggle'
import { SearchDialog, SearchTrigger } from '@/components/ui/search-dialog'
import { NotificationDropdown } from '@/components/ui/notification-dropdown'

const navItems = [
  { href: '/blog', label: 'Blog' },
  { href: '/learning', label: 'Learning' },
  { href: '/books', label: 'Books' },
  { href: '/generate', label: 'AI Generator' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')
  const isDark = mounted && resolvedTheme === 'dark'

  // ダークモード時やスクロール時のテキスト色
  const getTextColor = (active: boolean, scrolled: boolean) => {
    if (active) return 'text-green-500'
    if (scrolled || isDark) return 'text-white hover:text-green-400'
    return 'text-black dark:text-white hover:text-green-500'
  }

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent dark:bg-transparent'
      }`}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className={`font-bold text-xl transition-colors ${
              isScrolled || isDark ? 'text-white' : 'text-black dark:text-white'
            }`}>
              Citizen DS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors font-medium relative ${getTextColor(isActive(item.href), isScrolled)}`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <SearchTrigger onClick={() => setIsSearchOpen(true)} />
            <ThemeToggleSimple />
            <NotificationDropdown />
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={isScrolled || isDark ? 'text-white hover:text-green-400 hover:bg-white/10' : 'text-black hover:text-green-500 dark:text-white'}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={isScrolled || isDark ? 'text-white hover:text-green-400 hover:bg-white/10' : 'text-black hover:text-green-500 dark:text-white'}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleSimple />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled || isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5 dark:text-white'
              }`}
              aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-black/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 px-4 rounded-lg transition-all duration-200 transform ${
                  isActive(item.href)
                    ? 'bg-green-500 text-white'
                    : 'text-white hover:bg-white/10'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
              {user ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10 justify-start">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10 justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* 検索ダイアログ */}
    <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
