const API_BASE = "/api/channels";

export interface Channel {
  name: string;
  group: string;
  logo: string;
  url: string;
  source: "m3u" | "iptv";
}

export interface ChannelsResponse {
  channels: Channel[];
  groups: {
    m3u: string[];
    iptv: string[];
  };
  groupCounts: {
    m3u: Record<string, number>;
    iptv: Record<string, number>;
  };
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export async function fetchChannels(params: {
  page?: number;
  group?: string;
  source?: string;
  search?: string;
}): Promise<ChannelsResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.group) q.set("group", params.group);
  if (params.source) q.set("source", params.source);
  if (params.search) q.set("search", params.search);
  const res = await fetch(`${API_BASE}?${q}`);
  if (!res.ok) throw new Error("Failed to load channels");
  return res.json();
}
