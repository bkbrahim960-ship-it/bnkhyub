import { useState } from "react";
import { Tablet, X, Wifi } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";

export const RemotePairingButton = () => {
  const { lang } = useLanguage();
  const tvSessionId = (window as any).tvSessionId || "default";
  const baseUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "https://bnk-huub.vercel.app" 
    : window.location.origin;
  const pairingUrl = `${baseUrl}/remote?session=${tvSessionId}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="group relative flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 hover:scale-105 text-sm font-medium"
          title={lang === "ar" ? "ربط الريموت" : "Pair Remote"}
        >
          <Tablet className="w-4 h-4" />
          <span>
            {lang === "ar" ? "الريموت" : "Remote"}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-surface-elevated/95 backdrop-blur-2xl border-accent/20 max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse-glow">
              <Wifi className="w-8 h-8 text-accent" />
            </div>
            {lang === "ar" ? "تحكم من هاتفك" : "Remote Control"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-accent/20">
            <QRCodeSVG value={pairingUrl} size={200} />
          </div>
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            {lang === "ar" 
              ? "امسح الكود بهاتفك لتحويله إلى ريموت كنترول ذكي لهذا الجهاز." 
              : "Scan this code with your phone to turn it into a smart remote for this screen."}
          </p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent w-1/2 animate-shimmer" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
