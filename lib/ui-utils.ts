// UI関連のユーティリティ関数
// 難易度色、星評価など共通のUI関数を一元管理

import { Difficulty } from './constants'

// ========================================
// 難易度関連
// ========================================

/**
 * 難易度に応じた色クラスを返す
 */
export function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case '初級':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case '中級':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case '上級':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

/**
 * 難易度に応じたバッジ用の色クラスを返す（コスミックテーマ用）
 */
export function getDifficultyBadgeColor(difficulty: string | null): string {
  switch (difficulty) {
    case '初級':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    case '中級':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case '上級':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }
}

// ========================================
// 星評価関連
// ========================================

/**
 * 数値を星表示（★☆）に変換
 */
export function renderStars(rating: number | null, maxStars: number = 5): string {
  if (!rating || rating < 0) return '-'
  const clampedRating = Math.min(Math.max(0, Math.round(rating)), maxStars)
  return Array.from({ length: maxStars })
    .map((_, i) => (i < clampedRating ? '★' : '☆'))
    .join('')
}

/**
 * 数値を星コンポーネント用の配列に変換
 */
export function getStarArray(rating: number | null, maxStars: number = 5): ('full' | 'empty')[] {
  if (!rating || rating < 0) {
    return Array(maxStars).fill('empty')
  }
  const clampedRating = Math.min(Math.max(0, Math.round(rating)), maxStars)
  return Array.from({ length: maxStars }, (_, i) =>
    i < clampedRating ? 'full' : 'empty'
  )
}

// ========================================
// 日付フォーマット関連
// ========================================

/**
 * ISO日付文字列を日本語形式に変換
 */
export function formatDate(dateString: string | null, includeTime: boolean = false): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('ja-JP', options)
}

/**
 * 相対時間を返す（「3日前」など）
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'たった今'
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  if (diffWeeks < 4) return `${diffWeeks}週間前`
  if (diffMonths < 12) return `${diffMonths}ヶ月前`

  return formatDate(dateString)
}

// ========================================
// 数値フォーマット関連
// ========================================

/**
 * 数値を3桁カンマ区切りに変換
 */
export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('ja-JP')
}

/**
 * 価格をフォーマット
 */
export function formatPrice(price: number | null, currency: string = '¥'): string {
  if (price === null || price === undefined) return '-'
  if (price === 0) return '無料'
  return `${currency}${formatNumber(price)}`
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercent(value: number | null, decimals: number = 0): string {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}%`
}

// ========================================
// 時間フォーマット関連
// ========================================

/**
 * 分数を「XX時間XX分」形式に変換
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '-'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}分`
  if (mins === 0) return `${hours}時間`
  return `${hours}時間${mins}分`
}

/**
 * 秒数を「MM:SS」形式に変換
 */
export function formatTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ========================================
// 文字列ユーティリティ
// ========================================

/**
 * 文字列を指定文字数で切り詰め
 */
export function truncateText(text: string | null, maxLength: number, suffix: string = '...'): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * スラグを生成（日本語対応）
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, '-') // スペースをハイフンに
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '') // 英数字・日本語・ハイフン以外を削除
    .replace(/-+/g, '-') // 連続ハイフンを単一に
    .replace(/^-|-$/g, '') // 先頭・末尾のハイフンを削除
}

// ========================================
// ステータス関連
// ========================================

/**
 * 公開状態に応じたバッジクラスを返す
 */
export function getPublishStatusClass(isPublished: boolean): string {
  return isPublished
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
}

/**
 * 公開状態のラベルを返す
 */
export function getPublishStatusLabel(isPublished: boolean): string {
  return isPublished ? '公開中' : '下書き'
}

// ========================================
// プログレス関連
// ========================================

/**
 * 進捗率に応じた色クラスを返す
 */
export function getProgressColor(percent: number): string {
  if (percent >= 100) return 'bg-green-500'
  if (percent >= 75) return 'bg-emerald-500'
  if (percent >= 50) return 'bg-yellow-500'
  if (percent >= 25) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * 進捗率に応じたテキスト色クラスを返す
 */
export function getProgressTextColor(percent: number): string {
  if (percent >= 100) return 'text-green-400'
  if (percent >= 75) return 'text-emerald-400'
  if (percent >= 50) return 'text-yellow-400'
  if (percent >= 25) return 'text-orange-400'
  return 'text-red-400'
}
