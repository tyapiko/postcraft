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
