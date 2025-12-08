'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string | null
  is_published: boolean
  created_at: string
  published_at: string | null
  view_count: number
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(posts)
    }
  }, [searchQuery, posts])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
      setFilteredPosts(data || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('記事の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setPosts(posts.filter(p => p.id !== deleteId))
      toast.success('記事を削除しました')
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error('削除に失敗しました')
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error

      setPosts(posts.map(p =>
        p.id === id
          ? { ...p, is_published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null }
          : p
      ))
      toast.success(!currentStatus ? '記事を公開しました' : '記事を非公開にしました')
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      toast.error('公開状態の変更に失敗しました')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">ブログ記事管理</h1>
          <p className="text-gray-600">記事の作成・編集・削除</p>
        </div>
        <Button asChild className="bg-green-500 hover:bg-green-600">
          <Link href="/admin/blog/new">
            <Plus size={16} className="mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトルまたはスラッグで検索..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>閲覧数</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  記事がありません
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    {post.category && (
                      <Badge variant="outline">{post.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        post.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {post.is_published ? '公開' : '下書き'}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.view_count}</TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(post.id, post.is_published)}
                        title={post.is_published ? '非公開にする' : '公開する'}
                      >
                        {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/blog/${post.id}`}>
                          <Edit size={16} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(post.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。記事は完全に削除されます。
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
