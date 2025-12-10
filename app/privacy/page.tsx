'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Mail, Globe, ArrowLeft, Twitter, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

// Chapiko Logo component
const ChapikoLogo = ({ className = '' }: { className?: string }) => (
  <div className={`font-bold tracking-tight ${className}`}>
    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Chapiko
    </span>
    <span className="text-gray-400 font-normal ml-1">Inc.</span>
  </div>
)

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Background stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ChapikoLogo className="text-xl md:text-2xl" />
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">ホーム</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">プライバシーポリシー</h1>
            <p className="text-slate-400">最終更新日: 2024年12月1日</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 space-y-8">

              {/* Introduction */}
              <section>
                <p className="text-slate-300 leading-relaxed">
                  Postcraft（以下「当サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。
                  本プライバシーポリシーは、当サービスがどのような情報を収集し、どのように利用・保護するかについて説明します。
                </p>
              </section>

              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">1. 収集する情報</h2>
                </div>
                <div className="pl-8 space-y-4 text-slate-300">
                  <div>
                    <h3 className="text-white font-medium mb-2">1.1 アカウント情報</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>メールアドレス</li>
                      <li>表示名（任意）</li>
                      <li>パスワード（暗号化して保存）</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">1.2 利用情報</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>コース受講履歴・進捗状況</li>
                      <li>クイズ回答データ</li>
                      <li>コンテンツ生成履歴</li>
                      <li>アクセスログ（IPアドレス、ブラウザ情報）</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">2. 情報の利用目的</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>サービスの提供・改善</li>
                    <li>ユーザー認証・アカウント管理</li>
                    <li>学習進捗の記録・表示</li>
                    <li>カスタマーサポートの提供</li>
                    <li>サービスに関する重要なお知らせの送信</li>
                    <li>不正利用の防止</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">3. 情報の保護</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p className="mb-2">当サービスは、以下の方法でお客様の情報を保護します：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>SSL/TLS暗号化通信の使用</li>
                    <li>パスワードのハッシュ化保存</li>
                    <li>アクセス権限の適切な管理</li>
                    <li>定期的なセキュリティ監査</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">4. 第三者への提供</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p className="mb-2">以下の場合を除き、個人情報を第三者に提供することはありません：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>ユーザーの同意がある場合</li>
                    <li>法令に基づく開示要求があった場合</li>
                    <li>サービス提供に必要な業務委託先（データ保護契約締結済み）</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">5. Cookieの使用</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p>
                    当サービスは、ユーザー体験の向上のためにCookieを使用します。
                    Cookieはブラウザの設定で無効にすることができますが、一部の機能が制限される場合があります。
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">6. ユーザーの権利</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p className="mb-2">ユーザーは以下の権利を有します：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>個人情報の開示・訂正・削除の請求</li>
                    <li>アカウントの削除</li>
                    <li>マーケティングメールの配信停止</li>
                  </ul>
                  <p className="mt-2">
                    これらの権利を行使する場合は、下記のお問い合わせ先までご連絡ください。
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">7. プライバシーポリシーの変更</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p>
                    当サービスは、必要に応じて本ポリシーを変更することがあります。
                    重要な変更がある場合は、サービス上で通知します。
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="border-t border-slate-700 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">お問い合わせ</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p>
                    本ポリシーに関するご質問やお問い合わせは、以下までご連絡ください：
                  </p>
                  <p className="mt-2 text-purple-400">
                    support@postcraft.example.com
                  </p>
                </div>
              </section>

            </div>
          </div>

        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-purple-500/20 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-6">
            <ChapikoLogo className="text-xl" />
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Twitterでフォローする"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="GitHubでフォローする"
              >
                <Github size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="LinkedInでフォローする"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-cyan-400 transition-colors">利用規約</Link>
            </div>
            <p className="text-sm text-gray-500">© 2024 Chapiko Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
