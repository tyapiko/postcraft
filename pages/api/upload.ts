import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

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

  try {
    const form = formidable({})
    const [fields, files] = await form.parse(req)

    const file = files.file?.[0]
    const bucket = fields.bucket?.[0]

    if (!file || !bucket) {
      return res.status(400).json({ error: 'File and bucket are required' })
    }

    const fileBuffer = fs.readFileSync(file.filepath)
    const fileName = `${Date.now()}-${file.originalFilename}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    fs.unlinkSync(file.filepath)

    return res.status(200).json({ url: data.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
