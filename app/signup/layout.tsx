import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録',
  description: 'Chapiko AIに無料登録して、データサイエンスとAIの学習を始めましょう。',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
