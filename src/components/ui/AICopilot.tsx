import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2, Play } from "lucide-react";
import { getAIRecommendations, AIMessage } from "@/services/ai";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { IMG } from "@/services/tmdb";

export const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { lang, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          content: lang === "ar" 
            ? "مرحباً! أنا المساعد الذكي لـ BNKhub. أخبرني عن نوع الأفلام أو المسلسلات التي تبحث عنها، وسأقترح لك أفضل الخيارات!"
            : "Bonjour ! Je suis l'assistant IA de BNKhub. Dites-moi quel genre de films ou séries vous cherchez, et je vous proposerai les meilleurs choix !",
        }
      ]);
    }
  }, [isOpen, messages.length, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getAIRecommendations(userMsg, lang);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "model", 
        content: lang === "ar" ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً." : "Une erreur inattendue s'est produite. Veuillez réessayer plus tard." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToMedia = (item: any) => {
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");
    if (type === "movie") navigate(`/movie/${item.id}`);
    else navigate(`/series/${item.id}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${lang === "ar" ? "left-6" : "right-6"} z-50 p-4 bg-gradient-to-r from-[#C124A0] to-[#D93AB0] text-white rounded-full shadow-2xl shadow-[#C124A0]/40 hover:scale-110 transition-transform ${isOpen ? "hidden" : "flex"} items-center justify-center`}
      >
        <Bot size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 ${lang === "ar" ? "left-6" : "right-6"} z-50 w-[350px] sm:w-[400px] max-h-[600px] h-[80vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#C124A0]/20 to-transparent border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C124A0] flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">BNKhub AI</h3>
                <p className="text-xs text-gray-400">{lang === "ar" ? "متصل دائماً" : "Toujours en ligne"}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" dir={lang === "ar" ? "rtl" : "ltr"}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user" ? "bg-[#C124A0] text-white rounded-br-sm" : "bg-white/10 text-gray-200 rounded-bl-sm"}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                
                {/* Recommendations */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="flex overflow-x-auto w-full gap-3 py-2 scrollbar-hide">
                    {msg.recommendations.map((rec: any, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigateToMedia(rec)}
                        className="min-w-[120px] max-w-[120px] shrink-0 group relative rounded-lg overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={IMG.poster(rec.poster_path, "w185") || "https://via.placeholder.com/185x278"} 
                          alt={rec.title || rec.name}
                          className="w-full h-[180px] object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <p className="text-xs font-bold text-white truncate text-center">{rec.title || rec.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white/10 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#C124A0]" />
                  <span className="text-xs text-gray-400">{lang === "ar" ? "يبحث في قاعدة البيانات..." : "Recherche en cours..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/50 border-t border-white/10 backdrop-blur-md">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === "ar" ? "مثال: فيلم خيال علمي يشبه Interstellar" : "Ex: Un film de SF comme Interstellar"}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C124A0] transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 shrink-0 rounded-full bg-[#C124A0] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D93AB0] transition-colors"
              >
                <Send size={18} className={lang === "ar" ? "rotate-180" : ""} />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
