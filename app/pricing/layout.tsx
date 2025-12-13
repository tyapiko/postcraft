import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '料金プラン',
  description: 'Chapiko AIの料金プラン。無料プランから始めて、ビジネスニーズに合わせてアップグレード。AIコンテンツ生成、LMS機能、チーム管理など。',
  openGraph: {
    title: '料金プラン | Chapiko AI',
    description: '無料プランから始めて、ビジネスニーズに合わせてアップグレード',
    type: 'website',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
