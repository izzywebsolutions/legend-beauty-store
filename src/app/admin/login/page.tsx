"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Github, Chrome, Loader2, ArrowRight } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { login, loginWithGoogle, signup, forgotPassword, ActionResult } from "@/app/actions/auth"
import { useToast } from "@/components/ui/Toast"

export default function AdminLogin() {
  const [view, setView] = useState<"login" | "signup" | "forgot">("login")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const message = searchParams.get("message")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    let result: ActionResult | undefined
    if (view === "login") {
      result = await login(formData)
    } else if (view === "signup") {
      result = await signup(formData)
    } else {
      result = await forgotPassword(formData)
    }

    if (result?.error) {
      toast(result.error, "error")
    } else if (result?.success) {
      toast(result.success, "success")
      if (view === "signup" || view === "forgot") setView("login")
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await loginWithGoogle()
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex items-center justify-center">
          <Logo storeName="Admin Portal" className="h-16 w-16 object-contain rounded-full border-2 border-plum/20 bg-white" />
        </div>
        <h2 className="mt-6 text-3xl font-serif font-bold text-plum">
          {view === "login" ? "Admin Portal" : view === "signup" ? "Create Admin Account" : "Reset Password"}
        </h2>
        <p className="mt-2 text-sm text-plum/60">
          {view === "login" 
            ? "Sign in to manage Legend Beauty Store" 
            : view === "signup" 
            ? "Join the team at Legend Beauty" 
            : "Enter your email to receive a reset link"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-plum/10">
          
          {error === "auth-failed" && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs text-center font-medium border border-red-100">
              Authentication failed. Please try again.
            </div>
          )}

          {message === "password-updated" && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-xs text-center font-medium border border-green-100">
              Password updated successfully. Please sign in.
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {view === "signup" && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="mt-1 relative">
                  <Input id="fullName" name="fullName" type="text" required className="pl-10" placeholder="John Doe" />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-plum/30" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="mt-1 relative">
                <Input id="email" name="email" type="email" autoComplete="email" required className="pl-10" placeholder="admin@legendbeauty.store" />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-plum/30" />
              </div>
            </div>

            {view !== "forgot" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative">
                  <Input id="password" name="password" type="password" autoComplete="current-password" required className="pl-10" placeholder="••••••••" />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-plum/30" />
                </div>
              </div>
            )}

            {view === "login" && (
              <div className="flex items-center justify-end">
                <button 
                  type="button" 
                  onClick={() => setView("forgot")}
                  className="text-xs font-semibold text-plum/60 hover:text-plum transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-plum hover:bg-plum-light text-white font-bold rounded-xl shadow-lg shadow-plum/10" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : view === "login" ? "Sign In" : view === "signup" ? "Sign Up" : "Send Reset Link"}
            </Button>

            {view === "login" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-plum/10"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-plum/40 font-bold tracking-widest">Or continue with</span></div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 border-plum/10 hover:bg-plum/5 rounded-xl font-semibold flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setView(view === "login" ? "signup" : "login")}
              className="text-sm font-medium text-plum/60 hover:text-plum transition-colors inline-flex items-center gap-1"
            >
              {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
