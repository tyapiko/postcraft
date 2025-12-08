'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Brain,
  TrendingUp,
  Zap,
  Database,
  ChevronDown,
  Sparkles,
  BarChart,
  Bot,
  Code,
  LineChart,
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            DATA<span className="text-green-500">CRAFT</span>
          </Link>
          <div className="space-x-2">
            <Button variant="ghost" asChild className="text-black hover:text-green-500">
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              <Link href="/signup">無料で始める</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen bg-black text-white flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-12 gap-4 h-full w-full p-8">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                  className="border border-green-500/20"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-green-400 text-sm tracking-[0.3em] mb-6 font-medium">
              CITIZEN DATA SCIENTIST
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
              データで、<br />
              <span className="text-green-400">未来</span>を創る。
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
              エンジニアでなくても、データサイエンティストになれる。<br />
              AI時代の最強スキルを、あなたの手に。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-6 text-lg rounded-none transition-all"
              >
                <Link href="/signup">無料で始める</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white hover:bg-white hover:text-black px-8 py-6 text-lg rounded-none transition-all text-white"
              >
                <Link href="#features">詳しく見る</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm tracking-widest text-gray-500 block mb-2">SCROLL</span>
          <ChevronDown className="w-6 h-6 text-green-400 mx-auto" />
        </motion.div>
      </section>

      {/* What is Citizen Data Scientist */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm tracking-[0.3em] text-green-500 mb-4 font-medium">CONCEPT</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 text-black">
              市民データサイエンティストとは？
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              会社に一人はいる、エンジニアじゃないのにエンジニアレベルのITスキルとデータサイエンス力を持つ人。
              それが「市民データサイエンティスト（Citizen Data Scientist）」です。<br /><br />
              営業・マーケター・人事・経理など、あらゆる部門で「データを武器にできる人材」が求められています。
              私たちは、その育成と支援を行います。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, label: '対象者', text: '非エンジニア全般' },
              { icon: TrendingUp, label: '目標', text: 'データ活用人材' },
              { icon: Zap, label: '成果', text: '生産性10倍' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border-l-4 border-green-500 bg-gray-50 p-6"
              >
                <item.icon className="w-8 h-8 text-green-500 mb-4" />
                <h4 className="text-sm font-medium text-gray-500 mb-2">{item.label}</h4>
                <p className="text-xl font-bold text-black">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-black text-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm tracking-[0.3em] text-green-400 mb-4 font-medium">FEATURES</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">習得できるスキル</h3>
            <p className="text-xl text-gray-400">段階的に、確実に、データサイエンティストへ</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '01',
                icon: Bot,
                title: 'AI活用術',
                description: 'ChatGPT、Claude、Geminiなど生成AIを使いこなし、業務効率を劇的に改善'
              },
              {
                number: '02',
                icon: BarChart,
                title: 'データ分析',
                description: 'Excel→SQL→Python→機械学習へステップアップ。実務で使える分析力を習得'
              },
              {
                number: '03',
                icon: Zap,
                title: '業務自動化',
                description: 'RPAやスクリプトで単純作業を自動化。生産性を10倍に向上'
              },
              {
                number: '04',
                icon: LineChart,
                title: 'データ可視化',
                description: 'Tableau、PowerBIで説得力のあるダッシュボードを作成。意思決定を加速'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="text-green-400 text-5xl font-bold mb-4 opacity-50">{feature.number}</div>
                <feature.icon className="w-10 h-10 text-green-400 mb-4" />
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-green-400 text-sm font-medium">→ 詳しく見る</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm tracking-[0.3em] text-green-500 mb-4 font-medium">SKILLS</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-black">身につく技術スタック</h3>
          </motion.div>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              'Excel', 'Google Sheets', 'SQL', 'Python', 'R',
              'ChatGPT', 'Claude', 'Gemini', 'Tableau', 'Power BI',
              'Looker', 'Google Analytics', 'BigQuery', 'Snowflake',
              'Git', 'Docker', 'API連携', 'RPA', 'Notion', 'Slack'
            ].map((skill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="px-6 py-3 bg-white border border-gray-200 text-black font-medium hover:border-green-500 hover:text-green-500 transition-all cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm tracking-[0.3em] text-green-500 mb-4 font-medium">TOOLS</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-black">実践的なツール</h3>
            <p className="text-xl text-gray-600">学習だけでなく、実務で使えるツールを提供</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI投稿生成',
                description: 'SNS投稿をAIで自動生成。マーケティング業務を効率化',
                link: '/generate'
              },
              {
                icon: Database,
                title: 'データ管理',
                description: '生成したコンテンツをNotionに保存。一元管理で効率アップ',
                link: '/dashboard'
              },
              {
                icon: Brain,
                title: '学習リソース',
                description: '段階的なカリキュラムで、確実にスキルアップ',
                link: '/dashboard'
              }
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group border-l-4 border-green-500 bg-white p-8 hover:shadow-2xl transition-all duration-300"
              >
                <tool.icon className="w-12 h-12 text-green-500 mb-6" />
                <h4 className="text-xl font-bold mb-3 text-black">{tool.title}</h4>
                <p className="text-gray-600 mb-6">{tool.description}</p>
                <Link
                  href={tool.link}
                  className="text-green-500 font-medium inline-flex items-center group-hover:gap-2 transition-all"
                >
                  試してみる
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              今日から、<br className="md:hidden" />
              <span className="text-green-400">データサイエンティスト</span>へ
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              会社で一番頼られる存在になりませんか？<br />
              無料で今すぐ始められます。
            </p>
            <Button
              asChild
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-12 py-6 text-lg rounded-none transition-all"
            >
              <Link href="/signup">無料で始める</Link>
            </Button>
            <p className="text-sm text-gray-500 mt-6">クレジットカード不要 • 3分で登録完了</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-white mb-4 md:mb-0">
              DATA<span className="text-green-500">CRAFT</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <Link href="/login" className="hover:text-green-400 transition-colors">ログイン</Link>
              <Link href="/signup" className="hover:text-green-400 transition-colors">新規登録</Link>
              <Link href="/dashboard" className="hover:text-green-400 transition-colors">ダッシュボード</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-900 text-center text-sm text-gray-500">
            © 2024 DATACRAFT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
