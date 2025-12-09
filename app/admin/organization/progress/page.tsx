'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Organization } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Loader2,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

type MemberProgress = {
  user_id: string
  email: string
  display_name: string | null
  role: string
  courses: {
    course_id: string
    course_title: string
    enrolled_at: string
    total_lessons: number
    completed_lessons: number
    progress_percent: number
    quiz_attempts: number
    quiz_passed: number
  }[]
  overall_progress: number
  total_completed: number
  total_enrolled: number
}

export default function OrganizationProgressPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user?.id)
        .single()

      if (!membership) {
        router.push('/admin/organization')
        return
      }

      // Check if user can view progress (owner, admin, instructor)
      if (!['owner', 'admin', 'instructor'].includes(membership.role)) {
        router.push('/admin/organization')
        return
      }

      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single()

      if (org) {
        setOrganization(org)
      }

      // Get all members
      const { data: members } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          profiles:user_id (display_name)
        `)
        .eq('organization_id', membership.organization_id)

      if (!members) return

      // Get progress for each member
      const progressData: MemberProgress[] = await Promise.all(
        members.map(async (member) => {
          // Get enrollments with course info
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select(`
              course_id,
              enrolled_at,
              courses:course_id (title)
            `)
            .eq('user_id', member.user_id)

          const courses = await Promise.all(
            (enrollments || []).map(async (enrollment) => {
              // Get lessons for this course
              const { data: lessons } = await supabase
                .from('lessons')
                .select('id')
                .eq('course_id', enrollment.course_id)

              const lessonIds = lessons?.map(l => l.id) || []
              const totalLessons = lessonIds.length

              // Get completed lessons
              let completedLessons = 0
              if (lessonIds.length > 0) {
                const { count } = await supabase
                  .from('lesson_progress')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', member.user_id)
                  .eq('completed', true)
                  .in('lesson_id', lessonIds)

                completedLessons = count || 0
              }

              // Get quiz stats for this course
              const { data: quizAttempts } = await supabase
                .from('quiz_attempts')
                .select('passed')
                .eq('user_id', member.user_id)
                .not('completed_at', 'is', null)

              return {
                course_id: enrollment.course_id,
                course_title: (enrollment.courses as any)?.title || 'Unknown',
                enrolled_at: enrollment.enrolled_at,
                total_lessons: totalLessons,
                completed_lessons: completedLessons,
                progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
                quiz_attempts: quizAttempts?.length || 0,
                quiz_passed: quizAttempts?.filter(a => a.passed).length || 0
              }
            })
          )

          const totalEnrolled = courses.length
          const totalCompleted = courses.filter(c => c.progress_percent === 100).length
          const overallProgress = totalEnrolled > 0
            ? Math.round(courses.reduce((sum, c) => sum + c.progress_percent, 0) / totalEnrolled)
            : 0

          return {
            user_id: member.user_id,
            email: '', // Will be fetched separately
            display_name: (member.profiles as any)?.display_name || null,
            role: member.role,
            courses,
            overall_progress: overallProgress,
            total_completed: totalCompleted,
            total_enrolled: totalEnrolled
          }
        })
      )

      setMemberProgress(progressData)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = memberProgress
    .filter(m =>
      !searchQuery ||
      m.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return b.overall_progress - a.overall_progress
      }
      return (a.display_name || '').localeCompare(b.display_name || '')
    })

  // Stats
  const totalMembers = memberProgress.length
  const avgProgress = totalMembers > 0
    ? Math.round(memberProgress.reduce((sum, m) => sum + m.overall_progress, 0) / totalMembers)
    : 0
  const totalEnrollments = memberProgress.reduce((sum, m) => sum + m.total_enrolled, 0)
  const totalCompletions = memberProgress.reduce((sum, m) => sum + m.total_completed, 0)

  if (profile?.plan !== 'enterprise') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-slate-400">この機能はEnterpriseプランで利用可能です</p>
          <Link href="/pricing">
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
              プランを確認する
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/organization">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">学習進捗ダッシュボード</h1>
            <p className="text-slate-400">{organization?.name}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{totalMembers}</p>
                  <p className="text-sm text-slate-400">メンバー数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{avgProgress}%</p>
                  <p className="text-sm text-slate-400">平均進捗</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{totalEnrollments}</p>
                  <p className="text-sm text-slate-400">総受講数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{totalCompletions}</p>
                  <p className="text-sm text-slate-400">コース完了数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white pl-10"
              placeholder="メンバーを検索..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
              className={sortBy === 'name' ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
            >
              名前順
            </Button>
            <Button
              variant={sortBy === 'progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('progress')}
              className={sortBy === 'progress' ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
            >
              進捗順
            </Button>
          </div>
        </div>

        {/* Members Progress List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <Card key={member.user_id} className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedMember(
                    expandedMember === member.user_id ? null : member.user_id
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                      {(member.display_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {member.display_name || member.email || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{member.total_enrolled} コース受講中</span>
                        <span>•</span>
                        <span>{member.total_completed} 完了</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{member.overall_progress}%</p>
                      <p className="text-xs text-slate-400">全体進捗</p>
                    </div>
                    <div className="w-32 hidden md:block">
                      <Progress value={member.overall_progress} className="h-2" />
                    </div>
                    {expandedMember === member.user_id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Course Details */}
                {expandedMember === member.user_id && member.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    {member.courses.map((course) => (
                      <div
                        key={course.course_id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {course.progress_percent === 100 ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500" />
                          )}
                          <div>
                            <p className="text-white">{course.course_title}</p>
                            <p className="text-xs text-slate-400">
                              {course.completed_lessons}/{course.total_lessons} レッスン完了
                              {course.quiz_attempts > 0 && (
                                <span className="ml-2">
                                  • クイズ {course.quiz_passed}/{course.quiz_attempts} 合格
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress value={course.progress_percent} className="h-2" />
                          </div>
                          <Badge
                            variant={course.progress_percent === 100 ? 'default' : 'outline'}
                            className={course.progress_percent === 100
                              ? 'bg-green-600'
                              : 'border-slate-600 text-slate-400'}
                          >
                            {course.progress_percent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {expandedMember === member.user_id && member.courses.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 text-center text-slate-400 py-4">
                    まだコースに登録していません
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredMembers.length === 0 && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-12 text-center text-slate-400">
                {searchQuery ? '検索結果が見つかりません' : 'メンバーがいません'}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
