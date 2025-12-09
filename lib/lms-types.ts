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
