const API_BASE = "/api/channels";

export interface Channel {
  name: string;
  group: string;
  logo: string;
  url: string;
}

export interface ChannelsResponse {
  channels: Channel[];
  groups: string[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export async function fetchChannels(params: {
  page?: number;
  group?: string;
  search?: string;
}): Promise<ChannelsResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.group) q.set("group", params.group);
  if (params.search) q.set("search", params.search);
  const res = await fetch(`${API_BASE}?${q}`);
  if (!res.ok) throw new Error("Failed to load channels");
  return res.json();
}
