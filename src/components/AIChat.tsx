import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, BrainCircuit, Volume2, Mic, Command } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';
import { cleanMathText } from '../lib/mathUtils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${profile?.displayName}! I'm your AI Study Tutor. How can I help you with your studies today? You can ask me to explain a concept, help with homework, or quiz you on a topic!`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Microphone and Speech Recognition Integration
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsMicSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => prev ? prev + ' ' + transcript : transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'not-allowed') {
            setSpeechError("Microphone permission denied. Note: The app is running in an iframe. Open in a new tab if you need to grant access!");
          } else if (event.error === 'no-speech') {
            setSpeechError("No voice detected. Please speak clearly into your mic.");
          } else {
            setSpeechError(`Microphone error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Speech recognition initialization error:", err);
        setSpeechError("Could not initialize microphone dictation. Check your settings.");
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const response = await geminiService.chatWithTutor(history, input);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "I'm sorry, I couldn't process that. Can you try again?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent z-10" />
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-brand-primary/20">
            <BrainCircuit className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Smart Tutor</h2>
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <Volume2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        ref={scrollRef}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm",
                msg.role === 'user' ? "bg-slate-900" : "bg-brand-primary"
              )}>
                {msg.role === 'user' ? <User className="text-white w-5 h-5" /> : <BrainCircuit className="text-white w-5 h-5" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{cleanMathText(msg.content)}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 max-w-[85%]"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-sm">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100">
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Listening... Speak now. Tap mic again to stop.</span>
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
            placeholder={isListening ? "Listening... Speak clearly..." : "Ask me anything about your lessons..."}
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-2xl pl-6 pr-24 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-700 font-medium",
              isListening ? "ring-2 ring-rose-500/20 border-rose-400 bg-rose-50/10" : ""
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={toggleListening}
              className={cn(
                "p-2 rounded-xl transition-all relative cursor-pointer",
                isListening 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105" 
                  : "hover:bg-slate-200 text-slate-400"
              )}
              title={isListening ? "Stop dictation" : "Dictate your question"}
            >
              <Mic className="w-5 h-5 animate-pulse" />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 px-2">
           <SuggestionBtn label="Explain Photosynthesis" onClick={() => setInput("Can you explain Photosynthesis in simple terms?")} />
           <SuggestionBtn label="Quick Quiz" onClick={() => setInput("Give me a quick 3 question quiz on Algebra.")} />
        </div>
      </div>
    </div>
  );
}

function SuggestionBtn({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1.5 group"
    >
      <Command className="w-3 h-3 text-slate-300 group-hover:text-brand-primary" />
      {label}
    </button>
  );
}
