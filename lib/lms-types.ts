// LMS関連の型定義

export type ContentType = 'video' | 'text' | 'audio'

export type Course = {
  id: string
  creator_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_published: boolean
  is_free: boolean
  price: number
  created_at: string
  updated_at: string
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  description: string | null
  content_type: ContentType
  content_url: string | null
  content_text: string | null
  duration_minutes: number | null
  sort_order: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at: string | null
}

export type LessonProgress = {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
  last_position_seconds: number
  created_at: string
  updated_at: string
}

// 拡張型（JOIN結果用）
export type CourseWithLessons = Course & {
  lessons: Lesson[]
  enrollment_count?: number
}

export type LessonWithProgress = Lesson & {
  progress?: LessonProgress
}

export type EnrollmentWithCourse = Enrollment & {
  course: Course
}

// Quiz関連の型定義
export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'text'

export type Quiz = {
  id: string
  lesson_id: string
  title: string
  description: string | null
  passing_score: number
  time_limit_minutes: number | null
  max_attempts: number | null
  is_required: boolean
  created_at: string
  updated_at: string
}

export type QuizQuestion = {
  id: string
  quiz_id: string
  question_text: string
  question_type: QuestionType
  points: number
  sort_order: number
  explanation: string | null
  created_at: string
}

export type QuizOption = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  sort_order: number
}

export type QuizAttempt = {
  id: string
  user_id: string
  quiz_id: string
  score: number | null
  passed: boolean
  started_at: string
  completed_at: string | null
  time_spent_seconds: number | null
}

export type QuizAnswer = {
  id: string
  attempt_id: string
  question_id: string
  selected_option_ids: string[] | null
  text_answer: string | null
  is_correct: boolean | null
  points_earned: number
}

// 拡張型
export type QuizWithQuestions = Quiz & {
  questions: (QuizQuestion & { options: QuizOption[] })[]
}

export type QuizAttemptWithAnswers = QuizAttempt & {
  answers: QuizAnswer[]
}

// Organization関連の型定義
export type OrganizationRole = 'owner' | 'admin' | 'instructor' | 'member'

export type Organization = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  owner_id: string
  plan: 'pro' | 'enterprise'
  max_members: number
  created_at: string
  updated_at: string
}

export type OrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  joined_at: string
}

export type OrganizationInvitation = {
  id: string
  organization_id: string
  email: string
  role: Exclude<OrganizationRole, 'owner'>
  invited_by: string
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export type OrganizationCourse = {
  id: string
  organization_id: string
  course_id: string
  assigned_at: string
  assigned_by: string | null
}

// 拡張型
export type OrganizationWithMembers = Organization & {
  members: (OrganizationMember & { user?: { email: string; display_name: string | null } })[]
  member_count: number
}

export type OrganizationMemberWithUser = OrganizationMember & {
  user: { email: string; display_name: string | null }
}

export type MemberProgress = {
  user_id: string
  email: string
  display_name: string | null
  enrollments: {
    course_id: string
    course_title: string
    progress_percent: number
    completed_lessons: number
    total_lessons: number
  }[]
}
