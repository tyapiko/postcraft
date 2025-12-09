'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FileText,
  BookOpen,
  Users,
  Search,
  Inbox,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  Plus,
  type LucideIcon
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null

    if (typeof Icon === 'function') {
      const IconComponent = Icon as LucideIcon
      return (
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )
    }

    return Icon
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in',
      className
    )}>
      {renderIcon()}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-green-500 hover:bg-green-600"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// プリセット：検索結果なし
export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="検索結果が見つかりません"
      description={`「${query}」に一致する結果はありませんでした。別のキーワードで検索してみてください。`}
      action={{
        label: '検索をクリア',
        onClick: onClear,
        icon: RefreshCw
      }}
    />
  )
}

// プリセット：データなし
export function NoData({
  type = 'items',
  onAdd
}: {
  type?: string
  onAdd?: () => void
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={`${type}がありません`}
      description={`まだ${type}が登録されていません。`}
      action={onAdd ? {
        label: `${type}を追加`,
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  )
}

// プリセット：記事なし
export function NoArticles({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="記事がありません"
      description="まだ記事が投稿されていません。最初の記事を作成しましょう。"
      action={onAdd ? {
        label: '記事を作成',
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  )
}

// プリセット：コースなし
export function NoCourses({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="コースがありません"
      description="まだコースが作成されていません。新しいコースを作成しましょう。"
      action={onAdd ? {
        label: 'コースを作成',
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  )
}

// プリセット：フォルダ空
export function EmptyFolder({ folderName }: { folderName?: string }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={folderName ? `${folderName}は空です` : 'フォルダは空です'}
      description="このフォルダにはまだアイテムがありません。"
    />
  )
}

// プリセット：エラー状態
export function ErrorState({
  message = 'エラーが発生しました',
  onRetry
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="問題が発生しました"
      description={message}
      action={onRetry ? {
        label: '再試行',
        onClick: onRetry,
        icon: RefreshCw
      } : undefined}
    />
  )
}

// プリセット：アクセス権限なし
export function NoAccess() {
  return (
    <EmptyState
      icon={Users}
      title="アクセス権限がありません"
      description="このコンテンツを表示する権限がありません。ログインするか、管理者にお問い合わせください。"
    />
  )
}
