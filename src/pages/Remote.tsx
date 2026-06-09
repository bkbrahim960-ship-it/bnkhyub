import { useSearchParams, useNavigate } from "react-router-dom";
import { useRemoteControl } from "@/hooks/useRemoteControl";
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  ArrowLeft, Search, Home, PlayCircle,
  Volume2, VolumeX, RotateCcw, RotateCw, Play, Pause, 
  MousePointer2, Zap, Maximize, Power, Tv2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TV_MAIN_NAV, getTVNavLabel } from "@/config/tvNavigation";

const Remote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session");
  const { sendCommand } = useRemoteControl(sessionId);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { lang } = useLanguage();

  const handleCommand = (cmd: string) => {
    setActiveKey(cmd);
    sendCommand(cmd);
    
    // Also execute locally if not using pairing mode
    const event = new KeyboardEvent("keydown", { 
      key: cmd, 
      bubbles: true,
      cancelable: true 
    });
    window.dispatchEvent(event);
    
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    setTimeout(() => setActiveKey(null), 100);
  };

  const handleNav = (path: string, label: string) => {
    sendCommand(`NAV:${path}`);
    navigate(path);
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  // Handle local commands directly for this window too
  useEffect(() => {
    const handleLocalCommand = (e: CustomEvent) => {
      if (e.detail?.cmd) {
        const event = new KeyboardEvent("keydown", { 
          key: e.detail.cmd, 
          bubbles: true,
          cancelable: true 
        });
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('localRemoteCommand', handleLocalCommand as EventListener);
    return () => window.removeEventListener('localRemoteCommand', handleLocalCommand as EventListener);
  }, []);

  return (
    <Layout hideFooter>
      <div className="container max-w-md pt-24 pb-20 flex flex-col items-center min-h-screen bg-gradient-to-b from-background via-surface-primary/50 to-background">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-black tracking-widest animate-pulse shadow-glow">
            <Zap className="w-3 h-3 fill-accent" />
            CONNECTED
          </div>
          <h1 className="text-3xl font-display font-bold mt-6 text-white tracking-tight">BNKhub <span className="text-accent">Remote</span></h1>
        </div>

        {/* Main TV Navigation */}
        <div className="w-full px-4 mb-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
            {lang === "ar" ? "التنقل الرئيسي" : "Navigation principale"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-10 w-full px-4">
          {TV_MAIN_NAV.map((item) => (
            <QuickNavButton
              key={item.path}
              label={getTVNavLabel(item, lang)}
              onTrigger={() => handleNav(item.path, item.labelEn)}
            />
          ))}
        </div>

        {/* Touchpad */}
        <div 
          onPointerDown={(e) => {
            sendCommand("MOUSE_CLICK");
            if (window.navigator.vibrate) window.navigator.vibrate(20);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) {
              const dx = e.movementX;
              const dy = e.movementY;
              if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                sendCommand(`MOUSE_MOVE:${dx}:${dy}`);
              }
            }
          }}
          className="w-full h-48 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 mb-8 flex flex-col items-center justify-center relative overflow-hidden group touch-none cursor-none shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] group-active:opacity-30 transition-opacity" />
          <MousePointer2 className="w-8 h-8 text-white/20 group-active:text-accent/60 transition-colors mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{lang === "ar" ? "لوحة التحكم" : "Touchpad"}</span>
          
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />
        </div>

        {/* Navigation Ring (D-PAD) - Realistic remote style */}
        <div className="relative w-72 h-72 mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10 bg-gradient-to-br from-surface-card/60 to-surface-primary/40 backdrop-blur-2xl shadow-2xl" />
          
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-5">
            <div />
            <ControlButton 
              icon={<ChevronUp className="w-10 h-10" />} 
              onTrigger={() => handleCommand("ArrowUp")} 
              isActive={activeKey === "ArrowUp"}
              className="rounded-t-2xl"
            />
            <div />

            <ControlButton 
              icon={<ChevronLeft className="w-10 h-10" />} 
              onTrigger={() => handleCommand("ArrowLeft")} 
              isActive={activeKey === "ArrowLeft"}
              className="rounded-l-2xl"
            />
            <ControlButton 
              icon={<div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 shadow-glow flex items-center justify-center" />} 
              onTrigger={() => handleCommand("Enter")} 
              isActive={activeKey === "Enter"}
              className="bg-accent/10 border-accent/30 scale-105 z-10 rounded-3xl"
            />
            <ControlButton 
              icon={<ChevronRight className="w-10 h-10" />} 
              onTrigger={() => handleCommand("ArrowRight")} 
              isActive={activeKey === "ArrowRight"}
              className="rounded-r-2xl"
            />

            <div />
            <ControlButton 
              icon={<ChevronDown className="w-10 h-10" />} 
              onTrigger={() => handleCommand("ArrowDown")} 
              isActive={activeKey === "ArrowDown"}
              className="rounded-b-2xl"
            />
            <div />
          </div>
        </div>

        {/* Media Controls */}
        <div className="grid grid-cols-3 gap-4 w-full px-6 mb-10">
           <MediaButton icon={<RotateCcw className="w-6 h-6" />} onTrigger={() => handleCommand("j")} label={lang === "ar" ? "رجوع" : "Rewind"} />
           <MediaButton icon={<Play className="fill-white w-8 h-8" />} onTrigger={() => handleCommand(" ")} label={lang === "ar" ? "تشغيل" : "Play"} className="bg-accent/40 border-accent scale-110" />
           <MediaButton icon={<RotateCw className="w-6 h-6" />} onTrigger={() => handleCommand("l")} label={lang === "ar" ? "تقديم" : "Forward"} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full px-6 mb-6">
          <ActionButton icon={<ArrowLeft />} label={lang === "ar" ? "رجوع" : "Back"} onTrigger={() => handleCommand("Escape")} />
          <ActionButton icon={<Search />} label={lang === "ar" ? "البحث" : "Search"} onTrigger={() => handleNav("/search", "Search")} />
          <ActionButton icon={<Home />} label={lang === "ar" ? "الرئيسية" : "Home"} onTrigger={() => handleNav("/", "Home")} />
          <ActionButton icon={<Tv2 />} label={lang === "ar" ? "تلفاز" : "TV"} onTrigger={() => handleCommand("f")} />
        </div>
      </div>
    </Layout>
  );
};

const QuickNavButton = ({ label, onTrigger }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-accent hover:border-accent/40 hover:bg-accent/10 active:scale-95 transition-all shadow-sm"
  >
    {label}
  </button>
);

const ControlButton = ({ icon, onTrigger, isActive, className = "" }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 text-white/90 transition-all duration-100 shadow-lg ${
      isActive ? "bg-accent/70 border-accent scale-90 shadow-accent/50" : "hover:bg-white/20 active:scale-95"
    } ${className}`}
  >
    {icon}
  </button>
);

const MediaButton = ({ icon, onTrigger, className = "", label }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex flex-col items-center justify-center gap-2 aspect-square rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/15 text-white/90 active:scale-90 active:bg-accent/40 transition-all shadow-xl ${className}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
  </button>
);

const ActionButton = ({ icon, label, onTrigger }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/15 active:scale-95 active:bg-accent/20 transition-all group shadow-lg"
  >
    <div className="text-white/50 group-active:text-accent transition-colors">
      {icon}
    </div>
    <span className="text-[11px] font-bold uppercase tracking-widest text-white/60 group-active:text-white transition-colors">{label}</span>
  </button>
);

export default Remote;
