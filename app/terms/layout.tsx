import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'Chapiko AIの利用規約。サービスのご利用に関する条件を説明します。',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
