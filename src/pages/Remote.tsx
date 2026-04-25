import { useSearchParams } from "react-router-dom";
import { useRemoteControl } from "@/hooks/useRemoteControl";
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  CornerDownLeft, ArrowLeft, Search, Home, PlayCircle,
  Volume2, VolumeX, RotateCcw, RotateCw, Play, Pause
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
    setTimeout(() => setActiveKey(null), 100);
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
            LIVE CONNECTION
          </div>
          <h1 className="text-3xl font-display font-bold mt-6 text-white tracking-tight">BNKhub <span className="text-accent">Remote</span></h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Zero Latency Control</p>
        </div>

        {/* Navigation Ring (D-PAD) */}
        <div className="relative w-72 h-72 mb-12">
          {/* Outer ring glow */}
          <div className="absolute inset-0 rounded-full border border-white/5 bg-white/[0.02] shadow-2xl" />
          
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-4">
            <div />
            <ControlButton 
              icon={<ChevronUp className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowUp")} 
              isActive={activeKey === "ArrowUp"}
              className="rounded-t-3xl border-b-0"
            />
            <div />

            <ControlButton 
              icon={<ChevronLeft className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowLeft")} 
              isActive={activeKey === "ArrowLeft"}
              className="rounded-l-3xl border-r-0"
            />
            <ControlButton 
              icon={<div className="w-4 h-4 rounded-full bg-accent shadow-glow" />} 
              onTrigger={() => handleCommand("Enter")} 
              isActive={activeKey === "Enter"}
              className="bg-accent/10 border-accent/30 scale-110 z-10 rounded-2xl"
            />
            <ControlButton 
              icon={<ChevronRight className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowRight")} 
              isActive={activeKey === "ArrowRight"}
              className="rounded-r-3xl border-l-0"
            />

            <div />
            <ControlButton 
              icon={<ChevronDown className="w-8 h-8" />} 
              onTrigger={() => handleCommand("ArrowDown")} 
              isActive={activeKey === "ArrowDown"}
              className="rounded-b-3xl border-t-0"
            />
            <div />
          </div>
        </div>

        {/* Media Controls */}
        <div className="grid grid-cols-3 gap-4 w-full px-6 mb-12">
           <MediaButton icon={<RotateCcw />} onTrigger={() => handleCommand("j")} />
           <MediaButton icon={<Play className="fill-white" />} onTrigger={() => handleCommand(" ")} className="bg-white/10 scale-110" />
           <MediaButton icon={<RotateCw />} onTrigger={() => handleCommand("l")} />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 w-full px-6">
          <ActionButton 
            icon={<ArrowLeft />} 
            label="Back" 
            onTrigger={() => handleCommand("Escape")} 
          />
          <ActionButton 
            icon={<Home />} 
            label="Home" 
            onTrigger={() => handleCommand("Home")} 
          />
          <ActionButton 
            icon={<VolumeX />} 
            label="Mute" 
            onTrigger={() => handleCommand("m")} 
          />
          <ActionButton 
            icon={<Search />} 
            label="Search" 
            onTrigger={() => handleCommand("s")} 
          />
        </div>

        {/* Volume Bar Placeholder (Visual only) */}
        <div className="mt-12 w-full px-12 flex items-center gap-4 text-white/20">
          <VolumeX className="w-4 h-4" />
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent/40 w-2/3" />
          </div>
          <Volume2 className="w-4 h-4" />
        </div>
      </div>
    </Layout>
  );
};

const ControlButton = ({ icon, onTrigger, isActive, className = "" }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex items-center justify-center bg-surface-card/40 backdrop-blur-md border border-white/10 text-white/80 transition-all duration-75 shadow-xl ${
      isActive ? "bg-accent/40 border-accent scale-95 shadow-accent/20" : "hover:bg-white/5"
    } ${className}`}
  >
    {icon}
  </button>
);

const MediaButton = ({ icon, onTrigger, className = "" }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className={`flex items-center justify-center aspect-square rounded-2xl bg-white/5 border border-white/5 text-white/80 active:scale-90 active:bg-accent/20 transition-all ${className}`}
  >
    {icon}
  </button>
);

const ActionButton = ({ icon, label, onTrigger }: any) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onTrigger(); }}
    className="flex items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/20 active:scale-95 active:bg-accent/10 transition-all group"
  >
    <div className="text-white/60 group-active:text-accent transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-active:text-white transition-colors">{label}</span>
  </button>
);

export default Remote;
