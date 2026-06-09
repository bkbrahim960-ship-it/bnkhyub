import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced remote control with smooth, comfortable button handling
 * Supports all primary and secondary buttons with proper debouncing
 */
export const useRemoteControl = (sessionId?: string) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const lastCommandTimeRef = useRef<number>(0);
  const commandDebounceRef = useRef<NodeJS.Timeout>();

  // Command debounce time (ms) - prevents duplicate rapid commands
  const COMMAND_DEBOUNCE = 100;

  // Map remote button codes to keyboard events
  const commandKeyMap: Record<string, string> = {
    // Arrow navigation
    "up": "ArrowUp",
    "down": "ArrowDown",
    "left": "ArrowLeft",
    "right": "ArrowRight",
    
    // Primary controls
    "select": "Enter",
    "ok": "Enter",
    "play": " ",
    "pause": " ",
    
    // Secondary controls
    "back": "Escape",
    "exit": "Escape",
    "home": "Home",
    
    // Extended controls
    "info": "i",
    "menu": "m",
  };

  useEffect(() => {
    if (!sessionId || !supabase) return;

    const channel = supabase.channel(`remote_${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "command" }, ({ payload }) => {
        const cmd = payload.cmd?.toLowerCase() || "";
        const now = Date.now();

        // Debounce: prevent duplicate commands sent too quickly
        if (now - lastCommandTimeRef.current < COMMAND_DEBOUNCE) {
          return;
        }

        lastCommandTimeRef.current = now;
        setLastCommand(cmd);

        // Clear any pending debounce timer
        if (commandDebounceRef.current) {
          clearTimeout(commandDebounceRef.current);
        }

        // Map command to key and dispatch event
        const keyToSend = commandKeyMap[cmd] || cmd;
        
        // Dispatch keyboard event with smooth timing
        const event = new KeyboardEvent("keydown", { 
          key: keyToSend,
          code: getKeyCode(keyToSend),
          bubbles: true,
          cancelable: true 
        });
        window.dispatchEvent(event);

        // Optional: dispatch keyup after a short delay for better UX
        commandDebounceRef.current = setTimeout(() => {
          const upEvent = new KeyboardEvent("keyup", {
            key: keyToSend,
            code: getKeyCode(keyToSend),
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(upEvent);
        }, 50);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (commandDebounceRef.current) {
        clearTimeout(commandDebounceRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId]);

  const sendCommand = (cmd: string) => {
    if (!sessionId || !channelRef.current) return;
    
    // Haptic feedback for immediate user response
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 10, 20]); // Tap-tap pattern for feedback
    }

    // Send with timestamp for ordering
    channelRef.current.send({
      type: "broadcast",
      event: "command",
      payload: { cmd: cmd.toLowerCase(), ts: Date.now() },
    });
  };

  return { lastCommand, sendCommand };
};

/**
 * Get keyboard event code from key name
 */
function getKeyCode(key: string): string {
  const codeMap: Record<string, string> = {
    "ArrowUp": "ArrowUp",
    "ArrowDown": "ArrowDown",
    "ArrowLeft": "ArrowLeft",
    "ArrowRight": "ArrowRight",
    "Enter": "Enter",
    " ": "Space",
    "Escape": "Escape",
    "Home": "Home",
    "End": "End",
    "PageUp": "PageUp",
    "PageDown": "PageDown",
  };
  return codeMap[key] || key;
}
