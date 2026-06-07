"use server"

import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { ActionResult } from './auth'

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/admin/login?message=password-updated')
}
