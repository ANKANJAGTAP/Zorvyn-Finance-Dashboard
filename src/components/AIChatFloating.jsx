import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useStore from '../store/useStore';
import { askZorvynAI } from '../services/aiService';

export default function AIChatFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "Hi! I'm Zorvyn AI. How can I help you analyze your dashboard today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const bottomRef = useRef(null);

  // Store extraction to provide context
  const transactions = useStore(s => s.transactions);
  const getInsights = useStore(s => s.getInsights);
  const getCategoryBreakdown = useStore(s => s.getCategoryBreakdown);
  
  const dashboardContext = {
    insightsSummary: getInsights(),
    topCategories: getCategoryBreakdown().slice(0, 5), // top 5 spending categories
    recentTransactionsCount: transactions.length,
    // Add truncated subset of transactions to prevent huge payloads
    recentTransactions: [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,10)
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Map history without the newest prompt because the `sendMessage` function adds it
      const currentHistory = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        text: m.text
      }));
      
      let placeholderId = null;
      
      await askZorvynAI(userMessage.text, dashboardContext, currentHistory, (chunkText) => {
        if (!placeholderId) {
          // On the very first chunk, hide the typing spinner and render the actual chat bubble
          placeholderId = Date.now() + 1;
          setIsTyping(false); 
          setMessages(prev => [...prev, { id: placeholderId, role: 'ai', text: chunkText }]);
        } else {
          // On subsequent chunks, just update the existing bubble's text
          setMessages(prev => prev.map(msg => 
            msg.id === placeholderId ? { ...msg, text: chunkText } : msg
          ));
        }
      });
      
    } catch (err) {
      setMessages(prev => {
        // If we already started streaming but failed mid-way, append the error
        if (prev.some(m => m.role === 'ai' && m.text.includes(err.message))) return prev; // Avoid duplicates
        
        return [...prev, { 
          id: Date.now() + 2, 
          role: 'ai', 
          text: "**Oops!** " + err.message 
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-accent-purple to-[#427CF0] shadow-[0_4px_25px_rgba(133,92,214,0.4)] flex items-center justify-center border hover:border-white/40 border-white/20 transition-all duration-300 group"
          >
            <Sparkles className="text-white group-hover:animate-pulse" size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[420px] max-w-[calc(100%-32px)] h-[650px] max-h-[calc(100%-60px)] flex flex-col glass-card border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Zorvyn AI</h3>
                  <p className="text-[10px] text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.1] text-text-muted hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0D0F16]/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-accent-purple/20 text-accent-purple'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm overflow-hidden break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white/[0.05] border border-white/[0.05] text-[rgb(var(--text-primary))] rounded-tl-sm markdown-body'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-3 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.05] rounded-tl-sm">
                    <Loader2 size={14} className="text-text-muted animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/[0.08] bg-white/[0.02]">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.1] rounded-xl pl-4 pr-12 py-2.5 text-sm text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50 disabled:hover:text-text-muted"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
