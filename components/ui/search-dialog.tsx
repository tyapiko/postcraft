'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, BookOpen, Book, X, Loader2, Command } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'article' | 'course' | 'book'
  slug: string
  category?: string
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchTerm = `%${searchQuery}%`

      // 記事を検索
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, excerpt, slug, category')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
        .limit(5)

      // コースを検索
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, description, slug, category')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5)

      // 書籍を検索
      const { data: books } = await supabase
        .from('books')
        .select('id, title, description, slug, category')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5)

      const formattedResults: SearchResult[] = [
        ...(articles || []).map(a => ({
          id: a.id,
          title: a.title,
          description: a.excerpt,
          type: 'article' as const,
          slug: a.slug,
          category: a.category
        })),
        ...(courses || []).map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          type: 'course' as const,
          slug: c.slug,
          category: c.category
        })),
        ...(books || []).map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          type: 'book' as const,
          slug: b.slug,
          category: b.category
        }))
      ]

      setResults(formattedResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // デバウンスした検索
  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchContent])

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            navigateToResult(results[selectedIndex])
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex])

  // ダイアログが開いたらクエリをリセット
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  const navigateToResult = (result: SearchResult) => {
    let path = ''
    switch (result.type) {
      case 'article':
        path = `/blog/${result.slug}`
        break
      case 'course':
        path = `/learning/${result.slug}`
        break
      case 'book':
        path = `/books/${result.slug}`
        break
    }
    router.push(path)
    onOpenChange(false)
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />
      case 'course':
        return <BookOpen className="w-4 h-4" />
      case 'book':
        return <Book className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return '記事'
      case 'course':
        return 'コース'
      case 'book':
        return '書籍'
    }
  }

  const getTypeBadgeClass = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      case 'course':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case 'book':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* 検索入力 */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="記事、コース、書籍を検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* 検索結果 */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                「{query}」に一致する結果が見つかりませんでした
              </p>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => navigateToResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      index === selectedIndex
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        <Badge className={`${getTypeBadgeClass(result.type)} text-xs`}>
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 px-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                クイック検索でコンテンツを見つけましょう
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setQuery('Python')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Python
                </button>
                <button
                  onClick={() => setQuery('データ分析')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  データ分析
                </button>
                <button
                  onClick={() => setQuery('AI')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  AI
                </button>
                <button
                  onClick={() => setQuery('自動化')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  自動化
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">↓</kbd>
              <span>移動</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">Enter</kbd>
              <span>選択</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">Esc</kbd>
              <span>閉じる</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// グローバル検索トリガーボタン
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // グローバルキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClick])

  if (!mounted) return null

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">検索</span>
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-[10px] font-mono border border-gray-200 dark:border-gray-600">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  )
}
