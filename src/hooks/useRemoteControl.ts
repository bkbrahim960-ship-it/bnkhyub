import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRemoteControl = (sessionId?: string) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`remote_${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "command" }, ({ payload }) => {
        setLastCommand(payload.cmd);
        // Execute the command locally
        const event = new KeyboardEvent("keydown", { key: payload.cmd, bubbles: true });
        window.dispatchEvent(event);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendCommand = async (cmd: string) => {
    if (!sessionId) return;
    const channel = supabase.channel(`remote_${sessionId}`);
    await channel.send({
      type: "broadcast",
      event: "command",
      payload: { cmd },
    });
  };

  return { lastCommand, sendCommand };
};
