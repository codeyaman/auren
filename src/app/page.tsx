"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mic, Sparkles, LogIn } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const quintEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && !!user;
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div ref={containerRef} className="relative bg-[var(--color-ground)] min-h-[200vh]">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference text-white">
        <div className="font-display font-semibold text-xl tracking-tight">Auren</div>
        <div className="flex gap-6 items-center text-sm font-medium">
          <Link href="/docs" className="hover:opacity-70 transition-opacity">Docs</Link>
          <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms</Link>
          {isAuthenticated ? (
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={handleSignIn}
              className="px-4 py-2 bg-white text-black rounded-full hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="h-screen sticky top-0 flex flex-col justify-center items-center overflow-hidden">
        
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5E6AD2]/20 via-[var(--color-ground)] to-[var(--color-ground)]"
        />

        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: quintEase, delay: 0.2 }}
          className="z-10 text-center px-4 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full hairline-border bg-[var(--color-surface-1)] text-xs text-[var(--color-secondary)] mb-8 uppercase tracking-widest">
            <Sparkles size={12} /> The Future of Language Learning
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter text-[var(--color-primary)] leading-[0.9] mb-8">
            Speak.<br />
            <span className="text-[var(--color-muted)]">Perfect.</span><br />
            Repeat.
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--color-secondary)] max-w-2xl mx-auto mb-12 font-medium">
            Auren listens to your voice in real-time, providing instant grammar and vocabulary feedback to elevate your spoken English to absolute fluency.
          </p>

          {isAuthenticated ? (
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-ground)] rounded-full text-lg font-semibold overflow-hidden"
              >
                <span className="relative z-10">Go to Dashboard</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </motion.button>
            </Link>
          ) : (
            <motion.button 
              onClick={handleSignIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-ground)] rounded-full text-lg font-semibold overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Explore</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Features Section (Stacked Cards) */}
      <div className="relative z-20">
        
        {/* Card 1 */}
        <div className="sticky top-0 h-screen w-full bg-[var(--color-ground)] flex flex-col justify-center p-8 md:p-24 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-[var(--color-primary)]">
                Real-time analysis,<br />zero latency.
              </h2>
              <p className="text-[var(--color-secondary)] text-lg md:text-xl leading-relaxed max-w-lg">
                Experience language tutoring that feels like a natural conversation. Auren analyzes your sentence structure, vocabulary choices, and pronunciation the moment you stop speaking.
              </p>
            </div>
            <div className="aspect-square rounded-3xl glass-panel flex flex-col items-center justify-center p-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <Mic size={64} className="text-[var(--color-primary)] mb-8" />
               <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ x: ["-100%", "100%"] }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                   className="w-1/3 h-full bg-[var(--color-accent)] rounded-full"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="sticky top-0 h-screen w-full bg-[var(--color-surface-1)] flex flex-col justify-center p-8 md:p-24 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t hairline-border">
          <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
             <div className="aspect-square rounded-3xl glass-panel flex items-center justify-center p-8 order-2 md:order-1 relative overflow-hidden shadow-2xl bg-[var(--color-ground)]">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale" />
               <div className="relative z-10 text-[var(--color-primary)] text-3xl font-mono tracking-tight leading-loose text-center font-medium">
                 &quot;I think we should to go.&quot;<br/>
                 <span className="text-[var(--color-secondary)] text-xl">↓</span><br/>
                 <span className="text-[var(--color-accent)]">&quot;I think we should go.&quot;</span>
               </div>
             </div>
             <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-[var(--color-primary)]">
                Contextual grammar correction.
              </h2>
              <p className="text-[var(--color-secondary)] text-lg md:text-xl leading-relaxed max-w-lg">
                Don&apos;t just learn rules; learn how to apply them. Auren provides nuanced feedback on why a phrase sounds unnatural and suggests native-sounding alternatives.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA (Card 3) */}
        <div className="sticky top-0 h-screen w-full bg-[var(--color-surface-2)] flex flex-col items-center justify-center p-8 md:p-24 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t hairline-border">
          <div className="text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-6xl md:text-8xl font-display font-bold text-[var(--color-primary)] tracking-tighter">
              Ready to sound native?
            </h2>
            {isAuthenticated ? (
              <Link href="/dashboard">
                  <button className="px-12 py-6 bg-white text-black rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl">
                    Open Auren Dashboard
                  </button>
              </Link>
            ) : (
              <button 
                onClick={handleSignIn}
                className="px-12 py-6 bg-white text-black rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl inline-flex items-center gap-3 cursor-pointer"
              >
                Explore <ArrowRight size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
