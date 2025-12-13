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
  title: {
    default: 'Chapiko AI - AIとデータサイエンスで未来を創る',
    template: '%s | Chapiko AI',
  },
  description: 'Chapiko AIは、データサイエンスとAIを学び、ビジネスに活用するためのプラットフォームです。実践的なコース、AI搭載のコンテンツ生成ツール、コミュニティ機能を提供します。',
  keywords: ['データサイエンス', 'AI', '機械学習', 'Python', 'ビジネスインテリジェンス', 'オンライン学習', 'LMS'],
  authors: [{ name: 'Chapiko Inc.' }],
  creator: 'Chapiko Inc.',
  publisher: 'Chapiko Inc.',
  metadataBase: new URL('https://chapiko-ai.com'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://chapiko-ai.com',
    siteName: 'Chapiko AI',
    title: 'Chapiko AI - AIとデータサイエンスで未来を創る',
    description: 'データサイエンスとAIを学び、ビジネスに活用するためのプラットフォーム',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chapiko AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chapiko AI - AIとデータサイエンスで未来を創る',
    description: 'データサイエンスとAIを学び、ビジネスに活用するためのプラットフォーム',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
