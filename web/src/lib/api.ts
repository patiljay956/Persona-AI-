// Talks to the Persona backend (Express API in ../../src/server.js).
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export type ToolStep = { type: "tool"; name: string; args: Record<string, unknown> }

export type ChatResponse = { text: string; steps: ToolStep[] }

export async function sendChat(message: string, sessionId: string): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}
