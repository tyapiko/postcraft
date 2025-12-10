'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideNavAndFooter = pathname === '/' ||
                           pathname?.startsWith('/admin') ||
                           pathname?.startsWith('/dashboard') ||
                           pathname?.startsWith('/generate') ||
                           pathname === '/login' ||
                           pathname === '/signup' ||
                           pathname?.startsWith('/settings') ||
                           pathname?.startsWith('/history') ||
                           pathname === '/blog' ||
                           pathname === '/learning' ||
                           pathname === '/books' ||
                           pathname === '/privacy' ||
                           pathname === '/terms'

  if (hideNavAndFooter) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <div className="pt-16">
        {children}
      </div>
      <Footer />
    </>
  )
}