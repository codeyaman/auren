'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNewTurnRef = useRef(false);

  useEffect(() => {
    // Initialize SpeechRecognition on mount
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          setErrorMessage(''); // Clear errors when getting results
          let final = '';
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (isNewTurnRef.current && (final || interim)) {
            setTranscript(final);
            setFeedback('');
            isNewTurnRef.current = false;
          } else {
            setTranscript((prev) => prev + final);
          }
          
          setInterimTranscript(interim);

          // Reset silence timer every time we get a result
          resetSilenceTimer();
        };

        recognition.onend = () => {
          setIsRecording(false);
          clearTimeout(silenceTimerRef.current as NodeJS.Timeout);
          // If we have text AND they actually spoke in this turn, process it
          if ((transcriptRef.current || interimRef.current) && !isNewTurnRef.current) {
             processAudio();
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setErrorMessage(`Microphone error: ${event.error}. Please ensure microphone permissions are granted and you are using Google Chrome.`);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported in this browser.');
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Update transcript ref for the process step
  const transcriptRef = useRef(transcript);
  const interimRef = useRef(interimTranscript);
  useEffect(() => {
    transcriptRef.current = transcript;
    interimRef.current = interimTranscript;
  }, [transcript, interimTranscript]);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      // 2 seconds of silence
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 2000);
  };

  const processAudio = async () => {
    setIsProcessing(true);
    setInterimTranscript('');
    
    // The final combined text
    const fullText = transcriptRef.current + ' ' + interimRef.current;
    const finalTranscript = fullText.trim();
    setTranscript(finalTranscript);

    if (!finalTranscript) {
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze transcript');
      }

      setFeedback(data.feedback);
      speakFeedback(data.feedback);
    } catch (error: any) {
      console.error(error);
      setFeedback('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakFeedback = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to find an English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        
        // Auto-restart listening but keep text on screen until they reply
        isNewTurnRef.current = true;
        setIsRecording(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Could not start recognition', e);
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      setFeedback('');
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Could not start recognition', e);
        }
      }
    }
  };

  // Linear quint easing
  const quintEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 lg:p-24 bg-[var(--color-ground)] relative overflow-hidden">
      
      {/* Background subtle mesh gradient in hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5, ease: quintEase }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#5E6AD2]/10 to-transparent blur-3xl rounded-full pointer-events-none" 
      />

      <div className="z-10 w-full max-w-3xl flex flex-col items-center gap-12 pt-16">
        
        {/* Header */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: quintEase }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="keyboard-chip">CMD</span>
            <span className="keyboard-chip">K</span>
            <span className="text-sm text-[var(--color-muted)] ml-2">to start practice</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-[var(--font-display)] font-semibold tracking-tight text-[var(--color-primary)]">
            Auren Voice Tutor
          </h1>
          <p className="text-[var(--color-secondary)] max-w-lg text-lg">
            Real-time language coaching. Speak naturally, get instant grammar and vocabulary feedback.
          </p>
        </motion.div>

        {/* Main Interface */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: quintEase }}
          className="w-full glass-panel flex flex-col items-center p-8 lg:p-12 mt-8 relative"
        >
          {/* Status Indicator */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-blue-500 animate-pulse' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs text-[var(--color-secondary)] uppercase tracking-wider font-mono">
              {isRecording ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Analyzing...' : 'Ready'}
            </span>
          </div>

          <div className="flex flex-col items-center w-full min-h-[200px] justify-center mt-6">
            
            {errorMessage && (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
                {errorMessage}
              </div>
            )}

            {!transcript && !interimTranscript && !isRecording && !isProcessing && !errorMessage && (
              <div className="text-[var(--color-muted)] text-center">
                Press the microphone to begin speaking in English.
              </div>
            )}

            {isRecording && (
              <div className="w-full flex justify-center items-center gap-1 h-12 mb-6">
                 {/* Visualizer bars placeholder */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-[var(--color-accent)] rounded-full animate-pulse" style={{ height: `${Math.max(10, Math.random() * 40)}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}

            {(transcript || interimTranscript) && (
              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-mono">You said</h3>
                  <p className="text-xl text-[var(--color-primary)] font-medium leading-relaxed">
                    {transcript} <span className="text-[var(--color-secondary)]">{interimTranscript}</span>
                  </p>
                </div>
                
                {feedback && (
                  <div className="space-y-2 hairline-border-t pt-6">
                    <h3 className="text-xs text-[var(--color-accent)] uppercase tracking-wider font-mono flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      Auren Feedback
                    </h3>
                    <p className="text-[var(--color-secondary)] leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Record Button */}
          <button 
            onClick={toggleRecording}
            disabled={isProcessing || isSpeaking}
            className={`mt-12 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500/10 border-red-500 text-red-500' 
                : isProcessing || isSpeaking
                ? 'bg-[var(--color-surface-2)] text-[var(--color-muted)] cursor-not-allowed opacity-50'
                : 'bg-[var(--color-surface-2)] hairline-border text-[var(--color-primary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-accent)]'
            }`}
          >
            {isRecording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
