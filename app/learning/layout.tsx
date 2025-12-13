import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'コース一覧',
  description: 'データサイエンス、Python、AI、機械学習のオンラインコース。初心者から上級者まで、実践的なスキルを身につけられます。',
  openGraph: {
    title: 'コース一覧 | Chapiko AI',
    description: 'データサイエンス、Python、AIのオンラインコース',
    type: 'website',
  },
}

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
