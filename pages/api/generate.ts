import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('Environment check:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '設定済み' : '未設定',
    PICA_SECRET_KEY: process.env.PICA_SECRET_KEY ? '設定済み' : '未設定',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'
  });

  try {
    const { theme, tone, platform } = req.body

    if (!theme || !tone || !platform) {
      return res.status(400).json({ error: '必須パラメータが不足しています' })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return res.status(500).json({
        error: 'GEMINI_API_KEYが設定されていません。環境変数を確認してください。',
      })
    }

    const toneDescriptions: Record<string, string> = {
      casual: 'フレンドリーで親しみやすい',
      business: 'プロフェッショナルで丁寧',
      professional: '技術的で詳細',
    }

    const platformConfig: Record<string, { name: string; charLimit: string }> = {
      twitter: { name: 'Twitter/X', charLimit: '140文字以内' },
      facebook: { name: 'Facebook', charLimit: '300文字程度' },
      instagram: { name: 'Instagram', charLimit: '300文字程度' },
      linkedin: { name: 'LinkedIn', charLimit: '300文字程度' },
    }

    const config = platformConfig[platform] || { name: platform, charLimit: '300文字程度' }

    const prompt = `以下のテーマで${config.name}のSNS投稿文を3パターン作成してください。

テーマ: ${theme}
トーン: ${toneDescriptions[tone] || tone}
文字数: ${config.charLimit}（ハッシュタグを含む）
ハッシュタグ: 2-3個を含めてください

各パターンは異なるアプローチで作成してください。
回答は以下のJSON形式で返してください：
{
  "patterns": [
    { "pattern": 1, "text": "投稿文1" },
    { "pattern": 2, "text": "投稿文2" },
    { "pattern": 3, "text": "投稿文3" }
  ]
}

JSONのみを返し、他の説明は不要です。`

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }

    console.log('=== Gemini API Request ===')
    console.log('API URL:', apiUrl)
    console.log('Request Body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('=== Gemini API Response ===')
    console.log('Response Status:', response.status, response.statusText)
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('Response Body:', responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
        console.error('Gemini API error (JSON):', errorData)
      } catch (e) {
        console.error('Gemini API error (non-JSON):', responseText)
        return res.status(response.status).json({
          error: `AI生成に失敗しました: ${response.statusText}. レスポンスがJSON形式ではありません。`,
        })
      }
      return res.status(response.status).json({
        error: `AI生成に失敗しました: ${errorData.error?.message || response.statusText}`,
      })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response as JSON:', e)
      return res.status(500).json({ error: 'AI応答のパースに失敗しました' })
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: 'AIからの応答がありませんでした' })
    }

    const generatedText = data.candidates[0].content.parts[0].text

    let results
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0])
        results = parsedData.patterns
      } else {
        throw new Error('JSON format not found')
      }
    } catch (e) {
      const lines = generatedText.split('\n\n').filter((line: string) => line.trim())
      results = lines.slice(0, 3).map((text: string, index: number) => ({
        pattern: index + 1,
        text: text.trim(),
      }))
    }

    if (!results || results.length === 0) {
      results = [
        { pattern: 1, text: generatedText },
        { pattern: 2, text: generatedText },
        { pattern: 3, text: generatedText },
      ]
    }

    return res.status(200).json({ results })
  } catch (error: any) {
    console.error('Generate API error:', error)
    return res.status(500).json({
      error: error.message || '生成に失敗しました',
    })
  }
}
