'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Rocket, ArrowLeft, Sparkles, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

// Password strength calculator
const calculatePasswordStrength = (password: string): {
  score: number
  label: string
  color: string
  bgColor: string
  requirements: { met: boolean; text: string }[]
} => {
  const requirements = [
    { met: password.length >= 6, text: '6文字以上' },
    { met: password.length >= 8, text: '8文字以上（推奨）' },
    { met: /[A-Z]/.test(password), text: '大文字を含む' },
    { met: /[a-z]/.test(password), text: '小文字を含む' },
    { met: /[0-9]/.test(password), text: '数字を含む' },
    { met: /[^A-Za-z0-9]/.test(password), text: '特殊文字を含む' },
  ]

  const metCount = requirements.filter(r => r.met).length

  if (metCount <= 1) {
    return { score: 0, label: '非常に弱い', color: 'text-red-400', bgColor: 'bg-red-500', requirements }
  } else if (metCount <= 2) {
    return { score: 1, label: '弱い', color: 'text-orange-400', bgColor: 'bg-orange-500', requirements }
  } else if (metCount <= 4) {
    return { score: 2, label: '普通', color: 'text-yellow-400', bgColor: 'bg-yellow-500', requirements }
  } else if (metCount <= 5) {
    return { score: 3, label: '強い', color: 'text-green-400', bgColor: 'bg-green-500', requirements }
  } else {
    return { score: 4, label: '非常に強い', color: 'text-emerald-400', bgColor: 'bg-emerald-500', requirements }
  }
}

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = calculatePasswordStrength(password)

  if (!password) return null

  return (
    <div className="space-y-3 mt-3" role="status" aria-live="polite">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">パスワード強度</span>
          <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
        </div>
        <div className="flex gap-1" role="progressbar" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={4} aria-label={`パスワード強度: ${strength.label}`}>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.score ? strength.bgColor : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1" aria-label="パスワード要件">
        {strength.requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? 'text-green-400' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check className="w-3 h-3" aria-hidden="true" />
            ) : (
              <X className="w-3 h-3" aria-hidden="true" />
            )}
            <span>{req.text}</span>
            <span className="sr-only">{req.met ? '（達成）' : '（未達成）'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Chapiko Logo component
const ChapikoLogo = ({ className = '' }: { className?: string }) => (
  <div className={`font-bold tracking-tight ${className}`}>
    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Chapiko
    </span>
    <span className="text-gray-400 font-normal ml-1">Inc.</span>
  </div>
)

// Star field
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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            display_name: displayName || null,
            plan: 'free',
            generation_count: 0,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        toast.success('アカウントが作成されました')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
      <StarField count={150} />

      {/* Nebula effects */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          right: '-20%',
          top: '10%',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)',
          left: '-10%',
          bottom: '10%',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span>ホームに戻る</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <ChapikoLogo className="text-3xl justify-center flex mb-4" />
          <p className="text-gray-400 text-sm">市民データサイエンティスト量産計画</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium">無料で始められます</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">新規登録</h1>
            <p className="text-gray-400 text-sm">アカウントを作成して始めましょう</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-300">表示名（任意）</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="山田太郎"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-describedby="password-strength"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
              <div id="password-strength">
                <PasswordStrengthIndicator password={password} />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold py-5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  無料で始める
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">すでにアカウントをお持ちですか？</span>{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              ログインはこちら
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          登録することで、利用規約とプライバシーポリシーに同意したことになります。
        </p>
      </motion.div>
    </div>
  )
}
