'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Quiz, QuizQuestion, QuizOption, QuizAttempt } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Trophy,
  XCircle,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

type QuestionWithOptions = QuizQuestion & { options: QuizOption[] }
type Answer = {
  questionId: string
  selectedOptionIds: string[]
  textAnswer: string
}

export default function QuizTakePage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.quizId as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    passed: boolean
    totalPoints: number
    earnedPoints: number
    correctCount: number
  } | null>(null)

  useEffect(() => {
    if (quizId && user) {
      fetchQuizData()
    }
  }, [quizId, user])

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, showResults])

  const fetchQuizData = async () => {
    try {
      // Get quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Check existing attempts
      if (quizData.max_attempts) {
        const { count } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quizId)
          .eq('user_id', user?.id)
          .not('completed_at', 'is', null)

        if (count && count >= quizData.max_attempts) {
          toast.error('受験回数の上限に達しています')
          router.back()
          return
        }
      }

      // Get questions with options
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('sort_order')

      if (questionsError) throw questionsError

      const questionsWithOptions = await Promise.all(
        questionsData.map(async (q) => {
          const { data: options } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('sort_order')
          return { ...q, options: options || [] }
        })
      )

      setQuestions(questionsWithOptions)
      setAnswers(questionsWithOptions.map(q => ({
        questionId: q.id,
        selectedOptionIds: [],
        textAnswer: ''
      })))

      // Create attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user?.id,
          quiz_id: quizId,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (attemptError) throw attemptError
      setAttempt(attemptData)

      // Set timer if time limit exists
      if (quizData.time_limit_minutes) {
        setTimeLeft(quizData.time_limit_minutes * 60)
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast.error('クイズの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const selectOption = (questionIndex: number, optionId: string) => {
    const question = questions[questionIndex]
    const updatedAnswers = [...answers]

    if (question.question_type === 'single_choice' || question.question_type === 'true_false') {
      updatedAnswers[questionIndex].selectedOptionIds = [optionId]
    } else if (question.question_type === 'multiple_choice') {
      const currentIds = updatedAnswers[questionIndex].selectedOptionIds
      if (currentIds.includes(optionId)) {
        updatedAnswers[questionIndex].selectedOptionIds = currentIds.filter(id => id !== optionId)
      } else {
        updatedAnswers[questionIndex].selectedOptionIds = [...currentIds, optionId]
      }
    }

    setAnswers(updatedAnswers)
  }

  const setTextAnswer = (questionIndex: number, text: string) => {
    const updatedAnswers = [...answers]
    updatedAnswers[questionIndex].textAnswer = text
    setAnswers(updatedAnswers)
  }

  const handleSubmit = async () => {
    if (!attempt || !quiz) return
    setSubmitting(true)

    try {
      let totalPoints = 0
      let earnedPoints = 0
      let correctCount = 0

      // Calculate scores and save answers
      const answersToInsert = answers.map((answer, index) => {
        const question = questions[index]
        totalPoints += question.points

        let isCorrect = false
        let pointsEarned = 0

        if (question.question_type === 'text') {
          // Text answers need manual grading - mark as null
          isCorrect = false // Will be graded later
        } else {
          const correctOptionIds = question.options
            .filter(opt => opt.is_correct)
            .map(opt => opt.id)
            .sort()
          const selectedIds = answer.selectedOptionIds.sort()

          isCorrect =
            correctOptionIds.length === selectedIds.length &&
            correctOptionIds.every((id, i) => id === selectedIds[i])

          if (isCorrect) {
            pointsEarned = question.points
            earnedPoints += question.points
            correctCount++
          }
        }

        return {
          attempt_id: attempt.id,
          question_id: question.id,
          selected_option_ids: answer.selectedOptionIds.length > 0 ? answer.selectedOptionIds : null,
          text_answer: answer.textAnswer || null,
          is_correct: question.question_type === 'text' ? null : isCorrect,
          points_earned: pointsEarned
        }
      })

      // Save answers
      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answersToInsert)

      if (answersError) throw answersError

      // Calculate final score
      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
      const passed = score >= quiz.passing_score

      // Update attempt
      const timeSpent = quiz.time_limit_minutes && timeLeft !== null
        ? (quiz.time_limit_minutes * 60) - timeLeft
        : null

      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .update({
          score,
          passed,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent
        })
        .eq('id', attempt.id)

      if (attemptError) throw attemptError

      setResults({
        score,
        passed,
        totalPoints,
        earnedPoints,
        correctCount
      })
      setShowResults(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('回答の送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              {results.passed ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-green-400 mb-2">合格！</h1>
                  <p className="text-slate-400 mb-6">おめでとうございます！</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-red-400 mb-2">不合格</h1>
                  <p className="text-slate-400 mb-6">もう一度チャレンジしましょう</p>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-4xl font-bold text-white">{results.score}%</p>
                  <p className="text-sm text-slate-400">スコア</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-4xl font-bold text-white">{results.correctCount}/{questions.length}</p>
                  <p className="text-sm text-slate-400">正解数</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
                {!results.passed && quiz?.max_attempts !== 1 && (
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    もう一度挑戦
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Answers */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">回答の確認</h2>
            {questions.map((question, index) => {
              const answer = answers[index]
              const correctOptionIds = question.options.filter(o => o.is_correct).map(o => o.id)
              const isCorrect = question.question_type !== 'text' &&
                correctOptionIds.length === answer.selectedOptionIds.length &&
                correctOptionIds.every(id => answer.selectedOptionIds.includes(id))

              return (
                <Card key={question.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="text-white mb-2">Q{index + 1}. {question.question_text}</p>
                        {question.options.map(opt => (
                          <div key={opt.id} className="flex items-center gap-2 text-sm">
                            {opt.is_correct ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : answer.selectedOptionIds.includes(opt.id) ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500" />
                            )}
                            <span className={
                              opt.is_correct ? 'text-green-400' :
                              answer.selectedOptionIds.includes(opt.id) ? 'text-red-400' :
                              'text-slate-400'
                            }>
                              {opt.option_text}
                            </span>
                          </div>
                        ))}
                        {question.explanation && (
                          <div className="mt-2 p-2 bg-slate-800/50 rounded text-sm text-slate-300">
                            <strong>解説:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const answer = answers[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{quiz?.title}</h1>
            <p className="text-slate-400 text-sm">問題 {currentQuestion + 1} / {questions.length}</p>
          </div>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? 'destructive' : 'outline'} className="text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-8 h-2" />

        {/* Question */}
        <Card className="bg-slate-900/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Q{currentQuestion + 1}. {question.question_text}
            </CardTitle>
            <p className="text-slate-400 text-sm">{question.points}点</p>
          </CardHeader>
          <CardContent>
            {/* Choice Options */}
            {['single_choice', 'multiple_choice', 'true_false'].includes(question.question_type) && (
              <div className="space-y-3">
                {question.options.map((opt) => {
                  const isSelected = answer.selectedOptionIds.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(currentQuestion, opt.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                        {opt.option_text}
                      </div>
                    </button>
                  )
                })}
                {question.question_type === 'multiple_choice' && (
                  <p className="text-slate-400 text-sm">※ 複数選択可能</p>
                )}
              </div>
            )}

            {/* Text Answer */}
            {question.question_type === 'text' && (
              <Textarea
                value={answer.textAnswer}
                onChange={(e) => setTextAnswer(currentQuestion, e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="回答を入力してください"
                rows={4}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            前の問題
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-purple-600 text-white'
                    : answers[index].selectedOptionIds.length > 0 || answers[index].textAnswer
                    ? 'bg-green-600/50 text-green-300'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              次の問題
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              回答を送信
            </Button>
          )}
        </div>

        {/* Unanswered Warning */}
        {answers.some((a, i) =>
          questions[i].question_type !== 'text'
            ? a.selectedOptionIds.length === 0
            : !a.textAnswer
        ) && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            未回答の問題があります
          </div>
        )}
      </div>
    </div>
  )
}
