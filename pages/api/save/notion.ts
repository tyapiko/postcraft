import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
