import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  User, 
  BrainCircuit, 
  Volume2, 
  Mic, 
  Command, 
  History, 
  Plus, 
  Trash2, 
  Clock, 
  ChevronRight,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { geminiService } from '../services/geminiService.js';
import { chatHistoryService, ChatSession, ChatMessage } from '../services/chatHistoryService';
import { cn } from '../lib/utils';
import { cleanMathText } from '../lib/mathUtils';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const { user, profile } = useAuth();
  const userId = user?.uid || profile?.uid || '';
  
  // Active chat session state
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return localStorage.getItem('smartstudy_active_chat_id') || `chat_${Date.now()}`;
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Microphone and Speech Recognition Integration
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history from Firestore on mount or user change
  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setIsLoadingHistory(true);
    try {
      const sessions = await chatHistoryService.getUserChats(userId);
      setChatSessions(sessions);

      // Restore active chat if exists in loaded sessions
      const existing = sessions.find(s => s.chatId === currentChatId);
      if (existing && existing.messages.length > 0) {
        setMessages(existing.messages);
      } else if (sessions.length > 0) {
        // Restore the most recently updated session
        setCurrentChatId(sessions[0].chatId);
        setMessages(sessions[0].messages);
        localStorage.setItem('smartstudy_active_chat_id', sessions[0].chatId);
      } else {
        // Initial default welcome message
        const initialMsg: ChatMessage = {
          messageId: 'welcome_1',
          role: 'assistant',
          content: `Hello ${profile?.displayName || 'there'}! I'm your AI Study Tutor. How can I help you with your studies today? You can ask me to explain a concept, help with homework, or quiz you on a topic!`,
          timestamp: Date.now(),
        };
        setMessages([initialMsg]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId, profile?.displayName]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleListening = () => {
    setSpeechError(null);
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setSpeechError("Speech recognition is not supported in this browser. Try Chrome, Safari, or Edge!");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => prev ? prev + ' ' + transcript : transcript);
          }
        };
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setSpeechError(event.error === 'not-allowed' 
            ? "Microphone access denied. Please enable microphone permissions in your browser." 
            : `Microphone notice: ${event.error}`);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Speech recognition initialization error:", err);
        setSpeechError("Could not initialize microphone dictation.");
        setIsListening(false);
      }
    }
  };

  const handleStartNewChat = () => {
    const newId = `chat_${Date.now()}`;
    setCurrentChatId(newId);
    localStorage.setItem('smartstudy_active_chat_id', newId);
    const welcomeMsg: ChatMessage = {
      messageId: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Hello ${profile?.displayName || 'Student'}! Starting a new study session. What topic would you like to explore?`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);
    setShowHistory(false);
  };

  const handleSelectChat = (session: ChatSession) => {
    setCurrentChatId(session.chatId);
    localStorage.setItem('smartstudy_active_chat_id', session.chatId);
    setMessages(session.messages || []);
    setShowHistory(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    
    try {
      await chatHistoryService.deleteChatSession(userId, chatId);
      setChatSessions(prev => prev.filter(s => s.chatId !== chatId));
      if (currentChatId === chatId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const queryText = input.trim();
    const userMsg: ChatMessage = {
      messageId: `msg_${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Dynamic title based on first query
    const titleSnippet = queryText.length > 38 ? `${queryText.substring(0, 38)}...` : queryText;

    // Persist user question immediately
    if (userId) {
      chatHistoryService.saveChatSession({
        chatId: currentChatId,
        userId,
        title: titleSnippet,
        createdAt: messages[0]?.timestamp || Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        messages: updatedMessages
      }).catch(err => console.warn('Background sync note:', err));
    }

    try {
      const history = updatedMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await geminiService.chatWithTutor(history, queryText);
      
      const assistantMsg: ChatMessage = {
        messageId: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response || "I'm sorry, I couldn't process that. Can you try asking in another way?",
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Persist full conversation with AI response to Firestore
      if (userId) {
        await chatHistoryService.saveChatSession({
          chatId: currentChatId,
          userId,
          title: titleSnippet,
          createdAt: messages[0]?.timestamp || Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          messages: finalMessages
        });
        // Refresh local session list
        setChatSessions(prev => {
          const filtered = prev.filter(s => s.chatId !== currentChatId);
          return [{
            chatId: currentChatId,
            userId,
            title: titleSnippet,
            createdAt: messages[0]?.timestamp || Date.now(),
            updatedAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            messages: finalMessages
          }, ...filtered];
        });
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      const isQuota = e?.message?.toLowerCase().includes('quota') || e?.message?.includes('429');
      const errorMsg: ChatMessage = {
        messageId: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: isQuota
          ? '⚠️ The AI Tutor is temporarily resting due to API rate limits. Please try again shortly.'
          : `⚠️ Note: ${e?.message || 'Could not reach AI Tutor. Please verify backend is running at http://127.0.0.1:3000'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent z-10" />
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-slate-900">24/7 AI Smart Tutor</h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-200">
                Synchronized
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>24h Cloud Retention</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
          
          <button 
            onClick={() => setShowHistory(prev => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
              showHistory 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            )}
            title="Toggle previous conversations"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({chatSessions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar & Chat Messages */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat History Drawer / Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col z-20 absolute inset-y-0 left-0 md:relative shadow-xl md:shadow-none"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  <span>Past Conversations</span>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isLoadingHistory ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading conversations...</div>
                ) : chatSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No previous chats yet. Your questions will be automatically saved here!
                  </div>
                ) : (
                  chatSessions.map((session) => {
                    const isSelected = session.chatId === currentChatId;
                    return (
                      <div
                        key={session.chatId}
                        onClick={() => handleSelectChat(session)}
                        className={cn(
                          "group p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2",
                          isSelected
                            ? "bg-white border-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                            : "bg-white/60 hover:bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {session.title || 'Study Discussion'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                            <span>{formatDate(session.updatedAt)}</span>
                            <span>•</span>
                            <span>{session.messages?.length || 0} messages</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteChat(e, session.chatId)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition-all cursor-pointer"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Thread */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide bg-slate-50/40"
          ref={scrollRef}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.messageId}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm",
                  msg.role === 'user' ? "bg-slate-900" : "bg-brand-primary"
                )}>
                  {msg.role === 'user' ? (
                    <User className="text-white w-4 h-4" />
                  ) : (
                    <BrainCircuit className="text-white w-4 h-4" />
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    <div className="markdown-body">
                      <ReactMarkdown>{cleanMathText(msg.content)}</ReactMarkdown>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-center gap-2 px-1 text-[10px] text-slate-400 font-medium",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speakText(msg.content)}
                        className="hover:text-brand-primary transition-colors cursor-pointer"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-sm">
                <BrainCircuit className="text-white w-4 h-4" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-5 bg-white border-t border-slate-100">
        <AnimatePresence>
          {speechError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs flex items-center justify-between gap-2 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span>⚠️ {speechError}</span>
              </div>
              <button 
                onClick={() => setSpeechError(null)} 
                className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {isListening && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center justify-between gap-3 overflow-hidden font-medium animate-pulse"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Listening... Speak your study question.</span>
              </div>
              <button 
                onClick={() => setIsListening(false)} 
                className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <input 
            type="text" 
            placeholder={isListening ? "Listening... Speak clearly..." : "Ask your AI Tutor about formulas, concepts, or homework..."}
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-24 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-700 font-medium text-sm",
              isListening ? "ring-2 ring-rose-500/20 border-rose-400 bg-rose-50/10" : ""
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button 
              onClick={toggleListening}
              className={cn(
                "p-2 rounded-xl transition-all cursor-pointer",
                isListening 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105" 
                  : "hover:bg-slate-200 text-slate-400"
              )}
              title={isListening ? "Stop listening" : "Dictate your question"}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-3 px-1">
          <SuggestionBtn label="Explain Photosynthesis" onClick={() => setInput("Can you explain Photosynthesis in simple terms?")} />
          <SuggestionBtn label="Quick Algebra Quiz" onClick={() => setInput("Give me a quick 3 question quiz on Algebra.")} />
        </div>
      </div>
    </div>
  );
}

function SuggestionBtn({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-xs font-semibold text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
    >
      <Command className="w-3 h-3 text-slate-300" />
      {label}
    </button>
  );
}
