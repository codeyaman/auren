"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useChatHistory, ChatSession } from "@/hooks/useChatHistory";
import { Mic, Square, Trash2, Clock, CheckCircle2, Download } from "lucide-react";

export default function DashboardPage() {
  const { sessions, activeSessionId, createSession, addInteraction, deleteSession, setActiveSessionId } = useChatHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const {
    isRecording,
    transcript,
    interimTranscript,
    feedback,
    isProcessing,
    isSpeaking,
    errorMessage,
    toggleRecording,
    stopSpeaking
  } = useVoiceAssistant({
    onInteractionComplete: (finalTranscript, finalFeedback) => {
      if (activeSessionId) {
        addInteraction(activeSessionId, finalTranscript, finalFeedback);
      } else {
        const newId = createSession();
        addInteraction(newId, finalTranscript, finalFeedback);
      }
    }
  });

  const quintEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const downloadSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    if (session.interactions.length === 0) return;
    
    const text = session.interactions.map(i => `You: ${i.transcript}\n\nAuren: ${i.feedback}\n\n---\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Auren_Chat_${new Date(session.date).toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row h-full max-w-7xl mx-auto p-4 lg:p-8 gap-8">
      
      {/* Left Column: History Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: quintEase, delay: 0.1 }}
        className="hidden lg:flex w-80 flex-col gap-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-mono text-[var(--color-muted)] uppercase tracking-wider">Session History</h2>
          <button 
            onClick={() => createSession()}
            className="text-xs text-[var(--color-accent)] hover:text-white transition-colors"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-sm text-[var(--color-muted)] p-4 text-center border border-dashed border-[var(--color-hairline)] rounded-xl">
              No previous sessions. Start talking to create one.
            </div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeSessionId === session.id 
                    ? 'bg-[var(--color-surface-2)] hairline-border' 
                    : 'hover:bg-[var(--color-surface-2)]/50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <Clock size={12} />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => downloadSession(session, e)}
                      className="text-[var(--color-muted)] opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-all"
                      title="Download Chat"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="text-[var(--color-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)] line-clamp-2 leading-relaxed">
                  {session.interactions[0]?.transcript || "Empty session..."}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Right Column: Active Interface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: quintEase }}
        className="flex-1 flex flex-col items-center justify-center relative min-h-[100dvh] lg:min-h-full glass-panel overflow-hidden"
      >
        {/* Status indicator top right */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-blue-500 animate-pulse' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-[var(--color-secondary)] uppercase tracking-wider font-mono">
            {isRecording ? 'Listening' : isSpeaking ? 'Speaking' : isProcessing ? 'Analyzing' : 'Ready'}
          </span>
        </div>

        {/* Central visualizer area */}
        <div className="flex flex-col items-center justify-center w-full max-w-2xl px-6 py-12 pb-32 lg:pb-12 flex-1">
          
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-8"
              >
                {errorMessage}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Current Transcript / Feedback Display */}
          <div className="w-full space-y-8 min-h-[200px] flex flex-col justify-center">
            {(!transcript && !interimTranscript && !isRecording && !isProcessing && !feedback && (!activeSession || activeSession.interactions.length === 0)) ? (
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-center space-y-4"
               >
                 <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)]">
                   <Mic size={24} />
                 </div>
                 <p className="text-[var(--color-muted)] text-lg">Tap the mic and say hello.</p>
               </motion.div>
            ) : (
              <div className="space-y-6 w-full">
                
                {/* Active Transcription */}
                {(transcript || interimTranscript) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <h3 className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-mono">You</h3>
                    <p className="text-2xl text-[var(--color-primary)] font-medium leading-relaxed tracking-tight">
                      {transcript} <span className="text-[var(--color-secondary)]">{interimTranscript}</span>
                    </p>
                  </motion.div>
                )}

                {/* AI Feedback */}
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-6 hairline-border-t">
                    <h3 className="text-xs text-[var(--color-accent)] uppercase tracking-wider font-mono flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Auren Analysis
                    </h3>
                    <p className="text-lg text-[var(--color-secondary)] leading-relaxed">
                      {feedback}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Past History in Active Session */}
          {activeSession && activeSession.interactions.length > 0 && !transcript && !interimTranscript && !feedback && (
            <div className="w-full space-y-6 max-h-[50vh] overflow-y-auto pr-4 mt-8 custom-scrollbar">
               {activeSession.interactions.map((interaction, i) => (
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  key={interaction.id} className="space-y-4 p-4 rounded-xl bg-[var(--color-surface-2)]/30 hairline-border"
                 >
                    <div className="space-y-1">
                      <h3 className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-mono">You said</h3>
                      <p className="text-[var(--color-primary)]">{interaction.transcript}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] text-[var(--color-accent)] uppercase tracking-wider font-mono">Auren Feedback</h3>
                      <p className="text-[var(--color-secondary)] text-sm">{interaction.feedback}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}

        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <button 
            onClick={toggleRecording}
            disabled={isProcessing || isSpeaking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isRecording 
                ? 'bg-red-500 text-white shadow-red-500/20' 
                : isProcessing || isSpeaking
                ? 'bg-[var(--color-surface-2)] text-[var(--color-muted)] cursor-not-allowed opacity-50'
                : 'bg-[var(--color-primary)] text-[var(--color-ground)] hover:scale-105 hover:bg-white'
            }`}
          >
            {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
          </button>
          
          <AnimatePresence>
            {isSpeaking && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={stopSpeaking}
                className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] text-[var(--color-primary)] hairline-border flex items-center justify-center hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <Square size={16} fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}
