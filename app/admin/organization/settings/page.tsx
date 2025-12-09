'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Organization } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Building2,
  Settings,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  Globe,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [myRole, setMyRole] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_public: false
  })

  useEffect(() => {
    if (user) {
      fetchOrganization()
    }
  }, [user])

  const fetchOrganization = async () => {
    try {
      // Get user's organization membership
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user?.id)
        .single()

      if (!membership) {
        toast.error('組織に所属していません')
        router.push('/admin/organization')
        return
      }

      setMyRole(membership.role)

      // Only owners can access settings
      if (membership.role !== 'owner') {
        toast.error('設定を変更する権限がありません')
        router.push('/admin/organization')
        return
      }

      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single()

      if (org) {
        setOrganization(org)
        setForm({
          name: org.name,
          description: org.description || '',
          is_public: org.is_public || false
        })
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
      toast.error('組織情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!organization) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: form.name,
          description: form.description || null,
          is_public: form.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id)

      if (error) throw error

      setOrganization(prev => prev ? { ...prev, ...form } : null)
      toast.success('設定を保存しました')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!organization || deleteConfirmText !== organization.name) {
      toast.error('組織名が一致しません')
      return
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id)

      if (error) throw error

      toast.success('組織を削除しました')
      router.push('/admin')
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!organization || myRole !== 'owner') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/organization">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            組織設定
          </h1>
          <p className="text-slate-400 text-sm">{organization.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Settings */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              基本設定
            </CardTitle>
            <CardDescription className="text-slate-400">
              組織の基本情報を設定します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">組織名</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="組織名を入力"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-300">スラッグ (変更不可)</Label>
              <Input
                id="slug"
                value={organization.slug}
                disabled
                className="bg-slate-800/50 border-slate-600 text-slate-500"
              />
              <p className="text-xs text-slate-500">
                招待リンク: /invite/{organization.slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">説明</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="組織の説明を入力"
                rows={3}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {form.is_public ? (
                <Globe className="w-5 h-5 text-green-400" />
              ) : (
                <Lock className="w-5 h-5 text-yellow-400" />
              )}
              公開設定
            </CardTitle>
            <CardDescription className="text-slate-400">
              組織の公開範囲を設定します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">組織を公開する</p>
                <p className="text-sm text-slate-400">
                  有効にすると、誰でも組織の情報を閲覧できます
                </p>
              </div>
              <Switch
                checked={form.is_public}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_public: checked }))}
              />
            </div>

            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white mb-2">現在の状態</h4>
              <div className="flex items-center gap-2">
                {form.is_public ? (
                  <>
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">公開</span>
                    <span className="text-slate-400 text-sm">- 誰でも閲覧可能</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">非公開</span>
                    <span className="text-slate-400 text-sm">- メンバーのみ閲覧可能</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-950/20 border-red-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              危険な操作
            </CardTitle>
            <CardDescription className="text-red-300/70">
              以下の操作は取り消すことができません
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-lg border border-red-900/50">
              <div>
                <p className="font-medium text-white">組織を削除</p>
                <p className="text-sm text-red-300/70">
                  全てのメンバー、コース登録、進捗データが削除されます
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              本当に組織を削除しますか？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              この操作は取り消せません。組織に関連するすべてのデータ（メンバー、コース登録、進捗など）が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label className="text-slate-300">
              確認のため、組織名「<span className="text-red-400 font-semibold">{organization.name}</span>」を入力してください
            </Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="組織名を入力"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmText !== organization.name}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
