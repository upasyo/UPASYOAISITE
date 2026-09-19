import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  ChevronRight, 
  Bot, 
  Terminal, 
  Hourglass,
  Lightbulb,
  CornerDownRight
} from "lucide-react";
import { fetchCollection, COLLECTIONS } from "../firebase";

interface Message {
  role: "user" | "model";
  text: string;
}

interface KBItem {
  id: string;
  content: string;
  category?: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      text: "Greetings. I am UPASYO's Cognitive RAG Agent. You may query me regarding my mathematical scaling laws, neuro-symbolic reasoning safeguards, research papers, or projects." 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [kbContext, setKbContext] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What is Project NeuralLink-X?",
    "Tell me about latest publication scaling research",
    "What is UPASYO's core scientific vision?",
    "Which technologies does UPASYO specialize in?"
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch knowledge base context once to construct our RAG pipeline
  useEffect(() => {
    async function loadKnowledge() {
      const items = await fetchCollection(COLLECTIONS.KNOWLEDGE_BASE, false) as KBItem[];
      if (items && items.length > 0) {
        const compiledText = items.map((item, index) => {
          return `${index + 1}. [Category: ${item.category || "General"}]: ${item.content}`;
        }).join("\n");
        setKbContext(compiledText);
      }
    }
    loadKnowledge();
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const updatedMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Map history inside standard structure
      const historyToSend = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text
      }));

      // Post to our server endpoint proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context: kbContext,
          history: historyToSend
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with RAG Server.");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: "model" as const, text: data.response }]);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setMessages([...updatedMessages, { 
        role: "model" as const, 
        text: "Error synchronizing cognitive agent. Verify GEMINI_API_KEY environment declaration." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <motion.button
        id="ai-trigger-btn"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-white via-pink-100 to-pink-200 text-gray-900 border border-pink-200/50 shadow-xl px-5 py-3.5 rounded-full cursor-pointer hover:shadow-pink-300/40 font-semibold"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-5 h-5 text-brand-accent-pink animate-pulse" />
        <span className="text-sm font-mono tracking-wider">UPASYO_BRAIN</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[92%] sm:w-[420px] h-[550px] bg-white dark:bg-brand-dark-card border border-pink-100/50 dark:border-zinc-800 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-cream/80 via-white to-pink-50/50 dark:from-zinc-900 dark:to-brand-dark-card border-b border-pink-100/30 dark:border-zinc-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center border border-pink-200/30">
                  <Bot className="w-4.5 h-4.5 text-brand-accent-pink" />
                </div>
                <div>
                  <h3 className="font-mono text-sm tracking-wider font-bold text-gray-900 dark:text-white uppercase flex items-center gap-1.5">
                    RAG_COGNITIVE_V2 <span className="text-[9px] text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-1.5 py-0.5 rounded border border-pink-250 font-normal select-none">LIVE</span>
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">UPASYO PERSONAL KNOWLEDGE MATRIX</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-brand-cream/10 dark:bg-brand-dark-base/30">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <div className="w-7 h-7 rounded-full bg-pink-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-brand-accent-pink border border-pink-100/40">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-slate-900 dark:bg-pink-200 text-white dark:text-gray-950 rounded-tr-none font-medium" 
                      : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-800/80 shadow-xs"
                  }`}>
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-pink-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-pink-400">
                    <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5">
                    <span className="font-mono text-xs">Accessing neural database...</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions / Controls */}
            {messages.length === 1 && (
              <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-brand-cream/20">
                <p className="text-[10px] font-mono font-semibold text-gray-400 dark:text-zinc-500 flex items-center gap-1 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-pink-400" /> SUGGESTED SYSTEM QUERIES
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/80 rounded-lg px-2.5 py-1.5 hover:border-brand-accent-pink/40 hover:bg-pink-50/20 dark:hover:bg-zinc-800/60 cursor-pointer transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* User Input controls */}
            <div className="p-4 border-t border-pink-100/30 dark:border-zinc-800 bg-white dark:bg-brand-dark-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter dynamic telemetry search..."
                  className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-pink-300 dark:focus:border-pink-900 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-gray-950 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[9px] text-center text-gray-400 dark:text-zinc-600 font-mono mt-2 uppercase tracking-wide">
                RAG Core running gemini-2.5-flash context matching
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
