"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--color-ground)] p-8 md:p-24 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-white mb-12 transition-colors bg-transparent border-none cursor-pointer p-0 font-sans text-base">
        <ArrowLeft size={16} /> Go Back
      </button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-primary)] tracking-tight">Terms & Conditions</h1>
          <p className="text-xl text-[var(--color-secondary)]">Effective as of September 2026</p>
        </div>

        <div className="space-y-8 text-[var(--color-secondary)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Auren, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the Auren application for personal, non-commercial transitory viewing and learning only.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4">3. Data & Privacy</h2>
            <p>
              Voice inputs are temporarily sent to third-party APIs (such as OpenRouter or Google) solely for the purpose of grammar analysis. Session history is saved locally on your device unless otherwise specified.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
