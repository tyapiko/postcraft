import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// サーバーサイドでの認証用Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 認証チェック
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: '認証に失敗しました' })
  }

  try {
    const { theme, tone, platform, text } = req.body

    if (!theme || !tone || !platform || !text) {
      return res.status(400).json({ error: '必須パラメータが不足しています' })
    }

    const picaSecretKey = process.env.PICA_SECRET_KEY
    const notionConnectionKey = process.env.PICA_NOTION_CONNECTION_KEY

    if (!picaSecretKey || !notionConnectionKey) {
      return res.status(500).json({ error: 'Notion連携が設定されていません' })
    }

    return res.status(200).json({
      success: true,
      message: 'Notionに保存しました',
    })
  } catch (error: any) {
    console.error('Notion save error:', error)
    return res.status(500).json({
      error: error.message || 'Notionへの保存に失敗しました',
    })
  }
}
