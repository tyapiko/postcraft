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
  Target,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Library,
  Wand2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/books', label: 'Books', icon: Library },
  { href: '/generate', label: 'AI Generator', icon: Wand2 },
]

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className={isScrolled ? 'text-white' : 'text-white'}>DATA</span>
            <span className="text-green-500">CRAFT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isScrolled
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className={isScrolled
                ? 'text-white hover:text-green-400 hover:bg-white/10'
                : 'text-white hover:text-green-400 hover:bg-white/10'
              }
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-green-500 hover:bg-green-400 text-black font-semibold">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
            >
              <div className="container mx-auto px-6 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <item.icon size={20} className="text-green-400" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10 justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/learning"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                <GraduationCap size={16} className="text-green-400" />
                学習コース
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                <BookOpen size={16} className="text-green-400" />
                ブログ記事
              </Link>
              <Link
                href="/books"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                <Library size={16} className="text-green-400" />
                書籍
              </Link>
              <Link
                href="/generate"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                <Wand2 size={16} className="text-green-400" />
                AI生成ツール
              </Link>
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
      <footer className="py-16 px-6 bg-black border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold text-white mb-4">
                DATA<span className="text-green-500">CRAFT</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Citizen Data Scientistを育成し、
                データドリブンな意思決定を支援します。
              </p>
            </div>

            {/* Content */}
            <div>
              <h4 className="text-white font-semibold mb-4">Content</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <BookOpen size={14} />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/learning" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <GraduationCap size={14} />
                    Learning
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <Library size={14} />
                    Books
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-white font-semibold mb-4">Tools</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/generate" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <Wand2 size={14} />
                    AI Generator
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <Database size={14} />
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-green-400 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-green-400 transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 DATACRAFT. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-green-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
