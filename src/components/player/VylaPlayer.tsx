import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  tmdbId: number | string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  onReady?: () => void;
  onError?: () => void;
}

const VYLA_BASE = "https://missourimonster-vyla.hf.space";

export function VylaPlayer({ tmdbId, type, season, episode, onReady, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState("جارٍ التحميل…");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const queue: string[] = [];
    let started = false;

    const cleanup = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const tryNext = () => {
      if (!queue.length || !videoRef.current) {
        setError(true);
        setStatus("فشل تحميل جميع المصادر");
        onError?.();
        return;
      }
      cleanup();

      const url = queue.shift()!;
      setStatus("جارٍ التحميل…");

      if (!Hls.isSupported()) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
        setStatus("");
        onReady?.();
        return;
      }

      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        setStatus("");
        setError(false);
        onReady?.();
        videoRef.current?.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, err) => {
        if (err.fatal) {
          setStatus("محاولة المصدر التالي…");
          tryNext();
        }
      });
    };

    (async () => {
      const endpoint =
        type === "movie"
          ? `${VYLA_BASE}/movie?id=${tmdbId}`
          : `${VYLA_BASE}/tv?id=${tmdbId}&season=${season}&episode=${episode}`;

      try {
        const res = await fetch(endpoint);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop()!;

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const event = JSON.parse(line.slice(6));

            if (event.type === "source") {
              queue.push(event.source.url);
              if (!started) {
                started = true;
                tryNext();
              }
            }

            if (event.type === "done" && !started) {
              setError(true);
              setStatus("لا توجد مصادر متاحة");
              onError?.();
            }
          }
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setStatus("فشل الاتصال بالخادم");
          onError?.();
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [tmdbId, type, season, episode, onReady, onError]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        playsInline
      />

      {status && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 pointer-events-none gap-3">
          {error ? (
            <AlertCircle className="w-10 h-10 text-red-400" />
          ) : (
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          )}
          <span className="text-sm text-white/60">{status}</span>
        </div>
      )}
    </div>
  );
}
