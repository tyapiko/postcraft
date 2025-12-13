import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'Chapiko AIにログインして、データサイエンスとAIの学習を続けましょう。',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
