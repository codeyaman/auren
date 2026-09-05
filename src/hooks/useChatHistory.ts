import { useState, useEffect } from 'react';

export interface ChatInteraction {
  id: string;
  transcript: string;
  feedback: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  date: number;
  interactions: ChatInteraction[];
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auren_history');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save to local storage when sessions change
  useEffect(() => {
    try {
      localStorage.setItem('auren_history', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [sessions]);

  const createSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      date: Date.now(),
      interactions: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const addInteraction = (sessionId: string, transcript: string, feedback: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            interactions: [
              ...session.interactions,
              {
                id: crypto.randomUUID(),
                transcript,
                feedback,
                timestamp: Date.now(),
              },
            ],
          };
        }
        return session;
      })
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    addInteraction,
    deleteSession,
  };
}
