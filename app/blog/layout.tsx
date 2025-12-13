import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ブログ',
  description: 'データサイエンス、AI、機械学習に関する最新の記事やチュートリアル。実践的なテクニックとビジネス活用事例を解説します。',
  openGraph: {
    title: 'ブログ | Chapiko AI',
    description: 'データサイエンス、AI、機械学習に関する最新の記事やチュートリアル',
    type: 'website',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
