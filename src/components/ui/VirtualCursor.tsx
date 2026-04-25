import { useEffect, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { useRemoteControl } from "@/hooks/useRemoteControl";

export const VirtualCursor = () => {
  const tvSessionId = (window as any).tvSessionId;
  const { lastCommand } = useRemoteControl(tvSessionId);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!lastCommand) return;

    if (lastCommand.startsWith("MOUSE_MOVE:")) {
      setIsVisible(true);
      const [, dx, dy] = lastCommand.split(":").map(Number);
      setPosition((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth, prev.x + dx * 2)),
        y: Math.max(0, Math.min(window.innerHeight, prev.y + dy * 2)),
      }));
    }

    if (lastCommand === "MOUSE_CLICK") {
      const element = document.elementFromPoint(position.x, position.y);
      if (element) {
        (element as HTMLElement).click();
        // Visual feedback for click
        const ripple = document.createElement("div");
        ripple.className = "absolute w-8 h-8 bg-accent/40 rounded-full animate-ping pointer-events-none z-[1000]";
        ripple.style.left = `${position.x - 16}px`;
        ripple.style.top = `${position.y - 16}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
      }
    }
  }, [lastCommand]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none transition-transform duration-75 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-2px, -2px)",
      }}
    >
      <MousePointer2 className="w-8 h-8 text-accent fill-accent shadow-glow filter drop-shadow-lg" />
    </div>
  );
};
