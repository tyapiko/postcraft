'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, Save, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    is_free: true,
    price: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('コースタイトルを入力してください')
      return
    }

    if (!user) {
      toast.error('ログインが必要です')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description || null,
          thumbnail_url: formData.thumbnail_url || null,
          is_free: formData.is_free,
          price: formData.is_free ? 0 : formData.price,
          is_published: false
        })
        .select()
        .single()

      if (error) throw error

      toast.success('コースを作成しました')
      router.push(`/admin/courses/${data.id}`)
    } catch (error) {
      console.error('Failed to create course:', error)
      toast.error('コースの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>新規コース作成</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                コースの基本情報を入力してください
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">コースタイトル *</Label>
              <Input
                id="title"
                placeholder="例: データサイエンス入門"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">コース説明</Label>
              <Textarea
                id="description"
                placeholder="コースの概要や学習内容を説明してください"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">サムネイル画像URL</Label>
              <Input
                id="thumbnail"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              />
              {formData.thumbnail_url && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img
                    src={formData.thumbnail_url}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label>無料コース</Label>
                  <p className="text-sm text-gray-500">
                    無料で全員がアクセスできるようにする
                  </p>
                </div>
                <Switch
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                />
              </div>

              {!formData.is_free && (
                <div className="space-y-2">
                  <Label htmlFor="price">価格（円）</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    コースを作成
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
