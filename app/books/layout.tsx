import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'おすすめ書籍',
  description: 'データサイエンス、Python、AI、統計学を学ぶためのおすすめ書籍。初心者から上級者まで、レベル別に厳選した本を紹介します。',
  openGraph: {
    title: 'おすすめ書籍 | Chapiko AI',
    description: 'データサイエンス、Python、AIを学ぶためのおすすめ書籍',
    type: 'website',
  },
}

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
