'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Star, ExternalLink, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import ImageUploader from '@/components/admin/ImageUploader'
import { STORAGE_BUCKETS } from '@/lib/storage'
import { toast } from 'sonner'

interface BookForm {
  title: string
  author: string
  description: string
  cover_image: string | null
  amazon_url: string
  category: string | null
  difficulty: string | null
  rating: number
  is_published: boolean
}

const difficulties = ['初級', '中級', '上級']
const categories = ['Python入門', 'データ分析', 'AI', 'ビジネス', 'Excel', 'プログラミング']

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverImageType, setCoverImageType] = useState<'upload' | 'url'>('upload')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  const [form, setForm] = useState<BookForm>({
    title: '',
    author: '',
    description: '',
    cover_image: null,
    amazon_url: '',
    category: null,
    difficulty: null,
    rating: 0,
    is_published: false,
  })

  useEffect(() => {
    if (bookId) {
      fetchBook()
    }
  }, [bookId])

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (error) throw error

      if (data) {
        setForm({
          title: data.title || '',
          author: data.author || '',
          description: data.description || '',
          cover_image: data.cover_image,
          amazon_url: data.amazon_url || '',
          category: data.category,
          difficulty: data.difficulty,
          rating: data.rating || 0,
          is_published: data.is_published || false,
        })

        // 画像がURLの場合はURL入力モードにする
        if (data.cover_image && !data.cover_image.includes('supabase')) {
          setCoverImageType('url')
          setCoverImageUrl(data.cover_image)
        }
      }
    } catch (error) {
      console.error('Failed to fetch book:', error)
      toast.error('書籍の取得に失敗しました')
      router.push('/admin/books')
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (updates: Partial<BookForm>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const handleCoverImageUrlChange = (url: string) => {
    setCoverImageUrl(url)
    updateForm({ cover_image: url })
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title) {
      toast.error('タイトルは必須です')
      return
    }

    setSaving(true)
    try {
      const bookData = {
        title: form.title,
        author: form.author || null,
        description: form.description || null,
        cover_image: form.cover_image,
        amazon_url: form.amazon_url || null,
        category: form.category,
        difficulty: form.difficulty,
        rating: form.rating || null,
        is_published: publish,
      }

      const { error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', bookId)

      if (error) throw error

      toast.success(publish ? '書籍を公開しました' : '下書きを保存しました')
      router.push('/admin/books')
    } catch (error) {
      console.error('Failed to save book:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)

      if (error) throw error

      toast.success('書籍を削除しました')
      router.push('/admin/books')
    } catch (error) {
      console.error('Failed to delete book:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/books">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">書籍編集</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 size={16} className="mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。書籍「{form.title}」は完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            variant="outline"
          >
            下書き保存
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save size={16} className="mr-2" />
            {form.is_published ? '更新して公開' : '公開'}
          </Button>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左: メインフォーム */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-6">
            <div>
              <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                placeholder="書籍のタイトルを入力"
                className="mt-2 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="author">著者</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => updateForm({ author: e.target.value })}
                placeholder="著者名を入力"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="書籍の説明やおすすめポイントを入力してください"
                className="mt-2"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="amazon_url">AmazonアフィリエイトURL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="amazon_url"
                  value={form.amazon_url}
                  onChange={(e) => updateForm({ amazon_url: e.target.value })}
                  placeholder="https://www.amazon.co.jp/..."
                  className="flex-1"
                />
                {form.amazon_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={form.amazon_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右: サイドバー設定 */}
        <div className="space-y-6">
          {/* カバー画像 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">カバー画像</h3>

            <div className="flex items-center gap-4 mb-4">
              <Button
                variant={coverImageType === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCoverImageType('upload')}
              >
                アップロード
              </Button>
              <Button
                variant={coverImageType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCoverImageType('url')}
              >
                URL入力
              </Button>
            </div>

            {coverImageType === 'upload' ? (
              <ImageUploader
                value={form.cover_image || ''}
                onChange={(url) => updateForm({ cover_image: url })}
                onRemove={() => updateForm({ cover_image: null })}
                bucket={STORAGE_BUCKETS.BOOK_COVERS}
              />
            ) : (
              <div className="space-y-4">
                <Input
                  value={coverImageUrl}
                  onChange={(e) => handleCoverImageUrlChange(e.target.value)}
                  placeholder="画像URLを入力（Amazon画像URLなど）"
                />
                {form.cover_image && (
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={form.cover_image}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 書籍設定 */}
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-900">書籍設定</h3>

            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={form.category || ''}
                onValueChange={(value) => updateForm({ category: value || null })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">難易度</Label>
              <Select
                value={form.difficulty || ''}
                onValueChange={(value) => updateForm({ difficulty: value || null })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="難易度を選択" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>おすすめ度</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateForm({ rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={
                        star <= form.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }
                    />
                  </button>
                ))}
                {form.rating > 0 && (
                  <button
                    type="button"
                    onClick={() => updateForm({ rating: 0 })}
                    className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 公開設定 */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">公開設定</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">ステータス</span>
              <Badge
                className={form.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
              >
                {form.is_published ? '公開中' : '下書き'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
