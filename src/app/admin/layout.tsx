"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, List, ShoppingBag, Settings, LogOut, User as UserIcon, Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState, useCallback } from "react"
import { User } from "@supabase/supabase-js"
import Image from "next/image"
import { getSiteSettings, SiteSettings } from "@/lib/data"
import { Logo } from "@/components/ui/Logo"
import { ToastProvider } from "@/components/ui/Toast"
import { motion, AnimatePresence } from "framer-motion"
import { logout } from "@/app/actions/auth"

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
   const [sidebarOpen, setSidebarOpen] = useState(false)

   // Close sidebar when clicking ESC
   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === 'Escape') setSidebarOpen(false)
      }
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
   }, [])

   // Close sidebar on route change (for mobile)
   useEffect(() => {
      setSidebarOpen(false)
   }, [pathname])

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
           // Role check
           const { data: profile } = await supabase
             .from('profiles')
             .select('role')
             .eq('id', session.user.id)
             .single()

           if (profile?.role !== 'admin') {
             await logout()
             return
           }

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
      await logout()
   }

   const toggleSidebar = useCallback(() => {
      setSidebarOpen(prev => !prev)
   }, [])

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

   const navLinks = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: List },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/settings", label: "Settings", icon: Settings },
   ]

   return (
      <div className="flex min-h-screen bg-cream overflow-hidden">

         {/* Mobile Overlay */}
         <AnimatePresence>
            {sidebarOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-plum/40 backdrop-blur-sm z-40"
               />
            )}
         </AnimatePresence>

         {/* Sidebar Drawer */}
         <AnimatePresence>
            {(sidebarOpen) && (
               <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col shadow-2xl overflow-hidden"
                  style={{
                     backdropFilter: "blur(20px)",
                     background: "rgba(74, 14, 46, 0.95)", // Glassy plum
                     borderRight: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
               >
                  <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                     <Link href="/admin" className="flex items-center gap-3 transition-transform hover:scale-105">
                        <Logo storeName="Admin" className="h-10 w-10 object-contain rounded-full border border-plum/10 bg-white flex-shrink-0" />
                        <div className="flex flex-col text-white">
                           <span className="font-serif text-xl font-bold tracking-tight text-gold leading-tight">Admin</span>
                           <span className="text-[9px] text-white/70 font-semibold tracking-[0.2em] uppercase leading-tight">Legend Beauty</span>
                        </div>
                     </Link>
                     <button 
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                     >
                        <X className="h-6 w-6" />
                     </button>
                  </div>

                  <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                     {navLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                           <Link 
                              key={link.href}
                              href={link.href} 
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                 isActive 
                                 ? "bg-white/10 text-white shadow-inner border border-white/10" 
                                 : "text-white/60 hover:bg-white/5 hover:text-white"
                              }`}
                           >
                              <Icon className={`h-5 w-5 ${isActive ? "text-gold" : "text-gold/50"}`} />
                              <span className="font-medium text-sm">{link.label}</span>
                           </Link>
                        )
                     })}
                  </nav>

                  <div className="p-4 border-t border-white/10 bg-black/10">
                     <button
                        onClick={handleLogOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-300"
                     >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium text-sm">Log Out</span>
                     </button>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header */}
            <header className="h-20 bg-white border-b border-plum/10 flex items-center justify-between px-4 sm:px-6 lg:px-10 flex-shrink-0 sticky top-0 z-30">
               <div className="flex items-center gap-4">
                  <button 
                     onClick={toggleSidebar}
                     className="p-2.5 rounded-xl bg-plum/5 text-plum hover:bg-plum/10 transition-all active:scale-95"
                     aria-label="Toggle Menu"
                  >
                     <Menu className="h-6 w-6" />
                  </button>
                  <h1 className="font-serif text-xl sm:text-2xl text-plum truncate">
                     {navLinks.find(l => pathname === l.href)?.label || "Admin Overview"}
                  </h1>
               </div>

               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-end hidden xs:flex">
                     <span className="text-xs sm:text-sm font-semibold text-plum truncate max-w-[120px] sm:max-w-[200px]">{user?.email}</span>
                     <span className="text-[9px] sm:text-[10px] text-gold uppercase tracking-wider font-bold">Administrator</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cream border border-plum/20 flex items-center justify-center text-plum font-semibold shadow-sm">
                     <UserIcon className="h-5 w-5 opacity-70" />
                  </div>
               </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
               {children}
            </main>
         </div>

      </div>
   )
}
