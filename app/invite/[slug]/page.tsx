'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Organization } from '@/lib/lms-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
  LogIn,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchOrganization()
    }
  }, [slug])

  useEffect(() => {
    if (user && organization) {
      checkMembership()
    }
  }, [user, organization])

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setError('組織が見つかりません')
        return
      }

      setOrganization(data)
    } catch (error) {
      console.error('Error fetching organization:', error)
      setError('組織の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async () => {
    if (!user || !organization) return

    const { data } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setAlreadyMember(true)
    }
  }

  const joinOrganization = async () => {
    if (!user || !organization) return

    setJoining(true)
    try {
      // Check member limit
      const { count } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      if (count && count >= organization.max_members) {
        toast.error('この組織のメンバー上限に達しています')
        return
      }

      // Add as member
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'member'
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('既にこの組織のメンバーです')
        } else {
          throw error
        }
        return
      }

      toast.success('組織に参加しました！')
      router.push('/admin/organization')
    } catch (error) {
      console.error('Error joining organization:', error)
      toast.error('参加に失敗しました')
    } finally {
      setJoining(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-6 text-red-400" />
              <h1 className="text-2xl font-bold text-white mb-4">エラー</h1>
              <p className="text-slate-400 mb-6">{error}</p>
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  トップページへ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (alreadyMember) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <h1 className="text-2xl font-bold text-white mb-4">参加済みです</h1>
              <p className="text-slate-400 mb-6">
                既に {organization?.name} のメンバーです
              </p>
              <Link href="/admin/organization">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  組織ページへ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-white text-2xl">組織への招待</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              {organization?.name}
            </h2>
            {organization?.description && (
              <p className="text-slate-400 mb-6">{organization.description}</p>
            )}

            {user ? (
              <div className="space-y-4">
                <p className="text-slate-300">
                  この組織に参加しますか？
                </p>
                <Button
                  onClick={joinOrganization}
                  disabled={joining}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {joining ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  組織に参加する
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400">
                  組織に参加するにはログインが必要です
                </p>
                <div className="flex gap-2">
                  <Link href={`/login?redirect=/invite/${slug}`} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <LogIn className="w-4 h-4 mr-2" />
                      ログイン
                    </Button>
                  </Link>
                  <Link href={`/signup?redirect=/invite/${slug}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      新規登録
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
