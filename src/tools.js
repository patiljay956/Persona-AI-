// YouTube Data API v3 tools + static links. Uses Node global fetch (Node 18+).
// Exposes implementations (TOOLS) + OpenAI function-calling schemas (TOOL_SCHEMAS).
import { YT_API_KEY, CHANNELS, LINKS } from "./config.js";

const API = "https://www.googleapis.com/youtube/v3";

async function get(path, params) {
  const url = new URL(`${API}/${path}`);
  Object.entries({ ...params, key: YT_API_KEY }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `YouTube API ${res.status}`);
  return data;
}

// Map a loose alias ("chai", "@piyushgargdev", "lab") to a CHANNELS entry.
function pickChannel(input = "") {
  const s = String(input).toLowerCase().replace(/[@\s]/g, "");
  if (s.includes("piyush") || s.includes("garg")) return CHANNELS.piyush;
  if (s.includes("lab")) return CHANNELS.lab;
  if (s.includes("chai") || s.includes("hitesh")) return CHANNELS.chai;
  return CHANNELS.chai; // default
}

// handle -> { channelId, title, uploadsPlaylistId }, cached.
const _cache = {};
async function resolveChannel(handle) {
  if (_cache[handle]) return _cache[handle];
  const data = await get("channels", { part: "contentDetails,snippet", forHandle: handle });
  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found for @${handle}`);
  _cache[handle] = {
    channelId: item.id,
    title: item.snippet.title,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
  return _cache[handle];
}

const vidUrl = (id) => `https://youtu.be/${id}`;

// --- Tool: latest uploads from one channel ---
async function getLatestVideos({ channel } = {}) {
  const { handle } = pickChannel(channel);
  const { title, uploadsPlaylistId } = await resolveChannel(handle);
  const data = await get("playlistItems", { part: "snippet", playlistId: uploadsPlaylistId, maxResults: 6 });
  const videos = (data.items || []).map((i) => ({
    title: i.snippet.title,
    url: vidUrl(i.snippet.resourceId.videoId),
    publishedAt: i.snippet.publishedAt,
  }));
  return JSON.stringify({ channel: title, videos });
}

// --- Tool: search videos by topic across ALL known channels ---
async function searchVideos({ query } = {}) {
  const results = [];
  for (const { handle } of Object.values(CHANNELS)) {
    const { channelId, title } = await resolveChannel(handle);
    const data = await get("search", { part: "snippet", type: "video", channelId, q: query, maxResults: 3 });
    for (const i of data.items || []) {
      results.push({ title: i.snippet.title, url: vidUrl(i.id.videoId), channel: title });
    }
  }
  return JSON.stringify({ query, results });
}

// --- Tool: playlists / course series of one channel ---
async function getPlaylists({ channel } = {}) {
  const { handle } = pickChannel(channel);
  const { channelId, title } = await resolveChannel(handle);
  const data = await get("playlists", { part: "snippet,contentDetails", channelId, maxResults: 12 });
  const playlists = (data.items || []).map((i) => ({
    title: i.snippet.title,
    videoCount: i.contentDetails.itemCount,
    url: `https://www.youtube.com/playlist?list=${i.id}`,
  }));
  return JSON.stringify({ channel: title, playlists });
}

// --- Tool: static portfolio links (Hitesh + Piyush + cohort) ---
async function getLinks() {
  return JSON.stringify(LINKS);
}

// Implementations the agent dispatches on.
export const TOOLS = { getLatestVideos, searchVideos, getPlaylists, getLinks };

// OpenAI function-calling schemas (passed as `tools` to chat.completions).
const CHANNEL_ENUM = ["chai", "lab", "piyush"];
export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "searchVideos",
      description:
        "Search Hitesh's and Piyush's YouTube videos by topic (e.g. 'docker', 'react'). Use whenever the user asks which video to watch on a topic.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Topic to search for" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getLatestVideos",
      description: "Get the latest uploads from a channel.",
      parameters: {
        type: "object",
        properties: {
          channel: { type: "string", enum: CHANNEL_ENUM, description: "chai=@chaiaurcode, lab=@HiteshCodeLab, piyush=@piyushgargdev" },
        },
        required: ["channel"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPlaylists",
      description: "Get playlists / course series of a channel.",
      parameters: {
        type: "object",
        properties: { channel: { type: "string", enum: CHANNEL_ENUM, description: "chai | lab | piyush" } },
        required: ["channel"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getLinks",
      description: "Get Hitesh's and Piyush's portfolio, platforms, products, socials, and cohort links.",
      parameters: { type: "object", properties: {} },
    },
  },
];
