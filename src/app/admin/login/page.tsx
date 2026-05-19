"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Logo } from "@/components/ui/Logo"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Invalid email or password")
      } else if (data.user && data.session) {
        // Set a secure cookie for the middleware to read
        document.cookie = `sb-auth-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        // Success
        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex items-center justify-center">
          <Logo storeName="Admin Portal" className="h-16 w-16 object-contain rounded-full border-2 border-plum/20 bg-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-plum">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-plum/60">
          Sign in to manage Legend Beauty Store
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-plum/10">
          <form className="space-y-6" onSubmit={handleLogin}>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Administrator Email</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Administrator Password</Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
