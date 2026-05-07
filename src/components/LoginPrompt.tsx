import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface LoginPromptProps {
  title: string;
  description: string;
  buttonText?: string;
  onLogin?: () => void;
  onWatch?: () => void;
}

export const LoginPrompt = ({ 
  title, 
  description, 
  buttonText, 
  onLogin,
  onWatch
}: LoginPromptProps) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  if (user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl animate-modal-in">
        <button 
          onClick={() => onLogin && onLogin()} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="font-bold text-3xl mb-4" style={{ fontFamily: 'Anton, sans-serif' }}>
          {title}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {description}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onLogin && onLogin()}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#C124A0] text-white font-bold py-3.5 rounded-xl hover:bg-[#D93AB0] transition-all"
          >
            {buttonText || (lang === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
          </button>
          
          {onWatch && (
            <button 
              onClick={() => onWatch()}
              className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-all"
            >
              {lang === 'ar' ? 'مشاهدة على أي حال' : 'Regarder quand même'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};