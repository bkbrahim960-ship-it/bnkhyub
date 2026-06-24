import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { MusicTrack } from "@/services/musicData";

interface MusicCtx {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  play: (track: MusicTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  seek: (t: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  queue: MusicTrack[];
  setQueue: (tracks: MusicTrack[]) => void;
  isYoutube: boolean;
}

const Ctx = createContext<MusicCtx | null>(null);

export const MusicProvider = ({ children, tracks }: { children: ReactNode; tracks: MusicTrack[] }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return 0.5;
    const saved = localStorage.getItem("bnkhub_music_volume");
    return saved ? parseFloat(saved) : 0.5;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isYoutubeRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (queue.length > 0 && currentTrack) {
        const idx = queue.findIndex(t => t.id === currentTrack.id);
        if (idx >= 0 && idx < queue.length - 1) {
          play(queue[idx + 1]);
          return;
        }
      }
      setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [currentTrack, queue]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem("bnkhub_music_volume", String(volume));
  }, [volume]);

  const isYoutubeUrl = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const play = useCallback((track: MusicTrack) => {
    setCurrentTrack(track);
    setProgress(0);
    const audio = audioRef.current;
    if (!audio) return;
    if (isYoutubeUrl(track.audioUrl)) {
      isYoutubeRef.current = true;
      audio.pause();
      audio.src = "";
      setIsPlaying(true);
    } else {
      isYoutubeRef.current = false;
      audio.src = track.audioUrl;
      audio.play().catch(() => {});
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (!currentTrack || isYoutubeRef.current) return;
    audioRef.current?.play().catch(() => {});
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  const setVolume = useCallback((v: number) => setVolumeState(v), []);

  const seek = useCallback((t: number) => {
    if (audioRef.current && !isYoutubeRef.current) audioRef.current.currentTime = t;
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx >= 0 && idx < queue.length - 1) play(queue[idx + 1]);
  }, [queue, currentTrack, play]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx > 0) play(queue[idx - 1]);
  }, [queue, currentTrack, play]);

  return (
    <Ctx.Provider value={{
      currentTrack, isPlaying, progress, duration, volume,
      play, pause, resume, togglePlay, setVolume, seek,
      nextTrack, prevTrack, queue, setQueue,
      isYoutube: isYoutubeRef.current,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
};
