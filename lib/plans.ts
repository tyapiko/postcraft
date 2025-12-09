// プラン定義と権限管理

export type PlanType = 'free' | 'pro' | 'enterprise'

export interface Plan {
  id: PlanType
  name: string
  nameJa: string
  description: string
  price: number
  priceLabel: string
  features: string[]
  limitations: {
    canAccessAllCourses: boolean
    canAccessAllLessons: boolean
    canCreateCourses: boolean
    canManageUsers: boolean
    canViewAnalytics: boolean
    canExportData: boolean
    canCustomBranding: boolean
    maxStudents: number | null // null = unlimited
    aiGenerationLimit: number // 月間AI生成回数
  }
  badge: {
    text: string
    color: string
  } | null
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    nameJa: '無料プラン',
    description: 'データサイエンスの世界への第一歩',
    price: 0,
    priceLabel: '¥0',
    features: [
      '公開コース・レッスンの受講',
      'ブログ記事の閲覧',
      '書籍紹介の閲覧',
      'AI投稿生成（月10回まで）',
      'コミュニティアクセス',
    ],
    limitations: {
      canAccessAllCourses: false,
      canAccessAllLessons: false,
      canCreateCourses: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canExportData: false,
      canCustomBranding: false,
      maxStudents: null,
      aiGenerationLimit: 10,
    },
    badge: null,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameJa: 'プロプラン',
    description: 'すべてのコンテンツにアクセス + LMS管理機能',
    price: 2980,
    priceLabel: '¥2,980/月',
    features: [
      '無料プランの全機能',
      'すべてのコース・レッスンにアクセス',
      'アセスメントテスト受験',
      '修了証の発行',
      'AI投稿生成（月100回まで）',
      'Notion連携',
      '---',
      'LMS管理機能',
      '自社コース・レッスン作成',
      '受講者管理（最大50名）',
      '進捗レポート閲覧',
    ],
    limitations: {
      canAccessAllCourses: true,
      canAccessAllLessons: true,
      canCreateCourses: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canExportData: false,
      canCustomBranding: false,
      maxStudents: 50,
      aiGenerationLimit: 100,
    },
    badge: {
      text: '人気',
      color: 'cyan',
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameJa: 'エンタープライズ',
    description: '大規模チーム向けのフル機能LMS',
    price: 9800,
    priceLabel: '¥9,800/月',
    features: [
      'プロプランの全機能',
      'AI投稿生成（無制限）',
      '受講者管理（無制限）',
      '詳細アナリティクス',
      'データエクスポート',
      'カスタムブランディング',
      '優先サポート',
      'API アクセス',
      'SSO対応（Coming Soon）',
    ],
    limitations: {
      canAccessAllCourses: true,
      canAccessAllLessons: true,
      canCreateCourses: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canExportData: true,
      canCustomBranding: true,
      maxStudents: null,
      aiGenerationLimit: -1, // unlimited
    },
    badge: {
      text: '最強',
      color: 'purple',
    },
  },
}

// プランの権限チェック関数
export function canAccessFeature(
  plan: PlanType,
  feature: keyof Plan['limitations']
): boolean {
  const planData = PLANS[plan]
  if (!planData) return false

  const value = planData.limitations[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return value !== null
}

// AI生成の残り回数をチェック
export function getRemainingAIGenerations(
  plan: PlanType,
  currentCount: number
): number {
  const limit = PLANS[plan]?.limitations.aiGenerationLimit ?? 0
  if (limit === -1) return Infinity
  return Math.max(0, limit - currentCount)
}

// プランのアップグレードが必要かチェック
export function needsUpgrade(
  currentPlan: PlanType,
  requiredFeature: keyof Plan['limitations']
): boolean {
  return !canAccessFeature(currentPlan, requiredFeature)
}

// 次のプランを取得
export function getNextPlan(currentPlan: PlanType): PlanType | null {
  const order: PlanType[] = ['free', 'pro', 'enterprise']
  const currentIndex = order.indexOf(currentPlan)
  if (currentIndex === -1 || currentIndex >= order.length - 1) return null
  return order[currentIndex + 1]
}
