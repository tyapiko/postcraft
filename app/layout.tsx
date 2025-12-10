import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { MotionProvider } from '@/components/motion-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Citizen DS - 市民データサイエンティスト育成プラットフォーム',
  description: 'データサイエンスとAIを学び、活用するためのプラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <MotionProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </MotionProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
