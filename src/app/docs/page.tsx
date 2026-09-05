"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-ground)] p-8 md:p-24 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-white mb-12 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-primary)] tracking-tight">Documentation</h1>
          <p className="text-xl text-[var(--color-secondary)]">Learn how to get the most out of Auren.</p>
        </div>

        <div className="space-y-8 prose prose-invert prose-p:text-[var(--color-secondary)] prose-headings:text-[var(--color-primary)] max-w-none">
          <section className="glass-panel p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="leading-relaxed mb-4">
              Auren uses the Web Speech API to listen to your voice and natural language processing to analyze your grammar. 
              To start, simply navigate to the Dashboard and grant microphone permissions when prompted.
            </p>
            <p className="leading-relaxed">
              We recommend using <strong>Google Chrome</strong> for the best voice recognition accuracy.
            </p>
          </section>

          <section className="glass-panel p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-4">Privacy & History</h2>
            <p className="leading-relaxed">
              All of your conversations are processed in real-time. Your chat history is stored <strong>locally on your device</strong> using browser Local Storage. 
              We do not persist your voice data on our servers.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
