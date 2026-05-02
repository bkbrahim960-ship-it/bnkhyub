/**
 * BNKhub — Bouton de téléchargement (Modal d'information).
 */
import { useState } from "react";
import { Download, Construction, Rocket, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const InstallButton = () => {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="hidden md:inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border border-accent-subtle bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground shadow-glow transition-all duration-300"
          aria-label={t("install_float")}
        >
          <Download className="w-4 h-4" />
          <span className="font-bold">Android APK</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-surface-card/95 backdrop-blur-2xl border-white/10 shadow-2xl p-0 overflow-hidden">
        <div className="relative p-8">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-[80px]" />

          <DialogHeader className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 animate-float">
               <Construction className="w-10 h-10 text-accent" />
            </div>
            
            <DialogTitle className="text-3xl font-display font-bold text-gradient-accent mb-4">
              {lang === 'ar' ? 'نحن نطور شيئاً رائعاً!' : 'Nous préparons du nouveau !'}
            </DialogTitle>

            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                {lang === 'ar' ? (
                  <p className="font-medium text-lg leading-relaxed">
                    نعتذر منكم، لقد قمنا بسحب النسخة القديمة من التطبيق. نحن نعمل الآن بكل جهد على إطلاق <span className="text-accent font-bold">نسخة جديدة كلياً</span> وأكثر قوة لضمان أفضل تجربة مشاهدة لكم.
                  </p>
                ) : (
                  <p className="font-medium text-lg leading-relaxed">
                    Nous nous excusons, mais nous avons retiré l'ancienne version. Nous travaillons activement sur une <span className="text-accent font-bold">toute nouvelle application</span> plus performante pour vous offrir la meilleure expérience de streaming.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                   <Rocket className="w-4 h-4 text-accent" />
                   <span>{lang === 'ar' ? 'النسخة الجديدة ستتوفر قريباً جداً' : 'La nouvelle version arrive très bientôt'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                   <AlertCircle className="w-4 h-4 text-accent" />
                   <span>{lang === 'ar' ? 'ترقبوا التحديثات على موقعنا' : 'Restez à l\'écoute des mises à jour'}</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full mt-6 py-4 rounded-xl bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'ar' ? 'حسناً، سأنتظر!' : 'D\'accord, j\'attendrai !'}
              </button>
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
};

