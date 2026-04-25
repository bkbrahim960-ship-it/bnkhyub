import { useSearchParams } from "react-router-dom";
import { useRemoteControl } from "@/hooks/useRemoteControl";
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  CornerDownLeft, ArrowLeft, Search, Home, PlayCircle,
  Volume2, VolumeX, RotateCcw, RotateCw, Play, Pause, MousePointer2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";

const Remote = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const { sendCommand } = useRemoteControl(sessionId);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleCommand = (cmd: string) => {
    setActiveKey(cmd);
    sendCommand(cmd);
    setTimeout(() => setActiveKey(null), 80);
  };

  const handleNav = (path: string, label: string) => {
    sendCommand(`NAV:${path}`);
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  if (!sessionId) {
    return (
      <Layout>
        <div className="container pt-32 text-center">
          <h1 className="text-3xl font-display font-bold text-accent mb-4">Remote Control</h1>
          <p className="text-white/60">Scan the QR code on your TV to connect and control BNKhub.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="container max-w-md pt-24 pb-20 flex flex-col items-center min-h-screen bg-gradient-to-b from-background via-surface-primary to-background">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-black tracking-widest animate-pulse shadow-glow">
            <PlayCircle className="w-3 h-3 fill-accent" />
            ULTRA-SPEED ACTIVE
          </div>
          <h1 className="text-3xl font-display font-bold mt-6 text-white tracking-tight">BNKhub <span className="text-accent">Remote</span></h1>
        </div>

        {/* Quick Pages Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 w-full px-4">
          <QuickNavButton label="Home" onTrigger={() => handleNav("/", "Home")} />
          <QuickNavButton label="Movies" onTrigger={() => handleNav("/movies", "Movies")} />
          <QuickNavButton label="Series" onTrigger={() => handleNav("/series", "Series")} />
          <QuickNavButton label="Live" onTrigger={() => handleNav("/channels", "Live")} />
        </div>

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
          className="w-full h-48 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 mb-8 flex flex-col items-center justify-center relative overflow-hidden group touch-none cursor-none"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] group-active:opacity-30 transition-opacity" />
          <MousePointer2 className="w-8 h-8 text-white/10 group-active:text-accent/40 transition-colors mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Touchpad</span>
          
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />
        </div>

        {/* Navigation Ring (D-PAD) */}
        <div className="relative w-72 h-72 mb-10">
          <div className="absolute inset-0 rounded-full border border-white/5 bg-white/[0.02] shadow-2xl" />
          
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-4">
            <div />
            <ControlButton 
              icon={<ChevronUp className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowUp")} 
              isActive={activeKey === "ArrowUp"}
              className="rounded-t-3xl"
            />
            <div />

            <ControlButton 
              icon={<ChevronLeft className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowLeft")} 
              isActive={activeKey === "ArrowLeft"}
              className="rounded-l-3xl"
            />
            <ControlButton 
              icon={<div className="w-5 h-5 rounded-full bg-accent shadow-glow" />} 
              onTrigger={() => handleCommand("Enter")} 
              isActive={activeKey === "Enter"}
              className="bg-accent/10 border-accent/30 scale-110 z-10 rounded-2xl"
            />
            <ControlButton 
              icon={<ChevronRight className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowRight")} 
              isActive={activeKey === "ArrowRight"}
              className="rounded-r-3xl"
            />

            <div />
            <ControlButton 
              icon={<ChevronDown className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowDown")} 
              isActive={activeKey === "ArrowDown"}
              className="rounded-b-3xl"
            />
            <div />
          </div>
        </div>

        {/* Media Controls */}
        <div className="grid grid-cols-3 gap-4 w-full px-8 mb-10">
           <MediaButton icon={<RotateCcw />} onTrigger={() => handleCommand("j")} />
           <MediaButton icon={<Play className="fill-white" />} onTrigger={() => handleCommand(" ")} className="bg-accent/40 border-accent scale-110" />
           <MediaButton icon={<RotateCw />} onTrigger={() => handleCommand("l")} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full px-6">
          <ActionButton icon={<ArrowLeft />} label="Back" onTrigger={() => handleCommand("Escape")} />
          <ActionButton icon={<Search />} label="Search" onTrigger={() => handleNav("/search", "Search")} />
          <ActionButton icon={<VolumeX />} label="Mute" onTrigger={() => handleCommand("m")} />
          <ActionButton icon={<Home />} label="Menu" onTrigger={() => handleCommand("Escape")} />
        </div>
      </div>
    </Layout>
  );
};

const QuickNavButton = ({ label, onTrigger }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-accent hover:border-accent/40 active:scale-95 transition-all"
  >
    {label}
  </button>
);

const ControlButton = ({ icon, onTrigger, isActive, className = "" }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex items-center justify-center bg-surface-card/40 backdrop-blur-md border border-white/10 text-white/80 transition-all duration-75 ${
      isActive ? "bg-accent/60 border-accent scale-95 shadow-accent/40" : "hover:bg-white/5"
    } ${className}`}
  >
    {icon}
  </button>
);

const MediaButton = ({ icon, onTrigger, className = "" }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex items-center justify-center aspect-square rounded-2xl bg-white/5 border border-white/5 text-white/80 active:scale-90 active:bg-accent/40 transition-all ${className}`}
  >
    {icon}
  </button>
);

const ActionButton = ({ icon, label, onTrigger }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-95 active:bg-accent/10 transition-all group"
  >
    <div className="text-white/40 group-active:text-accent transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-active:text-white transition-colors">{label}</span>
  </button>
);

export default Remote;
