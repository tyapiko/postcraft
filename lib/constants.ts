// 共通定数ファイル
// カテゴリ、難易度、その他の定数を一元管理

// ========================================
// カテゴリ定数
// ========================================

export const BLOG_CATEGORIES = [
  'AI活用',
  'データ分析',
  '自動化',
  'Python',
  'Excel',
  'プログラミング',
  'ビジネス',
  '機械学習'
] as const

export const BOOK_CATEGORIES = [
  'Python入門',
  'データ分析',
  'AI',
  'ビジネス',
  'Excel',
  'プログラミング'
] as const

export const COURSE_CATEGORIES = [
  'Python',
  'データ分析',
  'AI',
  '自動化',
  'Excel',
  'ビジネス'
] as const

export const LEARNING_CATEGORIES = [
  'Python',
  'データ分析',
  'AI',
  '自動化',
  'Excel',
  'ビジネス'
] as const

// ========================================
// 難易度定数
// ========================================

export const DIFFICULTIES = ['初級', '中級', '上級'] as const

export type Difficulty = typeof DIFFICULTIES[number]

// ========================================
// プラン定数
// ========================================

export const PLANS = ['free', 'pro', 'enterprise'] as const

export type Plan = typeof PLANS[number]

export const PLAN_DISPLAY_NAMES: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
}

// ========================================
// 組織役割定数
// ========================================

export const ORGANIZATION_ROLES = ['owner', 'admin', 'instructor', 'member'] as const

export type OrganizationRoleType = typeof ORGANIZATION_ROLES[number]

export const ROLE_DISPLAY_NAMES: Record<OrganizationRoleType, string> = {
  owner: 'オーナー',
  admin: '管理者',
  instructor: '講師',
  member: 'メンバー'
}

export const ROLE_COLORS: Record<OrganizationRoleType, string> = {
  owner: 'bg-yellow-500',
  admin: 'bg-purple-500',
  instructor: 'bg-blue-500',
  member: 'bg-slate-500'
}

// ========================================
// クイズ関連定数
// ========================================

export const QUESTION_TYPES = ['single_choice', 'multiple_choice', 'true_false', 'text'] as const

export type QuestionTypeValue = typeof QUESTION_TYPES[number]

export const QUESTION_TYPE_LABELS: Record<QuestionTypeValue, string> = {
  single_choice: '単一選択',
  multiple_choice: '複数選択',
  true_false: '○×問題',
  text: '記述式'
}

// ========================================
// コンテンツタイプ定数
// ========================================

export const CONTENT_TYPES = ['video', 'text', 'audio'] as const

export type ContentType = typeof CONTENT_TYPES[number]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: '動画',
  text: 'テキスト',
  audio: '音声'
}

// ========================================
// 設定値定数
// ========================================

export const CONFIG = {
  // 自動保存間隔（ミリ秒）
  AUTO_SAVE_INTERVAL_MS: 30000,

  // ページネーション
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // ファイルアップロード
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // クイズ
  DEFAULT_PASSING_SCORE: 70,
  DEFAULT_TIME_LIMIT_MINUTES: 30,

  // 組織
  DEFAULT_MAX_MEMBERS: 10,
  ENTERPRISE_MAX_MEMBERS: 100,
} as const

// ========================================
// エラーメッセージ定数
// ========================================

export const ERROR_MESSAGES = {
  FETCH_FAILED: 'データの取得に失敗しました',
  SAVE_FAILED: '保存に失敗しました',
  DELETE_FAILED: '削除に失敗しました',
  UNAUTHORIZED: 'この操作を行う権限がありません',
  NOT_FOUND: '該当するデータが見つかりません',
  DUPLICATE: 'この項目は既に存在します',
  PLAN_REQUIRED: 'この機能を利用するにはプランのアップグレードが必要です',
  LOGIN_REQUIRED: 'ログインが必要です',
} as const

// ========================================
// 成功メッセージ定数
// ========================================

export const SUCCESS_MESSAGES = {
  SAVED: '保存しました',
  DELETED: '削除しました',
  PUBLISHED: '公開しました',
  UNPUBLISHED: '非公開にしました',
  ENROLLED: '登録しました',
  COMPLETED: '完了しました',
} as const
