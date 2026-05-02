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

  if (!isVisible && !isLocked) return null;

  return (
    <div className={`absolute inset-0 z-50 flex flex-col justify-between p-6 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-transparent to-black/40 ${isLocked ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      
      {/* Top Bar */}
      <div className={`flex items-start justify-between transition-transform duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-10'}`}>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white drop-shadow-lg">{title}</h2>
          <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={onToggleLock}
            className={`w-12 h-12 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all ${isLocked ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Controls (Lock/Unlock indicator only if locked) */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button 
            onClick={onToggleLock}
            className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-2 animate-pulse"
          >
            <Lock className="w-8 h-8 text-white/50" />
            <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Déverrouiller</span>
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className={`space-y-6 transition-transform duration-500 ${isVisible && !isLocked ? 'translate-y-0' : 'translate-y-20'}`}>
        
        {/* Progress Bar */}
        <div className="group/progress relative h-2 flex items-center">
          <input 
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent transition-all group-hover/progress:h-2"
          />
          <div 
            className="absolute h-1 bg-accent rounded-full pointer-events-none group-hover/progress:h-2 transition-all"
            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Play/Pause */}
            <button onClick={onPlayPause} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            {/* Seek Buttons */}
            <div className="flex items-center gap-4">
              <button onClick={() => onSeek(-10)} className="text-white/70 hover:text-white transition-colors">
                <RotateCcw className="w-6 h-6" />
              </button>
              <button onClick={() => onSeek(10)} className="text-white/70 hover:text-white transition-colors">
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {/* Time */}
            <div className="text-sm font-mono text-white/80">
              {formatTime(progress)} <span className="text-white/30">/ {formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Volume */}
            <div className="flex items-center gap-3 group/vol">
              <button 
                onClick={() => {
                  const newVol = volume > 0 ? 0 : 1;
                  onVolumeChange(newVol);
                  setIsMuted(newVol === 0);
                }}
                className="text-white/70 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
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

            {/* Settings */}
            <button onClick={onShowSettings} className="text-white/70 hover:text-white hover:rotate-90 transition-all duration-500">
              <Settings className="w-6 h-6" />
            </button>

            {/* Fullscreen */}
            <button onClick={onToggleFullscreen} className="text-white/70 hover:text-white">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
