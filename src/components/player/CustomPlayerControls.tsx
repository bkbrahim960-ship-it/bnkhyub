import React, { useState, useEffect } from "react";
import { 
  Play, Pause, RotateCcw, RotateCw, Maximize, Minimize, 
  Settings, Volume2, VolumeX, SkipBack, SkipForward, 
  Captions, Monitor, Gauge, Languages, Lock, Unlock
} from "lucide-react";

interface Props {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onShowSettings: () => void;
  progress: number;
  duration: number;
  onProgressChange: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  title?: string;
  subtitle?: string;
}

export const CustomPlayerControls = ({
  isPlaying,
  onPlayPause,
  onSeek,
  onToggleFullscreen,
  isFullscreen,
  onShowSettings,
  progress,
  duration,
  onProgressChange,
  volume,
  onVolumeChange,
  isLocked,
  onToggleLock,
  title,
  subtitle
}: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(volume === 0);

  useEffect(() => {
    let timeout: any;
    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => !isLocked && setIsVisible(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLocked]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const showOverlay = isVisible || isLocked;

  return (
    <div className={`absolute inset-0 z-50 flex flex-col justify-between p-6 transition-all duration-500 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Top Bar */}
      <div className={`flex items-start justify-between transition-transform duration-500 pointer-events-auto ${isVisible ? 'translate-y-0' : '-translate-y-10'}`}>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white drop-shadow-xl">{title}</h2>
          <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleLock}
            className={`w-12 h-12 rounded-full backdrop-blur-2xl border border-white/10 flex items-center justify-center transition-all ${isLocked ? 'bg-accent text-accent-foreground shadow-accent' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Controls (Lock indicator) */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button 
            onClick={onToggleLock}
            className="w-28 h-28 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center gap-3 animate-pulse"
          >
            <Lock className="w-10 h-10 text-white/50" />
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/30">Déverrouiller</span>
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className={`space-y-6 transition-transform duration-500 pointer-events-auto ${isVisible && !isLocked ? 'translate-y-0' : 'translate-y-20'}`}>
        
        {/* Progress Bar (Only if duration is valid) */}
        {duration > 0 && (
          <div className="group/progress relative h-2 flex items-center">
            <input 
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={(e) => onProgressChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent transition-all group-hover/progress:h-2"
            />
            <div 
              className="absolute h-1 bg-accent rounded-full pointer-events-none group-hover/progress:h-2 transition-all shadow-[0_0_15px_hsl(var(--accent)/0.6)]"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onPlayPause} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl">
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <div className="flex items-center gap-4">
              <button onClick={() => onSeek(-10)} className="text-white/70 hover:text-white transition-colors">
                <RotateCcw className="w-6 h-6" />
              </button>
              <button onClick={() => onSeek(10)} className="text-white/70 hover:text-white transition-colors">
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {duration > 0 && (
              <div className="text-sm font-mono text-white/80 font-bold bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md">
                {formatTime(progress)} <span className="text-white/30 mx-1">/</span> {formatTime(duration)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group/vol">
              <button 
                onClick={() => {
                  const newVol = volume > 0 ? 0 : 1;
                  onVolumeChange(newVol);
                  setIsMuted(newVol === 0);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 text-destructive" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300">
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            <button onClick={onShowSettings} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:rotate-90 transition-all duration-500">
              <Settings className="w-5 h-5" />
            </button>

            <button onClick={onToggleFullscreen} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
