import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, X, Terminal, Code2, Loader2, GitPullRequest } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export const AdminAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "ai" | "system", text: string}[]>([
    { role: "system", text: "Welcome to BNKhub AI Agent! I can help you manage your site, analyze data, and modify code. (Demo Mode: GitHub/Vercel integration required for actual code changes)" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      setIsTyping(false);
      let aiResponse = "";
      
      const lower = userText.toLowerCase();
      if (lower.includes("غير") || lower.includes("change") || lower.includes("أضف") || lower.includes("لون")) {
        aiResponse = "I understand you want to modify the website's code/design. To do this automatically, please configure your **GitHub Access Token** and **Vercel Deploy Hook** in the AI Settings first. Once configured, I will be able to rewrite the React components and push them directly!";
      } else if (lower.includes("احصائيات") || lower.includes("stats")) {
        aiResponse = "Based on the latest database metrics, your site is growing! The most active section is the Movies Catalog. Consider adding more servers to S1 and S2 to handle the load.";
      } else {
        aiResponse = "I am BNKhub AI. In the full version, I will have direct access to your codebase (React/Tailwind) and your Supabase database to execute commands automatically.";
      }
      
      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 end-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <Sparkles className="absolute inset-0 w-full h-full text-white opacity-50 blur-sm animate-pulse" />
        <Bot className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 end-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[80vh] bg-surface-elevated/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">BNKhub AI</h3>
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            {m.role === "system" && (
              <div className="w-full text-center mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300 font-medium">
                  <Terminal className="w-3 h-3" /> System Log
                </span>
                <p className="text-xs text-white/50 mt-2">{m.text}</p>
              </div>
            )}
            
            {m.role !== "system" && (
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                m.role === "user" 
                  ? "bg-accent text-accent-foreground rounded-tr-sm" 
                  : "bg-white/10 text-white rounded-tl-sm border border-white/5"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-white/10 rounded-tl-sm border border-white/5">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface-elevated border-t border-white/10">
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/50 hover:text-accent transition-colors" title="Link GitHub">
            <GitPullRequest className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AI to change code or analyze..."
              className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
