"use client";

import { motion } from "framer-motion";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google", error);
      setIsSigningIn(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[var(--color-ground)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ground)] flex flex-col relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#5E6AD2]/10 via-[var(--color-ground)] to-[var(--color-ground)]" />

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center shadow-inner">
                <Sparkles size={32} className="text-[var(--color-primary)]" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)] tracking-tight">
                  Welcome to Auren
                </h1>
                <p className="text-[var(--color-secondary)]">
                  Sign in to start your real-time language tutoring session.
                </p>
              </div>

              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-ground)] rounded-xl text-lg font-semibold overflow-hidden transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSigningIn ? "Signing In..." : "Continue with Google"}
                </span>
                {!isSigningIn && <LogIn size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <p className="text-xs text-[var(--color-muted)] max-w-xs mx-auto">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
