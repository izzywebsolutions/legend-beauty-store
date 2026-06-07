"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { updatePassword } from "@/app/actions/reset-password"
import { useToast } from "@/components/ui/Toast"
import { ActionResult } from "@/app/actions/auth"

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result: ActionResult | undefined = await updatePassword(formData)

    if (result?.error) {
      toast(result.error, "error")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex items-center justify-center">
          <Logo storeName="Reset Password" className="h-16 w-16 object-contain rounded-full border-2 border-plum/20 bg-white" />
        </div>
        <h2 className="mt-6 text-3xl font-serif font-bold text-plum">
          Set New Password
        </h2>
        <p className="mt-2 text-sm text-plum/60">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-plum/10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="mt-1 relative">
                <Input id="password" name="password" type="password" required className="pl-10" placeholder="••••••••" />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-plum/30" />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-plum hover:bg-plum-light text-white font-bold rounded-xl shadow-lg shadow-plum/10" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
