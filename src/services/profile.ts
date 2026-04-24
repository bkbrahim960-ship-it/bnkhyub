/**
 * BNKhub — Service Profil (CRUD profil utilisateur + upload avatar).
 */
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  preferred_language: string;
  preferred_theme: string;
  created_at: string;
  updated_at: string;
}

export const getMyProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
};

export const updateMyProfile = async (
  userId: string,
  patch: Partial<Pick<Profile, "username" | "avatar_url" | "preferred_language" | "preferred_theme">>,
): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};
