import { useState, useEffect, useRef } from "react";
import { useMusic } from "@/context/MusicContext";
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX, Music } from "lucide-react";

export const MusicPlayer = () => {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, isYoutube } = useMusic();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentTrack) {
      setVisible(true);
      setExpanded(true);
      resetTimer();
    }
  }, [currentTrack?.id]);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExpanded(true);
    timerRef.current = setTimeout(() => setExpanded(false), 4000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!currentTrack || !visible) return null;

  const ytEmbedUrl = currentTrack.audioUrl
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/")
    .split("&")[0];

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60]" onClick={resetTimer}>
      <div
        className={`relative mx-2 mb-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl`}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-2xl border border-white/10">
          <button
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
            className="shrink-0 p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
            <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="shrink-0 p-2 rounded-full hover:bg-white/10 transition">
              <SkipBack className="w-4 h-4 text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="shrink-0 p-2.5 rounded-full bg-accent hover:bg-accent/80 transition">
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white pl-0.5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="shrink-0 p-2 rounded-full hover:bg-white/10 transition">
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {isYoutube && isPlaying && expanded && (
          <div className="h-0 overflow-hidden">
            <iframe
              src={`${ytEmbedUrl}?autoplay=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
              className="w-0 h-0 opacity-0 pointer-events-none"
              title="yt-player"
              allow="autoplay"
            />
          </div>
        )}
      </div>
    </div>
  );
};
