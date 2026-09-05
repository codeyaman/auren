"use client";

import Link from "next/link";
import { Settings, Home, MessageSquare, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="h-screen w-full bg-[var(--color-ground)] flex items-center justify-center text-[var(--color-primary)]">Loading...</div>;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Chat", href: "/dashboard", icon: MessageSquare },
    { name: "Docs", href: "/docs", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-ground)] overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex w-72 flex-col hairline-border-r bg-[var(--color-surface-1)] p-4 relative z-20"
      >
        <div className="flex items-center gap-2 mb-8 px-2 pt-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
             <span className="text-[var(--color-ground)] font-bold font-display text-sm">A</span>
          </div>
          <span className="font-display font-semibold text-lg text-[var(--color-primary)] tracking-tight">Auren</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                pathname === item.href 
                  ? "bg-[var(--color-surface-2)] text-[var(--color-primary)] shadow-sm hairline-border" 
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]/50 hover:text-[var(--color-secondary)]"
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 hairline-border-t pb-2">
           <div className="px-3 py-2 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-3)]"></div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[var(--color-primary)] truncate max-w-[120px]">{user?.displayName || "User"}</span>
                  <span className="text-[10px] text-[var(--color-muted)]">Local Storage</span>
                </div>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="text-[var(--color-muted)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
           </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 hairline-border-b bg-[var(--color-ground)]/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
        <span className="font-display font-semibold text-lg text-[var(--color-primary)] tracking-tight">Auren</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[var(--color-primary)]">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-20 bg-[var(--color-surface-1)] pt-20 px-4"
          >
             <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${
                    pathname === item.href 
                      ? "bg-[var(--color-surface-2)] text-[var(--color-primary)] hairline-border" 
                      : "text-[var(--color-secondary)]"
                  }`}
                >
                  <item.icon size={24} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden md:pl-0 pt-16 md:pt-0">
         {/* Grid Background Effect */}
         <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--color-accent)] opacity-20 blur-[100px]"></div>
         
         <div className="relative z-10 h-full overflow-y-auto">
           {children}
         </div>
      </main>
    </div>
  );
}
