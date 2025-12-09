'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'

// ========================================
// 型定義
// ========================================

interface ResourceManagementOptions<T> {
  /** Supabaseテーブル名 */
  tableName: string
  /** 初期フェッチ時のselect句 */
  select?: string
  /** 初期フェッチ時のフィルター */
  filter?: (query: any) => any
  /** ソート順 */
  orderBy?: { column: string; ascending?: boolean }
  /** 公開状態カラム名（デフォルト: is_published） */
  publishColumn?: string
  /** フェッチ完了時のコールバック */
  onFetchComplete?: (items: T[]) => void
  /** エラー時のコールバック */
  onError?: (error: Error) => void
}

interface ResourceManagementResult<T> {
  /** データ一覧 */
  items: T[]
  /** データ更新関数 */
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  /** ローディング状態 */
  loading: boolean
  /** 削除対象ID */
  deleteId: string | null
  /** 削除対象ID設定関数 */
  setDeleteId: React.Dispatch<React.SetStateAction<string | null>>
  /** データ再取得 */
  refetch: () => Promise<void>
  /** アイテム削除 */
  handleDelete: () => Promise<boolean>
  /** 公開状態切り替え */
  togglePublish: (id: string, currentStatus: boolean) => Promise<boolean>
  /** 単一アイテム更新 */
  updateItem: (id: string, updates: Partial<T>) => Promise<boolean>
}

// ========================================
// メインフック
// ========================================

/**
 * リソース管理の共通ロジックを提供するカスタムフック
 *
 * @example
 * const { items, loading, deleteId, setDeleteId, handleDelete, togglePublish } =
 *   useResourceManagement<BlogPost>({
 *     tableName: 'blog_posts',
 *     select: '*',
 *     orderBy: { column: 'created_at', ascending: false }
 *   })
 */
export function useResourceManagement<T extends { id: string }>(
  options: ResourceManagementOptions<T>
): ResourceManagementResult<T> {
  const {
    tableName,
    select = '*',
    filter,
    orderBy,
    publishColumn = 'is_published',
    onFetchComplete,
    onError
  } = options

  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // データ取得
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from(tableName).select(select)

      if (filter) {
        query = filter(query)
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
      }

      const { data, error } = await query

      if (error) throw error

      const fetchedItems = (data || []) as unknown as T[]
      setItems(fetchedItems)
      onFetchComplete?.(fetchedItems)
    } catch (error) {
      console.error(`Failed to fetch ${tableName}:`, error)
      onError?.(error as Error)
      toast.error(ERROR_MESSAGES.FETCH_FAILED)
    } finally {
      setLoading(false)
    }
  }, [tableName, select, filter, orderBy, onFetchComplete, onError])

  // 初回フェッチ
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // 削除処理
  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!deleteId) return false

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== deleteId))
      setDeleteId(null)
      toast.success(SUCCESS_MESSAGES.DELETED)
      return true
    } catch (error) {
      console.error(`Failed to delete from ${tableName}:`, error)
      onError?.(error as Error)
      toast.error(ERROR_MESSAGES.DELETE_FAILED)
      return false
    }
  }, [deleteId, tableName, onError])

  // 公開状態切り替え
  const togglePublish = useCallback(async (
    id: string,
    currentStatus: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ [publishColumn]: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, [publishColumn]: !currentStatus }
            : item
        )
      )

      toast.success(currentStatus ? SUCCESS_MESSAGES.UNPUBLISHED : SUCCESS_MESSAGES.PUBLISHED)
      return true
    } catch (error) {
      console.error(`Failed to toggle publish status in ${tableName}:`, error)
      onError?.(error as Error)
      toast.error(ERROR_MESSAGES.SAVE_FAILED)
      return false
    }
  }, [tableName, publishColumn, onError])

  // 単一アイテム更新
  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      )

      toast.success(SUCCESS_MESSAGES.SAVED)
      return true
    } catch (error) {
      console.error(`Failed to update item in ${tableName}:`, error)
      onError?.(error as Error)
      toast.error(ERROR_MESSAGES.SAVE_FAILED)
      return false
    }
  }, [tableName, onError])

  return {
    items,
    setItems,
    loading,
    deleteId,
    setDeleteId,
    refetch: fetchItems,
    handleDelete,
    togglePublish,
    updateItem
  }
}

// ========================================
// フィルタリングフック
// ========================================

interface FilterOptions<T> {
  /** フィルタリング対象のアイテム */
  items: T[]
  /** 検索クエリ */
  searchQuery: string
  /** 検索対象のキー */
  searchKeys: (keyof T)[]
  /** カテゴリフィルター */
  categoryFilter?: string
  /** カテゴリキー */
  categoryKey?: keyof T
}

/**
 * リストフィルタリング用フック
 */
export function useFilteredItems<T>(options: FilterOptions<T>): T[] {
  const {
    items,
    searchQuery,
    searchKeys,
    categoryFilter,
    categoryKey
  } = options

  return items.filter(item => {
    // 検索フィルター
    const matchesSearch = !searchQuery || searchKeys.some(key => {
      const value = item[key]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return false
    })

    // カテゴリフィルター
    const matchesCategory = !categoryFilter ||
      categoryFilter === 'all' ||
      (categoryKey && item[categoryKey] === categoryFilter)

    return matchesSearch && matchesCategory
  })
}

// ========================================
// フォーム状態管理フック
// ========================================

interface FormStateResult<T> {
  /** フォームデータ */
  form: T
  /** フォームデータ設定 */
  setForm: React.Dispatch<React.SetStateAction<T>>
  /** フォーム更新（部分更新） */
  updateForm: (updates: Partial<T>) => void
  /** 変更があるかどうか */
  hasChanges: boolean
  /** 変更フラグリセット */
  resetChanges: () => void
}

/**
 * フォーム状態管理用フック
 */
export function useFormState<T>(initialState: T): FormStateResult<T> {
  const [form, setForm] = useState<T>(initialState)
  const [hasChanges, setHasChanges] = useState(false)

  const updateForm = useCallback((updates: Partial<T>) => {
    setForm(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }, [])

  const resetChanges = useCallback(() => {
    setHasChanges(false)
  }, [])

  return {
    form,
    setForm,
    updateForm,
    hasChanges,
    resetChanges
  }
}

// ========================================
// 自動保存フック
// ========================================

interface AutoSaveOptions {
  /** 保存関数 */
  onSave: () => Promise<void>
  /** 保存間隔（ミリ秒） */
  intervalMs?: number
  /** 保存を有効にするかどうか */
  enabled?: boolean
  /** 変更があるかどうか */
  hasChanges?: boolean
}

/**
 * 自動保存用フック
 */
export function useAutoSave(options: AutoSaveOptions): {
  lastSaved: Date | null
  isSaving: boolean
} {
  const {
    onSave,
    intervalMs = 30000,
    enabled = true,
    hasChanges = false
  } = options

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!enabled || !hasChanges) return

    const interval = setInterval(async () => {
      setIsSaving(true)
      try {
        await onSave()
        setLastSaved(new Date())
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [onSave, intervalMs, enabled, hasChanges])

  return { lastSaved, isSaving }
}
