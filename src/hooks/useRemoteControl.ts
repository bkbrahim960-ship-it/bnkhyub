import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRemoteControl = (sessionId?: string) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!sessionId || !supabase) return;

    const channel = supabase.channel(`remote_${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "command" }, ({ payload }) => {
        setLastCommand(payload.cmd);
        // Execute the command locally via keyboard event emulation
        const event = new KeyboardEvent("keydown", { 
          key: payload.cmd, 
          bubbles: true,
          cancelable: true 
        });
        window.dispatchEvent(event);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId]);

  const sendCommand = (cmd: string) => {
    if (!sessionId || !channelRef.current) return;
    
    // Quick vibration for immediate feedback on the phone
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }

    channelRef.current.send({
      type: "broadcast",
      event: "command",
      payload: { cmd, ts: Date.now() },
    });
  };

  return { lastCommand, sendCommand };
};
