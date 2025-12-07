'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Database, History, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">Postcraft</div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">無料で始める</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 gradient-bg">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            AIで作り、自動で届ける。
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            SNS発信をもっとラクに。
          </p>
          <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-white/90">
            <Link href="/signup">
              <Sparkles className="mr-2 h-5 w-5" />
              無料で始める
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            3つの特徴
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>AI生成</CardTitle>
                <CardDescription>
                  テーマを入力するだけで投稿文を自動生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  最新のGemini AIを使用して、あなたのテーマに合わせた高品質な投稿文を3パターン生成します。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>ワンクリック保存</CardTitle>
                <CardDescription>
                  生成した内容をNotionへ保存
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  生成したコンテンツをワンクリックでNotionに保存。投稿スケジュールの管理も簡単です。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>履歴管理</CardTitle>
                <CardDescription>
                  過去の投稿をすべて記録
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  生成したすべてのコンテンツを保存。検索機能で過去の投稿も簡単に見つかります。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            料金プラン
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="text-3xl font-bold mt-4">¥0</div>
                <CardDescription>まずは試してみたい方に</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">月10回まで生成</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">履歴保存</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Twitter対応</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/signup">始める</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg">
              <CardHeader>
                <div className="text-xs font-semibold text-primary mb-2">人気</div>
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold mt-4">¥980</div>
                <CardDescription>個人で本格的に使いたい方に</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">月100回まで生成</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Notion連携</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">全SNS対応</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">優先サポート</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/signup">始める</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold mt-4">¥2,980</div>
                <CardDescription>チームで使いたい方に</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">無制限生成</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">API連携</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">チーム機能</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">専任サポート</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/signup">始める</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto text-center">
          <div className="text-xl font-bold gradient-text mb-4">Postcraft</div>
          <p className="text-sm text-muted-foreground">
            © 2024 Postcraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
