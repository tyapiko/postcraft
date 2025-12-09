'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Grid, List, Star, Book } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  cover_image: string | null
  amazon_url: string | null
  category: string | null
  difficulty: string | null
  rating: number | null
  is_published: boolean
  sort_order: number
}

const difficulties = ['初級', '中級', '上級']
const categories = ['Python入門', 'データ分析', 'AI', 'ビジネス', 'Excel', 'プログラミング']

export default function BooksManagementPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    let filtered = [...books]

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(book => book.category === categoryFilter)
    }

    if (difficultyFilter) {
      filtered = filtered.filter(book => book.difficulty === difficultyFilter)
    }

    setFilteredBooks(filtered)
  }, [searchQuery, categoryFilter, difficultyFilter, books])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setBooks(data || [])
      setFilteredBooks(data || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
      toast.error('書籍の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setBooks(books.filter(b => b.id !== deleteId))
      toast.success('書籍を削除しました')
    } catch (error) {
      console.error('Failed to delete book:', error)
      toast.error('削除に失敗しました')
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setBooks(books.map(b =>
        b.id === id ? { ...b, is_published: !currentStatus } : b
      ))
      toast.success(!currentStatus ? '書籍を公開しました' : '書籍を非公開にしました')
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      toast.error('公開状態の変更に失敗しました')
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case '初級': return 'bg-green-100 text-green-800'
      case '中級': return 'bg-yellow-100 text-yellow-800'
      case '上級': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return '-'
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
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
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">書籍管理</h1>
          <p className="text-gray-600">おすすめ書籍の追加・編集・管理</p>
        </div>
        <Button asChild className="bg-green-500 hover:bg-green-600">
          <Link href="/admin/books/new">
            <Plus size={16} className="mr-2" />
            新規追加
          </Link>
        </Button>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトルまたは著者で検索..."
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="難易度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべて</SelectItem>
            {difficulties.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </Button>
        </div>
      </div>

      {/* 書籍一覧 */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表紙</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>著者</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>難易度</TableHead>
                <TableHead>評価</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    書籍がありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <Book size={20} className="text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{book.title}</TableCell>
                    <TableCell>{book.author || '-'}</TableCell>
                    <TableCell>
                      {book.category && (
                        <Badge variant="outline">{book.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {book.difficulty && (
                        <Badge className={getDifficultyColor(book.difficulty)}>
                          {book.difficulty}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{renderStars(book.rating)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          book.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {book.is_published ? '公開' : '非公開'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish(book.id, book.is_published)}
                          title={book.is_published ? '非公開にする' : '公開する'}
                        >
                          {book.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/books/${book.id}`}>
                            <Edit size={16} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(book.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              書籍がありません
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[2/3] bg-gray-100 relative">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book size={48} className="text-gray-300" />
                    </div>
                  )}
                  {!book.is_published && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gray-800 text-white">非公開</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{book.author || '著者不明'}</p>
                  <div className="flex items-center justify-between">
                    {renderStars(book.rating)}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                        <Link href={`/admin/books/${book.id}`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setDeleteId(book.id)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。書籍情報は完全に削除されます。
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
    </div>
  )
}
