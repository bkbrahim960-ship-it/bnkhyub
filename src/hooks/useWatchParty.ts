import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWatchParty = (partyId?: string, isHost?: boolean) => {
  const [syncedTime, setSyncedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [participants, setParticipants] = useState(0);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!partyId) return;

    const channel = supabase.channel(`party_${partyId}`, {
      config: { presence: { key: partyId } }
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setParticipants(Object.keys(state).length);
      })
      .on("broadcast", { event: "sync_state" }, ({ payload }) => {
        if (!isHost) {
          setSyncedTime(payload.time);
          setIsPlaying(payload.playing);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, isHost]);

  const updateState = (time: number, playing: boolean) => {
    if (isHost && channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "sync_state",
        payload: { time, playing },
      });
    }
  };

  return { syncedTime, isPlaying, participants, updateState };
};
