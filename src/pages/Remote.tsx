import { useSearchParams } from "react-router-dom";
import { useRemoteControl } from "@/hooks/useRemoteControl";
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  CornerDownLeft, ArrowLeft, Search, Home, PlayCircle
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { toast } from "sonner";

const Remote = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const { sendCommand } = useRemoteControl(sessionId);

  if (!sessionId) {
    return (
      <Layout>
        <div className="container pt-32 text-center">
          <h1 className="text-2xl font-bold text-accent mb-4">Remote Control</h1>
          <p className="text-muted-foreground">Scan the QR code on your TV to connect.</p>
        </div>
      </Layout>
    );
  }

  const handleCommand = (cmd: string, label: string) => {
    sendCommand(cmd);
    // Haptic feedback if available
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  return (
    <Layout hideFooter>
      <div className="container max-w-md pt-24 pb-12 flex flex-col items-center min-h-screen">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold animate-pulse">
            <PlayCircle className="w-3 h-3" />
            CONNECTED TO TV
          </div>
          <h1 className="text-2xl font-display font-bold mt-4">BNKhub Remote</h1>
        </div>

        {/* D-PAD */}
        <div className="relative w-64 h-64 grid grid-cols-3 grid-rows-3 gap-2 mb-12">
          <div />
          <ControlButton 
            icon={<ChevronUp />} 
            onClick={() => handleCommand("ArrowUp", "Up")} 
            className="rounded-t-3xl"
          />
          <div />

          <ControlButton 
            icon={<ChevronLeft />} 
            onClick={() => handleCommand("ArrowLeft", "Left")} 
            className="rounded-l-3xl"
          />
          <ControlButton 
            icon={<CornerDownLeft className="text-accent" />} 
            onClick={() => handleCommand("Enter", "Select")} 
            className="bg-accent/20 border-accent/40"
          />
          <ControlButton 
            icon={<ChevronRight />} 
            onClick={() => handleCommand("ArrowRight", "Right")} 
            className="rounded-r-3xl"
          />

          <div />
          <ControlButton 
            icon={<ChevronDown />} 
            onClick={() => handleCommand("ArrowDown", "Down")} 
            className="rounded-b-3xl"
          />
          <div />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full px-4">
          <ActionButton 
            icon={<ArrowLeft />} 
            label="Back" 
            onClick={() => handleCommand("Escape", "Back")} 
          />
          <ActionButton 
            icon={<Home />} 
            label="Home" 
            onClick={() => {
                handleCommand("Escape", "Home");
                // Custom logic for home could be added
            }} 
          />
          <ActionButton 
            icon={<Search />} 
            label="Search" 
            onClick={() => {
                // Navigate to search
                handleCommand("s", "Search");
            }} 
          />
          <div className="p-4 rounded-2xl bg-surface-card border border-border flex flex-col items-center justify-center opacity-50">
            <span className="text-[10px] uppercase tracking-widest">BNKhub Control</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ControlButton = ({ icon, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center bg-surface-card border border-border text-foreground hover:bg-surface-elevated active:scale-90 active:bg-accent/20 transition-all shadow-xl ${className}`}
  >
    {icon}
  </button>
);

const ActionButton = ({ icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface-card border border-border hover:border-accent/40 active:scale-95 transition-all group"
  >
    <div className="text-foreground group-active:text-accent transition-colors">
      {icon}
    </div>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
  </button>
);

export default Remote;
