import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

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
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setIsLoaded(false);
      return;
    }

    const loadHistory = async () => {
      try {
        const q = query(collection(db, `users/${user.uid}/sessions`), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const loadedSessions: ChatSession[] = [];
        querySnapshot.forEach((docSnap) => {
          loadedSessions.push(docSnap.data() as ChatSession);
        });
        setSessions(loadedSessions);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadHistory();
  }, [user]);

  const createSession = () => {
    if (!user) return '';
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      date: Date.now(),
      interactions: [],
    };
    
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    
    // Save to Firestore
    setDoc(doc(db, `users/${user.uid}/sessions`, newSession.id), newSession).catch(err => 
      console.error("Error creating session in DB:", err)
    );
    
    return newSession.id;
  };

  const addInteraction = (sessionId: string, transcript: string, feedback: string) => {
    if (!user) return;
    
    const newInteraction: ChatInteraction = {
      id: crypto.randomUUID(),
      transcript,
      feedback,
      timestamp: Date.now(),
    };

    setSessions((prev) => {
      const newSessions = prev.map((session) => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            interactions: [...session.interactions, newInteraction],
          };
          
          // Update Firestore
          setDoc(doc(db, `users/${user.uid}/sessions`, session.id), updatedSession).catch(err => 
            console.error("Error updating session in DB:", err)
          );
          
          return updatedSession;
        }
        return session;
      });
      return newSessions;
    });
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions`, sessionId));
    } catch (error) {
      console.error("Error deleting session from DB:", error);
    }
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    addInteraction,
    deleteSession,
    isLoaded
  };
}
