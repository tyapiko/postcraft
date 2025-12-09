'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  LineChart,
  Target,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Library,
  Wand2,
  Rocket,
  Terminal,
  Cpu,
  Binary,
  Users,
  Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/books', label: 'Books', icon: Library },
  { href: '/generate', label: 'AI Generator', icon: Wand2 },
]

// Star component for the starfield
const StarField = ({ count = 150 }: { count?: number }) => {
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
    <div className="absolute inset-0 overflow-hidden">
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

// Shooting star component
const ShootingStars = () => {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const stars = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 50,
      delay: i * 3 + Math.random() * 2,
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
            boxShadow: '0 0 6px 2px rgba(255,255,255,0.8), -30px 0 20px rgba(255,255,255,0.4), -60px 0 30px rgba(255,255,255,0.2)',
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
            repeatDelay: 8 + Math.random() * 5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Nebula/Galaxy cloud effect
const NebulaEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
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
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)',
          right: '-10%',
          top: '20%',
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
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(34,211,238,0.1) 40%, transparent 70%)',
          left: '30%',
          bottom: '-20%',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// Sun component with corona effect
const Sun = () => {
  return (
    <motion.div
      className="absolute hidden md:block"
      style={{ right: '8%', top: '18%' }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute inset-0 w-28 h-28 lg:w-36 lg:h-36 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,146,60,0.2) 40%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translate(-25%, -25%) scale(2)',
        }}
      />
      <motion.div
        className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #fef08a 0%, #fbbf24 30%, #f59e0b 60%, #d97706 100%)',
          boxShadow: '0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,146,60,0.4)',
        }}
        animate={{
          boxShadow: [
            '0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,146,60,0.4)',
            '0 0 80px rgba(251,191,36,0.8), 0 0 150px rgba(251,146,60,0.5)',
            '0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,146,60,0.4)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

// Moon component with craters
const Moon = () => {
  return (
    <motion.div
      className="absolute hidden md:block"
      style={{ left: '10%', top: '25%' }}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(226,232,240,0.3) 0%, transparent 70%)',
          filter: 'blur(15px)',
          transform: 'translate(-25%, -25%) scale(1.5)',
        }}
      />
      <div
        className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #f1f5f9 0%, #cbd5e1 40%, #94a3b8 80%, #64748b 100%)',
          boxShadow: '0 0 30px rgba(226,232,240,0.4)',
        }}
      >
        <div className="absolute w-2 h-2 rounded-full bg-slate-400/50 top-2 left-3" />
        <div className="absolute w-3 h-3 rounded-full bg-slate-400/40 top-6 right-2" />
        <div className="absolute w-2 h-2 rounded-full bg-slate-400/50 bottom-3 left-5" />
      </div>
    </motion.div>
  )
}

// Planet component (Saturn-like with rings)
const Planet = () => {
  return (
    <motion.div
      className="absolute hidden lg:block"
      style={{ right: '12%', bottom: '15%' }}
      animate={{
        y: [0, 20, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute inset-0 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translate(-10%, -10%) scale(1.5)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-40 h-8 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.4) 20%, rgba(139,92,246,0.6) 50%, rgba(167,139,250,0.4) 80%, transparent 100%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) rotateX(75deg)',
        }}
      />
      <div
        className="relative w-24 h-24 rounded-full z-10"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #c4b5fd 0%, #a78bfa 30%, #8b5cf6 60%, #7c3aed 100%)',
          boxShadow: '0 0 40px rgba(139,92,246,0.4)',
        }}
      />
    </motion.div>
  )
}

// Tech grid overlay
const TechGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

// Floating code snippets
const FloatingCode = () => {
  const codeSnippets = [
    'SELECT * FROM data',
    'import pandas as pd',
    'def analyze():',
    'model.fit(X, y)',
    'GROUP BY category',
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
      {codeSnippets.map((code, i) => (
        <motion.div
          key={i}
          className="absolute text-xs font-mono text-cyan-400/20 whitespace-nowrap"
          style={{
            left: `${10 + (i * 18)}%`,
            top: `${25 + (i * 12)}%`,
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: [0, 0.3, 0],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 10,
            delay: i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {code}
        </motion.div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0a1a]/90 backdrop-blur-xl shadow-lg shadow-purple-500/10 border-b border-purple-500/20'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/chapiko-logo.png"
              alt="Chapiko株式会社"
              width={144}
              height={47}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium transition-all flex items-center gap-2 text-gray-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
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
              className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10"
            >
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
              <Link href="/signup">
                <Rocket className="w-4 h-4 mr-2" />
                無料で始める
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
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
              className="md:hidden bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-purple-500/20"
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
                      className="flex items-center gap-3 py-3 px-4 text-white hover:bg-purple-500/20 rounded-lg transition-colors"
                    >
                      <item.icon size={20} className="text-cyan-400" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-purple-500/20 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-purple-500/20 justify-start">
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold">
                      <Rocket className="w-4 h-4 mr-2" />
                      無料で始める
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen text-white flex items-center overflow-hidden">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />

        {/* Effects */}
        <StarField count={200} />
        <ShootingStars />
        <NebulaEffect />

        {/* Celestial bodies */}
        <Sun />
        <Moon />
        <Planet />

        {/* Tech elements */}
        <TechGrid />
        <FloatingCode />

        {/* Radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 container mx-auto px-6 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8 backdrop-blur-sm"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-purple-300 text-sm tracking-wide font-medium">
                市民データサイエンティスト量産計画
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                データの宇宙へ
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                旅立とう
              </span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
              市民データサイエンティストを量産し、
              <br className="hidden sm:block" />
              <span className="text-cyan-400">すべてのビジネスパーソン</span>をデータ人材へ。
            </p>

            {/* Stats bar */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">非エンジニア向け</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400">AI/データ分析</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-pink-400" />
                <span className="text-gray-400">実務で即活用</span>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold px-8 py-6 text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  無料で始める
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/20 px-8 py-6 text-lg transition-all text-white bg-transparent"
              >
                <Link href="#features">詳しく見る</Link>
              </Button>
            </div>

            {/* Quick Links */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {[
                { href: '/learning', icon: GraduationCap, label: '学習コース' },
                { href: '/blog', icon: BookOpen, label: 'ブログ記事' },
                { href: '/books', icon: Library, label: '書籍' },
                { href: '/generate', icon: Wand2, label: 'AI生成ツール' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                >
                  <item.icon size={14} className="text-cyan-400" />
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator - clickable */}
        <motion.button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center cursor-pointer group"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-purple-400 group-hover:text-cyan-400 transition-colors" />
        </motion.button>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 md:py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20" />
        <TechGrid />

        <div className="relative z-10 container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/chapiko-logo.png"
                alt="Chapiko株式会社"
                width={200}
                height={66}
                className="h-12 md:h-16 w-auto"
              />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              私たちは<span className="text-cyan-400 font-semibold">市民データサイエンティスト</span>を量産することで、
              <br className="hidden md:block" />
              すべての企業のDX推進と、個人のキャリアアップを支援します。
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is Citizen Data Scientist */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#0a0a1a]" />
        <StarField count={50} />

        <div className="relative z-10 container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Binary className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm tracking-[0.3em] text-cyan-400 font-medium">CONCEPT</h2>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              市民データサイエンティストとは？
            </h3>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12">
              会社に一人はいる、エンジニアじゃないのにエンジニアレベルのITスキルとデータサイエンス力を持つ人。
              それが「市民データサイエンティスト（Citizen Data Scientist）」です。
              <br /><br />
              営業・マーケター・人事・経理など、あらゆる部門で「データを武器にできる人材」が求められています。
              <span className="text-cyan-400 font-semibold">私たちは、その人材を量産します。</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, label: '対象者', text: '非エンジニア全般', color: 'purple' },
              { icon: TrendingUp, label: '目標', text: '市民DS量産', color: 'cyan' },
              { icon: Zap, label: '成果', text: '生産性10倍', color: 'pink' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg hover:border-purple-500/50 transition-all">
                  <item.icon className={`w-8 h-8 mb-4 ${
                    item.color === 'purple' ? 'text-purple-400' :
                    item.color === 'cyan' ? 'text-cyan-400' : 'text-pink-400'
                  }`} />
                  <h4 className="text-sm font-medium text-gray-400 mb-2">{item.label}</h4>
                  <p className="text-xl font-bold text-white">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2a] to-[#0a0a1a]" />
        <StarField count={80} />
        <NebulaEffect />

        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm tracking-[0.3em] text-cyan-400 font-medium">FEATURES</h2>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              習得できるスキル
            </h3>
            <p className="text-lg md:text-xl text-gray-400">段階的に、確実に、市民データサイエンティストへ</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '01',
                icon: Bot,
                title: 'AI活用術',
                description: 'ChatGPT、Claude、Geminiなど生成AIを使いこなし、業務効率を劇的に改善',
                color: '#a855f7'
              },
              {
                number: '02',
                icon: BarChart,
                title: 'データ分析',
                description: 'Excel→SQL→Python→機械学習へステップアップ。実務で使える分析力を習得',
                color: '#22d3ee'
              },
              {
                number: '03',
                icon: Zap,
                title: '業務自動化',
                description: 'RPAやスクリプトで単純作業を自動化。生産性を10倍に向上',
                color: '#eab308'
              },
              {
                number: '04',
                icon: LineChart,
                title: 'データ可視化',
                description: 'Tableau、PowerBIで説得力のあるダッシュボードを作成。意思決定を加速',
                color: '#22c55e'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-xl hover:border-purple-500/50 transition-all duration-300 h-full">
                  <div className="text-4xl md:text-5xl font-bold mb-4 opacity-30" style={{ color: feature.color }}>
                    {feature.number}
                  </div>
                  <feature.icon className="w-8 h-8 md:w-10 md:h-10 mb-4" style={{ color: feature.color }} />
                  <h4 className="text-lg md:text-xl font-bold mb-3 text-white">{feature.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0a1a2a] to-[#0a0a1a]" />
        <StarField count={60} />
        <TechGrid />

        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm tracking-[0.3em] text-cyan-400 font-medium">TECH STACK</h2>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              身につく技術スタック
            </h3>
          </motion.div>

          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
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
                className="px-4 md:px-6 py-2 md:py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 font-medium rounded-full hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-default font-mono text-xs md:text-sm"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <StarField count={70} />

        <div className="relative z-10 container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm tracking-[0.3em] text-cyan-400 font-medium">TOOLS</h2>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              実践的なツール
            </h3>
            <p className="text-lg md:text-xl text-gray-400">学習だけでなく、実務で使えるツールを提供</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI投稿生成',
                description: 'SNS投稿をAIで自動生成。マーケティング業務を効率化',
                link: '/generate',
                gradient: 'from-pink-500 to-purple-500'
              },
              {
                icon: Database,
                title: 'データ管理',
                description: '生成したコンテンツをNotionに保存。一元管理で効率アップ',
                link: '/dashboard',
                gradient: 'from-cyan-500 to-blue-500'
              },
              {
                icon: Brain,
                title: '学習リソース',
                description: '段階的なカリキュラムで、確実にスキルアップ',
                link: '/learning',
                gradient: 'from-purple-500 to-cyan-500'
              }
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-xl hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-r ${tool.gradient} p-3 mb-6`}>
                    <tool.icon className="w-full h-full text-white" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold mb-3 text-white">{tool.title}</h4>
                  <p className="text-gray-400 mb-6 flex-grow">{tool.description}</p>
                  <Link
                    href={tool.link}
                    className="text-cyan-400 font-medium inline-flex items-center hover:text-cyan-300 transition-colors"
                  >
                    試してみる
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2a] to-[#0a0a1a]" />
        <StarField count={100} />
        <NebulaEffect />

        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.3) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <Rocket className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                今日から、
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                市民データサイエンティストへ
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              データを武器に、キャリアを加速させよう。
              <br />
              無料で今すぐ始められます。
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold px-10 md:px-12 py-6 text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
            >
              <Link href="/signup" className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                無料で始める
              </Link>
            </Button>
            <p className="text-sm text-gray-500 mt-6">クレジットカード不要 • 3分で登録完了</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 md:py-16 px-6 overflow-hidden border-t border-purple-500/20">
        <div className="absolute inset-0 bg-[#0a0a1a]" />
        <StarField count={30} />

        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Image
                  src="/chapiko-logo.png"
                  alt="Chapiko株式会社"
                  width={160}
                  height={52}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                市民データサイエンティストを量産し、
                すべてのビジネスパーソンをデータ人材へ。
              </p>
            </div>

            {/* Content */}
            <div>
              <h4 className="text-white font-semibold mb-4">Content</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <BookOpen size={14} />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/learning" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <GraduationCap size={14} />
                    Learning
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
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
                  <Link href="/generate" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Wand2 size={14} />
                    AI Generator
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
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
                  <Link href="/login" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 Chapiko Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-cyan-400 transition-colors">プライバシーポリシー</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">利用規約</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
