'use client'

import { motion } from 'framer-motion'
import { FileText, AlertTriangle, Ban, CreditCard, Scale, RefreshCw, ArrowLeft, Twitter, Github, Linkedin } from 'lucide-react'
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

export default function TermsOfServicePage() {
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
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">利用規約</h1>
            <p className="text-slate-400">最終更新日: 2024年12月1日</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 space-y-8">

              {/* Introduction */}
              <section>
                <p className="text-slate-300 leading-relaxed">
                  本利用規約（以下「本規約」）は、Postcraft（以下「当サービス」）の利用条件を定めるものです。
                  ユーザーの皆様には、本規約に同意いただいた上で、当サービスをご利用いただきます。
                </p>
              </section>

              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">第1条（適用）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 本規約は、ユーザーと当サービスとの間のサービス利用に関わる一切の関係に適用されます。</p>
                  <p>2. 当サービスが別途定める個別規定やガイドラインも、本規約の一部を構成するものとします。</p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第2条（利用登録）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 登録希望者が本規約に同意の上、所定の方法で登録を申請し、当サービスがこれを承認することで、利用登録が完了します。</p>
                  <p>2. 当サービスは、以下の場合に登録を拒否することがあります：</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>虚偽の情報を申告した場合</li>
                    <li>過去に本規約に違反したことがある場合</li>
                    <li>その他、当サービスが不適切と判断した場合</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第3条（アカウント管理）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. ユーザーは、自己の責任においてアカウント情報を管理するものとします。</p>
                  <p>2. アカウント情報を第三者に利用させ、貸与、譲渡、売買することはできません。</p>
                  <p>3. パスワードの管理不十分や第三者の使用による損害について、当サービスは責任を負いません。</p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">第4条（料金・支払い）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 有料プランの料金は、サービス上に表示された金額とします。</p>
                  <p>2. 料金は前払い制とし、指定された方法でお支払いいただきます。</p>
                  <p>3. 支払い済みの料金は、法令に定める場合を除き、返金いたしません。</p>
                  <p>4. 当サービスは、事前の通知により料金を変更することがあります。</p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Ban className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">第5条（禁止事項）</h2>
                </div>
                <div className="pl-8 text-slate-300">
                  <p className="mb-2">ユーザーは、以下の行為をしてはなりません：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>当サービスのサーバーやネットワークに過度の負荷をかける行為</li>
                    <li>当サービスの運営を妨げる行為</li>
                    <li>他のユーザーに関する個人情報を収集・蓄積する行為</li>
                    <li>不正アクセスまたはその試み</li>
                    <li>他のユーザーになりすます行為</li>
                    <li>当サービスのコンテンツを無断で複製・転載する行為</li>
                    <li>反社会的勢力に利益を供与する行為</li>
                    <li>その他、当サービスが不適切と判断する行為</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第6条（コンテンツの権利）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 当サービスが提供するコンテンツ（教材、動画、テキスト等）の著作権は、当サービスまたは権利者に帰属します。</p>
                  <p>2. ユーザーが作成したコンテンツの著作権はユーザーに帰属しますが、当サービスはサービス提供に必要な範囲で利用できるものとします。</p>
                  <p>3. AIを利用して生成されたコンテンツについては、ユーザーの責任において利用するものとします。</p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">第7条（サービスの変更・停止）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 当サービスは、事前の通知なくサービス内容を変更または追加することがあります。</p>
                  <p>2. 以下の場合、事前通知なくサービスの全部または一部を停止することがあります：</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>システムの保守点検を行う場合</li>
                    <li>地震、火災、停電などの不可抗力の場合</li>
                    <li>その他、サービス提供が困難と判断した場合</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white m-0">第8条（免責事項）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 当サービスは、サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しません。</p>
                  <p>2. 当サービスの利用により生じた損害について、当サービスに故意または重過失がある場合を除き、責任を負いません。</p>
                  <p>3. ユーザー間またはユーザーと第三者間のトラブルについて、当サービスは一切責任を負いません。</p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第9条（退会）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. ユーザーは、所定の方法により退会手続きを行うことで、いつでもアカウントを削除できます。</p>
                  <p>2. 退会後、ユーザーのデータは当サービスの定める期間内に削除されます。</p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第10条（規約の変更）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 当サービスは、必要と判断した場合、本規約を変更することができます。</p>
                  <p>2. 変更後の規約は、サービス上に掲載した時点で効力を生じます。</p>
                  <p>3. 重要な変更の場合、事前に通知を行います。</p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white m-0">第11条（準拠法・管轄）</h2>
                </div>
                <div className="pl-8 text-slate-300 space-y-2">
                  <p>1. 本規約は、日本法に準拠します。</p>
                  <p>2. 当サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
                </div>
              </section>

              {/* Footer */}
              <section className="border-t border-slate-700 pt-8">
                <p className="text-slate-400 text-sm">
                  以上
                </p>
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
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors">プライバシーポリシー</Link>
            </div>
            <p className="text-sm text-gray-500">© 2024 Chapiko Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
