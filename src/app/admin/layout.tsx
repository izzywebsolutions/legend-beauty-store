"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, List, ShoppingBag, Settings, LogOut, User as UserIcon } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import Image from "next/image"
import { getSiteSettings, SiteSettings } from "@/lib/data"
import { Logo } from "@/components/ui/Logo"
import { ToastProvider } from "@/components/ui/Toast"

export default function AdminLayout({
   children,
}: {
   children: React.ReactNode
}) {
   const router = useRouter()
   const pathname = usePathname()
   const isLoginPage = pathname === "/admin/login"
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const [settings, setSettings] = useState<SiteSettings | null>(null)

   useEffect(() => {
     let mounted = true;

     // Don't check auth on the login page itself
     if (isLoginPage) {
       setLoading(false)
       return
     }

     const checkSession = async () => {
       try {
         // Use getSession() instead of getUser() to prevent "sb-auth-token lock released" errors
         const { data: { session }, error } = await supabase.auth.getSession()
         
         if (!mounted) return;

         if (error || !session?.user) {
           router.push("/admin/login")
         } else {
           setUser(session.user)
           const siteSettings = await getSiteSettings()
           if (mounted) {
             setSettings(siteSettings)
           }
         }
       } catch (error) {
         console.error("Auth check failed:", error)
         if (mounted) router.push("/admin/login")
       } finally {
         if (mounted) setLoading(false)
       }
     }

     checkSession()

     return () => {
       mounted = false;
     }
   }, [router, isLoginPage])
   const handleLogOut = async () => {
      await supabase.auth.signOut()
      // Clear the middleware auth cookie
      document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax'
      router.push("/admin/login")
      router.refresh()
   }

   if (loading) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
           <div className="text-plum animate-pulse font-serif text-xl">Loading Legend Admin...</div>
        </div>
      )
   }

   // If it's the login page, just render children without sidebar/header
   if (isLoginPage) {
      return <>{children}</>
   }

   if (!user) return null

   return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream">

         {/* Sidebar */}
         <aside className="w-64 bg-plum text-white flex-shrink-0 flex flex-col hidden md:flex">
             <div className="h-20 flex items-center px-8 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3 transition-transform hover:scale-105">
                   <Logo storeName="Admin" className="h-10 w-10 object-contain rounded-full border border-plum/10 bg-white flex-shrink-0" />
                   <div className="flex flex-col">
                     <span className="font-serif text-xl font-bold tracking-tight text-gold leading-tight">Admin</span>
                     <span className="text-[9px] text-white/70 font-semibold tracking-[0.2em] uppercase leading-tight">Legend Beauty</span>
                   </div>
                </Link>
             </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
               <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white transition-colors">
                  <LayoutDashboard className="h-5 w-5 text-gold" />
                  <span className="font-medium text-sm">Dashboard</span>
               </Link>
               <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <Package className="h-5 w-5 text-gold/70" />
                  <span className="font-medium text-sm">Products</span>
               </Link>
               <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <List className="h-5 w-5 text-gold/70" />
                  <span className="font-medium text-sm">Categories</span>
               </Link>
               <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <ShoppingBag className="h-5 w-5 text-gold/70" />
                  <span className="font-medium text-sm">Orders</span>
               </Link>
               <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings className="h-5 w-5 text-gold/70" />
                  <span className="font-medium text-sm">Settings</span>
               </Link>
            </nav>

            <div className="p-4 border-t border-white/10">
               <button
                  onClick={handleLogOut}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-300 hover:bg-white/5 transition-colors"
               >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium text-sm">Log Out</span>
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header */}
            <header className="h-20 bg-white border-b border-plum/10 flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
               <h1 className="font-serif text-2xl text-plum">Overview</h1>
               <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end hidden sm:flex">
                     <span className="text-sm font-semibold text-plum truncate max-w-[200px]">{user?.email}</span>
                     <span className="text-[10px] text-gold uppercase tracking-wider font-bold">Administrator</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cream border border-plum/20 flex items-center justify-center text-plum font-semibold">
                     <UserIcon className="h-5 w-5 opacity-70" />
                  </div>
               </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-10">
               {children}
            </main>
         </div>

      </div>
    </ToastProvider>
   )
}
