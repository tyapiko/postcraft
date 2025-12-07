import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type Profile = {
  id: string
  display_name: string | null
  plan: string
  generation_count: number
  created_at: string
  updated_at: string
}

export type Content = {
  id: string
  user_id: string
  theme: string
  tone: string
  platform: string
  generated_text: string
  is_draft: boolean
  is_saved_to_notion: boolean
  saved_to_notion_at: string | null
  created_at: string
}