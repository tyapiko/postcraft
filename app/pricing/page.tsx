'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  Sparkles,
  Rocket,
  Crown,
  Star,
  Zap,
  Users,
  BookOpen,
  GraduationCap,
  BarChart,
  Shield,
  ArrowRight,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, PlanType } from '@/lib/plans'
import { useAuth } from '@/lib/auth-context'

// Star Field Background
const StarField = ({ count = 100 }: { count?: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Nebula Effect
const NebulaEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
          left: '-20%',
          top: '-10%',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(34,211,238,0.1) 40%, transparent 70%)',
          right: '-10%',
          bottom: '10%',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// Shooting Stars
const ShootingStars = () => {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const stars = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 30,
      delay: i * 4 + Math.random() * 2,
    }))
    setShootingStars(stars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            boxShadow: '0 0 6px 2px rgba(255,255,255,0.8), -30px 0 20px rgba(255,255,255,0.4)',
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, 200],
            y: [0, 100],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 10,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Plan Card Component
const PlanCard = ({
  planId,
  isPopular = false,
  currentPlan = null
}: {
  planId: PlanType
  isPopular?: boolean
  currentPlan?: PlanType | null
}) => {
  const plan = PLANS[planId]
  const isCurrentPlan = currentPlan === planId

  const getIcon = () => {
    switch (planId) {
      case 'free': return Star
      case 'pro': return Zap
      case 'enterprise': return Crown
    }
  }

  const Icon = getIcon()

  const getBorderColor = () => {
    if (isCurrentPlan) return 'border-green-500/50'
    if (isPopular) return 'border-cyan-500/50'
    return 'border-white/10'
  }

  const getGradient = () => {
    switch (planId) {
      case 'free': return 'from-gray-500 to-gray-600'
      case 'pro': return 'from-cyan-500 to-blue-600'
      case 'enterprise': return 'from-purple-500 to-pink-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative group h-full`}
    >
      {/* Glow effect for popular plan */}
      {isPopular && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
      )}

      <div className={`relative h-full bg-white/5 backdrop-blur-sm border-2 ${getBorderColor()} rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 hover:border-purple-500/50`}>
        {/* Badge */}
        {(plan.badge || isCurrentPlan) && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className={`px-4 py-1 rounded-full text-xs font-bold ${
              isCurrentPlan
                ? 'bg-green-500 text-white'
                : plan.badge?.color === 'cyan'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-purple-500 text-white'
            }`}>
              {isCurrentPlan ? '現在のプラン' : plan.badge?.text}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${getGradient()} mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
          <p className="text-gray-400 text-sm">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl md:text-5xl font-bold text-white">
              {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-400">/月</span>
            )}
          </div>
          {plan.price > 0 && (
            <p className="text-xs text-gray-500 mt-1">税込</p>
          )}
        </div>

        {/* Features */}
        <div className="flex-grow mb-6">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              feature === '---' ? (
                <li key={index} className="border-t border-white/10 my-4" />
              ) : (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              )
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          {isCurrentPlan ? (
            <Button
              disabled
              className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
            >
              現在のプラン
            </Button>
          ) : (
            <Button
              asChild
              className={`w-full font-semibold ${
                planId === 'free'
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : `bg-gradient-to-r ${getGradient()} hover:opacity-90 text-white`
              }`}
            >
              <Link href={planId === 'free' ? '/signup' : `/signup?plan=${planId}`}>
                {planId === 'free' ? '無料で始める' : 'このプランを選択'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// FAQ Item
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-gray-400">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

export default function PricingPage() {
  const { user, plan } = useAuth()
  const currentPlan: PlanType | null = user ? plan : null

  const faqs = [
    {
      question: '無料プランでは何ができますか？',
      answer: '無料プランでは、公開されているコース・レッスンの受講、ブログ記事や書籍紹介の閲覧、AI投稿生成（月10回まで）が可能です。市民データサイエンティストへの第一歩を踏み出すのに最適です。'
    },
    {
      question: 'プロプランのLMS管理機能とは？',
      answer: 'プロプラン以上では、自社用のコース・レッスンを作成し、最大50名の受講者を管理できます。受講者の進捗確認やアセスメント結果の確認など、企業研修や社内教育に必要な機能が揃っています。'
    },
    {
      question: 'プランの変更はいつでもできますか？',
      answer: 'はい、いつでもプランの変更が可能です。アップグレードの場合は即座に新機能が使えるようになります。ダウングレードの場合は、次回請求日から新しいプランが適用されます。'
    },
    {
      question: '支払い方法は何がありますか？',
      answer: 'クレジットカード（Visa、Mastercard、American Express）でのお支払いに対応しています。請求書払いをご希望の場合は、エンタープライズプランでお問い合わせください。'
    },
    {
      question: '解約はいつでもできますか？',
      answer: 'はい、いつでも解約可能です。解約後も、お支払い済みの期間中はサービスをご利用いただけます。データはエクスポート機能（エンタープライズプラン）でダウンロードできます。'
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <StarField count={150} />
        <ShootingStars />
        <NebulaEffect />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-purple-500/20 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Chapiko
            </span>
            <span className="text-gray-400 font-normal ml-1">Inc.</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
                <Link href="/dashboard">ダッシュボード</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
                  <Link href="/login">ログイン</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                  <Link href="/signup">
                    <Rocket className="w-4 h-4 mr-2" />
                    無料で始める
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-purple-300 text-sm">シンプルな料金体系</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                宇宙の無数の星の中でも
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                光る人になろう
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              あなたに最適なプランを選んで、
              <br className="hidden sm:block" />
              市民データサイエンティストへの旅を始めましょう
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <PlanCard planId="free" currentPlan={currentPlan} />
            <PlanCard planId="pro" isPopular currentPlan={currentPlan} />
            <PlanCard planId="enterprise" currentPlan={currentPlan} />
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              プラン比較
            </h2>
            <p className="text-gray-400">
              各プランの機能を詳しく比較
            </p>
          </motion.div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">機能</th>
                    <th className="p-4 text-center text-white font-medium">Free</th>
                    <th className="p-4 text-center text-cyan-400 font-medium">Pro</th>
                    <th className="p-4 text-center text-purple-400 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'コース受講', free: '公開のみ', pro: '全て', enterprise: '全て' },
                    { feature: 'AI投稿生成', free: '10回/月', pro: '100回/月', enterprise: '無制限' },
                    { feature: 'アセスメントテスト', free: false, pro: true, enterprise: true },
                    { feature: '修了証発行', free: false, pro: true, enterprise: true },
                    { feature: 'LMS管理機能', free: false, pro: true, enterprise: true },
                    { feature: '受講者管理', free: '-', pro: '50名まで', enterprise: '無制限' },
                    { feature: '進捗レポート', free: false, pro: true, enterprise: true },
                    { feature: 'データエクスポート', free: false, pro: false, enterprise: true },
                    { feature: 'カスタムブランディング', free: false, pro: false, enterprise: true },
                    { feature: '優先サポート', free: false, pro: false, enterprise: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-gray-600">-</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{row.free}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? <Check className="w-5 h-5 text-cyan-400 mx-auto" /> : <span className="text-gray-600">-</span>
                        ) : (
                          <span className="text-cyan-400 text-sm">{row.pro}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <Check className="w-5 h-5 text-purple-400 mx-auto" /> : <span className="text-gray-600">-</span>
                        ) : (
                          <span className="text-purple-400 text-sm">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              よくある質問
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                今すぐ始めよう
              </span>
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              無料プランで始めて、必要に応じてアップグレード
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-lg px-8 py-6"
            >
              <Link href="/signup">
                <Rocket className="w-5 h-5 mr-2" />
                無料で始める
              </Link>
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              クレジットカード不要 • 3分で登録完了
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-purple-500/20">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Chapiko Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">利用規約</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
