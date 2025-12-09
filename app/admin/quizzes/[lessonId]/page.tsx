'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Quiz, QuizQuestion, QuizOption, QuestionType } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  HelpCircle,
  ListChecks,
  ToggleLeft,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

const questionTypeLabels: Record<QuestionType, string> = {
  single_choice: '単一選択',
  multiple_choice: '複数選択',
  true_false: '○×問題',
  text: '記述式'
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  single_choice: <Circle className="w-4 h-4" />,
  multiple_choice: <ListChecks className="w-4 h-4" />,
  true_false: <ToggleLeft className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />
}

type QuestionWithOptions = QuizQuestion & { options: QuizOption[] }

export default function QuizEditorPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params?.lessonId as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  // Quiz form
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit_minutes: null as number | null,
    max_attempts: null as number | null,
    is_required: false
  })

  // New question form
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'single_choice' as QuestionType,
    points: 1,
    explanation: '',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  })

  useEffect(() => {
    if (lessonId && user) {
      fetchData()
    }
  }, [lessonId, user])

  const fetchData = async () => {
    try {
      // Get lesson info
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, course_id')
        .eq('id', lessonId)
        .single()

      if (lesson) {
        setLessonTitle(lesson.title)
      }

      // Get quiz if exists
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .single()

      if (quizData) {
        setQuiz(quizData)
        setQuizForm({
          title: quizData.title,
          description: quizData.description || '',
          passing_score: quizData.passing_score,
          time_limit_minutes: quizData.time_limit_minutes,
          max_attempts: quizData.max_attempts,
          is_required: quizData.is_required
        })

        // Get questions with options
        const { data: questionsData } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('sort_order')

        if (questionsData) {
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
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const saveQuiz = async () => {
    setSaving(true)
    try {
      if (quiz) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update({
            ...quizForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', quiz.id)

        if (error) throw error
        toast.success('クイズを更新しました')
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            ...quizForm
          })
          .select()
          .single()

        if (error) throw error
        setQuiz(data)
        toast.success('クイズを作成しました')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = async () => {
    if (!quiz) {
      toast.error('先にクイズを保存してください')
      return
    }

    try {
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_text: newQuestion.question_text,
          question_type: newQuestion.question_type,
          points: newQuestion.points,
          explanation: newQuestion.explanation || null,
          sort_order: questions.length
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Add options for choice questions
      if (['single_choice', 'multiple_choice', 'true_false'].includes(newQuestion.question_type)) {
        const optionsToInsert = newQuestion.question_type === 'true_false'
          ? [
              { question_id: questionData.id, option_text: '○ (正しい)', is_correct: newQuestion.options[0]?.is_correct || false, sort_order: 0 },
              { question_id: questionData.id, option_text: '× (誤り)', is_correct: newQuestion.options[1]?.is_correct || false, sort_order: 1 }
            ]
          : newQuestion.options.map((opt, idx) => ({
              question_id: questionData.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              sort_order: idx
            }))

        const { data: optionsData, error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert)
          .select()

        if (optionsError) throw optionsError

        setQuestions([...questions, { ...questionData, options: optionsData }])
      } else {
        setQuestions([...questions, { ...questionData, options: [] }])
      }

      // Reset form
      setNewQuestion({
        question_text: '',
        question_type: 'single_choice',
        points: 1,
        explanation: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      })
      setShowNewQuestion(false)
      toast.success('問題を追加しました')
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('問題の追加に失敗しました')
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('この問題を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      setQuestions(questions.filter(q => q.id !== questionId))
      toast.success('問題を削除しました')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('削除に失敗しました')
    }
  }

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { option_text: '', is_correct: false }]
    })
  }

  const updateOption = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    const updatedOptions = [...newQuestion.options]
    if (field === 'is_correct' && newQuestion.question_type === 'single_choice') {
      // For single choice, only one can be correct
      updatedOptions.forEach((opt, i) => {
        opt.is_correct = i === index ? (value as boolean) : false
      })
    } else {
      updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    }
    setNewQuestion({ ...newQuestion, options: updatedOptions })
  }

  const removeOption = (index: number) => {
    if (newQuestion.options.length <= 2) return
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index)
    })
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">クイズ編集</h1>
            <p className="text-slate-400">レッスン: {lessonTitle}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quiz Settings */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  クイズ設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">タイトル</Label>
                  <Input
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="確認テスト"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">説明</Label>
                  <Textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="このレッスンの理解度を確認します"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">合格点 (%)</Label>
                  <Input
                    type="number"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })}
                    className="bg-slate-800 border-slate-600 text-white"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">制限時間 (分、空白で無制限)</Label>
                  <Input
                    type="number"
                    value={quizForm.time_limit_minutes || ''}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
                    className="bg-slate-800 border-slate-600 text-white"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">最大受験回数 (空白で無制限)</Label>
                  <Input
                    type="number"
                    value={quizForm.max_attempts || ''}
                    onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value ? parseInt(e.target.value) : null })}
                    className="bg-slate-800 border-slate-600 text-white"
                    min={1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">必須クイズ</Label>
                  <Switch
                    checked={quizForm.is_required}
                    onCheckedChange={(checked) => setQuizForm({ ...quizForm, is_required: checked })}
                  />
                </div>
                <Button
                  onClick={saveQuiz}
                  disabled={saving || !quizForm.title}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {quiz ? '設定を更新' : 'クイズを作成'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Questions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">問題一覧</h2>
              <Button
                onClick={() => setShowNewQuestion(true)}
                disabled={!quiz}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                問題を追加
              </Button>
            </div>

            {!quiz && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-8 text-center text-slate-400">
                  先にクイズ設定を保存してから問題を追加できます
                </CardContent>
              </Card>
            )}

            {/* Questions List */}
            {questions.map((question, index) => (
              <Card key={question.id} className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge variant="outline" className="mt-1 border-purple-500 text-purple-400">
                        Q{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {questionTypeIcons[question.question_type]}
                          <span className="text-xs text-slate-400">{questionTypeLabels[question.question_type]}</span>
                          <span className="text-xs text-slate-500">({question.points}点)</span>
                        </div>
                        <p className="text-white">{question.question_text}</p>
                        {question.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((opt) => (
                              <div key={opt.id} className="flex items-center gap-2 text-sm">
                                {opt.is_correct ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500" />
                                )}
                                <span className={opt.is_correct ? 'text-green-400' : 'text-slate-400'}>
                                  {opt.option_text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* New Question Form */}
            {showNewQuestion && (
              <Card className="bg-slate-900/50 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-white text-lg">新しい問題</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">問題タイプ</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                        <Button
                          key={type}
                          variant={newQuestion.question_type === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const options = type === 'true_false'
                              ? [{ option_text: '○', is_correct: true }, { option_text: '×', is_correct: false }]
                              : type === 'text'
                              ? []
                              : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]
                            setNewQuestion({ ...newQuestion, question_type: type, options })
                          }}
                          className={newQuestion.question_type === type
                            ? 'bg-purple-600'
                            : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
                        >
                          {questionTypeIcons[type]}
                          <span className="ml-1 text-xs">{questionTypeLabels[type]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">問題文</Label>
                    <Textarea
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="問題文を入力してください"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">配点</Label>
                    <Input
                      type="number"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                      className="bg-slate-800 border-slate-600 text-white w-24"
                      min={1}
                    />
                  </div>

                  {/* Options for choice questions */}
                  {['single_choice', 'multiple_choice'].includes(newQuestion.question_type) && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">選択肢</Label>
                      <div className="space-y-2">
                        {newQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateOption(idx, 'is_correct', !opt.is_correct)}
                              className={opt.is_correct ? 'text-green-400' : 'text-slate-500'}
                            >
                              {opt.is_correct ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </Button>
                            <Input
                              value={opt.option_text}
                              onChange={(e) => updateOption(idx, 'option_text', e.target.value)}
                              className="bg-slate-800 border-slate-600 text-white flex-1"
                              placeholder={`選択肢 ${idx + 1}`}
                            />
                            {newQuestion.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(idx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          選択肢を追加
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* True/False options */}
                  {newQuestion.question_type === 'true_false' && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">正解を選択</Label>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={newQuestion.options[0]?.is_correct ? 'default' : 'outline'}
                          onClick={() => setNewQuestion({
                            ...newQuestion,
                            options: [
                              { option_text: '○', is_correct: true },
                              { option_text: '×', is_correct: false }
                            ]
                          })}
                          className={newQuestion.options[0]?.is_correct ? 'bg-green-600' : 'border-slate-600'}
                        >
                          ○ 正しい
                        </Button>
                        <Button
                          type="button"
                          variant={newQuestion.options[1]?.is_correct ? 'default' : 'outline'}
                          onClick={() => setNewQuestion({
                            ...newQuestion,
                            options: [
                              { option_text: '○', is_correct: false },
                              { option_text: '×', is_correct: true }
                            ]
                          })}
                          className={newQuestion.options[1]?.is_correct ? 'bg-red-600' : 'border-slate-600'}
                        >
                          × 誤り
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-300">解説 (任意)</Label>
                    <Textarea
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="回答後に表示される解説"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={addQuestion}
                      disabled={!newQuestion.question_text}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      問題を追加
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewQuestion(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      キャンセル
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
