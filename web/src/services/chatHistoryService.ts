import { db } from '@smartstudy/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';

export interface ChatMessage {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  chatId: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  messages: ChatMessage[];
}

// 24-hour retention from last activity, refreshed with every message
const RETENTION_MS = 24 * 60 * 60 * 1000;

export const chatHistoryService = {
  /**
   * Load all active chats for a user, ordered by latest updated
   */
  async getUserChats(userId: string): Promise<ChatSession[]> {
    if (!userId) return [];
    try {
      const chatsRef = collection(db, 'users', userId, 'aiChats');
      const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const now = Date.now();
      const sessions: ChatSession[] = [];

      for (const d of snap.docs) {
        const data = d.data() as ChatSession;
        // Keep active chats (expiresAt > now or within retention window)
        if (data && (!data.expiresAt || data.expiresAt > now - RETENTION_MS)) {
          sessions.push({
            ...data,
            chatId: d.id,
            messages: Array.isArray(data.messages) ? data.messages : []
          });
        }
      }
      return sessions;
    } catch (e) {
      console.error('Notice loading user chats from Firestore:', e);
      return [];
    }
  },

  /**
   * Save or update a chat session in Firestore
   */
  async saveChatSession(session: ChatSession): Promise<void> {
    if (!session.userId || !session.chatId) return;
    try {
      const chatDocRef = doc(db, 'users', session.userId, 'aiChats', session.chatId);
      const now = Date.now();
      const payload: ChatSession = {
        chatId: session.chatId,
        userId: session.userId,
        title: session.title || 'Study Discussion',
        createdAt: session.createdAt || now,
        updatedAt: now,
        expiresAt: now + RETENTION_MS,
        messages: session.messages || []
      };
      await setDoc(chatDocRef, payload, { merge: true });
    } catch (e) {
      console.error('Failed to save chat session:', e);
      throw e;
    }
  },

  /**
   * Delete a chat session
   */
  async deleteChatSession(userId: string, chatId: string): Promise<void> {
    if (!userId || !chatId) return;
    try {
      const chatDocRef = doc(db, 'users', userId, 'aiChats', chatId);
      await deleteDoc(chatDocRef);
    } catch (e) {
      console.error('Failed to delete chat session:', e);
      throw e;
    }
  }
};
