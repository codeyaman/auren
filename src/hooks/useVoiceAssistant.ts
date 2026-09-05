import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceAssistantProps {
  onInteractionComplete?: (transcript: string, feedback: string) => void;
}

export function useVoiceAssistant({ onInteractionComplete }: UseVoiceAssistantProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNewTurnRef = useRef(false);

  // Refs for current transcripts to avoid stale closures in timeouts
  const transcriptRef = useRef(transcript);
  const interimRef = useRef(interimTranscript);
  const onInteractionCompleteRef = useRef(onInteractionComplete);

  useEffect(() => {
    transcriptRef.current = transcript;
    interimRef.current = interimTranscript;
    onInteractionCompleteRef.current = onInteractionComplete;
  }, [transcript, interimTranscript, onInteractionComplete]);

  const speakFeedback = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
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
  }, []);

  const processAudio = useCallback(async () => {
    setIsProcessing(true);
    setInterimTranscript('');
    
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze transcript');
      }

      setFeedback(data.feedback);
      
      // Call the hook callback if provided
      if (onInteractionCompleteRef.current) {
        onInteractionCompleteRef.current(finalTranscript, data.feedback);
      }

      speakFeedback(data.feedback);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      setFeedback('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [speakFeedback]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 2000);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          setErrorMessage('');
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
          resetSilenceTimer();
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if ((transcriptRef.current || interimRef.current) && !isNewTurnRef.current) {
             processAudio();
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          if (event.error === 'aborted' || event.error === 'no-speech') {
            setIsRecording(false);
            return;
          }
          console.error('Speech recognition error:', event.error);
          setErrorMessage(`Microphone error: ${event.error}`);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErrorMessage('Speech Recognition API not supported in this browser.');
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [processAudio, resetSilenceTimer]);

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

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isRecording,
    transcript,
    interimTranscript,
    feedback,
    isProcessing,
    isSpeaking,
    errorMessage,
    toggleRecording,
    stopSpeaking
  };
}
