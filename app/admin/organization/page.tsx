'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Organization, OrganizationMember } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  Settings,
  Plus,
  Loader2,
  Crown,
  Shield,
  GraduationCap,
  User,
  Mail,
  Trash2,
  Copy,
  Check,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const roleLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  owner: { label: 'オーナー', icon: <Crown className="w-4 h-4" />, color: 'text-yellow-400' },
  admin: { label: '管理者', icon: <Shield className="w-4 h-4" />, color: 'text-purple-400' },
  instructor: { label: '講師', icon: <GraduationCap className="w-4 h-4" />, color: 'text-blue-400' },
  member: { label: 'メンバー', icon: <User className="w-4 h-4" />, color: 'text-slate-400' }
}

type MemberWithProfile = OrganizationMember & {
  profiles: { display_name: string | null } | null
  auth_user: { email: string } | null
}

export default function OrganizationPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [copiedInviteLink, setCopiedInviteLink] = useState(false)

  // Create form
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: ''
  })

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'instructor' | 'member'
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

      if (membership) {
        setMyRole(membership.role)

        // Get organization details
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', membership.organization_id)
          .single()

        if (org) {
          setOrganization(org)

          // Get members with profiles
          const { data: membersData } = await supabase
            .from('organization_members')
            .select(`
              *,
              profiles:user_id (display_name)
            `)
            .eq('organization_id', org.id)
            .order('role')

          if (membersData) {
            // Get emails separately (auth.users is not directly joinable)
            const memberIds = membersData.map(m => m.user_id)
            const { data: emails } = await supabase.rpc('get_user_emails', { user_ids: memberIds })

            const membersWithEmails = membersData.map(m => ({
              ...m,
              auth_user: emails?.find((e: { id: string; email: string }) => e.id === m.user_id) || null
            }))

            setMembers(membersWithEmails as MemberWithProfile[])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async () => {
    if (!createForm.name || !createForm.slug) {
      toast.error('組織名とスラッグは必須です')
      return
    }

    setSaving(true)
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: createForm.name,
          slug: createForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description: createForm.description || null,
          owner_id: user?.id
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user?.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      setOrganization(org)
      setMyRole('owner')
      setShowCreateForm(false)
      toast.success('組織を作成しました')
      fetchOrganization()
    } catch (error: any) {
      console.error('Error creating organization:', error)
      if (error.code === '23505') {
        toast.error('このスラッグは既に使用されています')
      } else {
        toast.error('組織の作成に失敗しました')
      }
    } finally {
      setSaving(false)
    }
  }

  const inviteMember = async () => {
    if (!inviteForm.email || !organization) {
      toast.error('メールアドレスを入力してください')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organization.id,
          email: inviteForm.email,
          role: inviteForm.role,
          invited_by: user?.id
        })

      if (error) throw error

      setInviteForm({ email: '', role: 'member' })
      setShowInviteForm(false)
      toast.success('招待を送信しました')
    } catch (error: any) {
      console.error('Error inviting member:', error)
      toast.error('招待の送信に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const removeMember = async (memberId: string, memberRole: string) => {
    if (memberRole === 'owner') {
      toast.error('オーナーは削除できません')
      return
    }

    if (!confirm('このメンバーを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))
      toast.success('メンバーを削除しました')
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('メンバーの削除に失敗しました')
    }
  }

  const copyInviteLink = () => {
    if (!organization) return
    const link = `${window.location.origin}/invite/${organization.slug}`
    navigator.clipboard.writeText(link)
    setCopiedInviteLink(true)
    setTimeout(() => setCopiedInviteLink(false), 2000)
    toast.success('招待リンクをコピーしました')
  }

  // Check if user has enterprise plan
  if (profile?.plan !== 'enterprise') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-slate-500" />
              <h1 className="text-2xl font-bold text-white mb-4">組織管理機能</h1>
              <p className="text-slate-400 mb-6">
                組織管理機能はEnterpriseプランで利用可能です。<br />
                チームでの学習管理、メンバー招待、進捗トラッキングなどが可能になります。
              </p>
              <Link href="/pricing">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  プランを確認する
                </Button>
              </Link>
            </CardContent>
          </Card>
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

  // No organization - show create form
  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-400" />
                組織を作成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">組織名 *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="株式会社サンプル"
                />
              </div>
              <div>
                <Label className="text-slate-300">スラッグ (URL用) *</Label>
                <Input
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="sample-company"
                />
                <p className="text-xs text-slate-500 mt-1">
                  半角英数字とハイフンのみ使用可能
                </p>
              </div>
              <div>
                <Label className="text-slate-300">説明</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="組織の説明..."
                  rows={3}
                />
              </div>
              <Button
                onClick={createOrganization}
                disabled={saving || !createForm.name || !createForm.slug}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                組織を作成
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const canManageMembers = myRole === 'owner' || myRole === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
              <p className="text-slate-400">@{organization.slug}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/organization/progress">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <BookOpen className="w-4 h-4 mr-2" />
                学習進捗
              </Button>
            </Link>
            {myRole === 'owner' && (
              <Link href="/admin/organization/settings">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stats */}
          <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{members.length}</p>
                    <p className="text-sm text-slate-400">メンバー数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white capitalize">{organization.plan}</p>
                    <p className="text-sm text-slate-400">プラン</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{organization.max_members}</p>
                    <p className="text-sm text-slate-400">最大メンバー数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  メンバー
                </CardTitle>
                {canManageMembers && (
                  <Button
                    onClick={() => setShowInviteForm(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    招待
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => {
                    const roleInfo = roleLabels[member.role]
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center ${roleInfo.color}`}>
                            {roleInfo.icon}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {member.profiles?.display_name || member.auth_user?.email || 'Unknown'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${roleInfo.color} border-current`}>
                                {roleInfo.label}
                              </Badge>
                              {member.auth_user?.email && (
                                <span className="text-xs text-slate-500">{member.auth_user.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {canManageMembers && member.role !== 'owner' && member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id, member.role)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Invite Link */}
            {canManageMembers && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-purple-400" />
                    招待リンク
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">
                    このリンクを共有してメンバーを招待できます
                  </p>
                  <Button
                    onClick={copyInviteLink}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    {copiedInviteLink ? (
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copiedInviteLink ? 'コピーしました' : 'リンクをコピー'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Invite Form Modal */}
            {showInviteForm && (
              <Card className="bg-slate-900/50 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    メンバーを招待
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">メールアドレス</Label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">役割</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(['member', 'instructor', 'admin'] as const).map((role) => (
                        <Button
                          key={role}
                          variant={inviteForm.role === role ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInviteForm({ ...inviteForm, role })}
                          className={inviteForm.role === role
                            ? 'bg-purple-600'
                            : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
                        >
                          {roleLabels[role].label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={inviteMember}
                      disabled={saving || !inviteForm.email}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                      招待を送信
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteForm(false)}
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
