# Hitesh Choudhary — Persona AI Agent

A Hinglish AI agent that talks like **Hitesh Choudhary** (Chai aur Code) in a 1:1 chat, and can
recommend real YouTube videos/playlists from **his two channels + Piyush Garg's** via the YouTube
Data API. One agent core, two faces: CLI and an HTTP API (ready for a shadcn UI + Render deploy).

Persona was built by analyzing 4 live-stream transcripts — see [docs/PERSONA.md](docs/PERSONA.md).

## Structure
```
src/
  config.js    env, OpenAI/GROQ client, channels, static links
  persona.js   SYSTEM_PROMPT (voice, 1:1 rules, length limits, tool rules)
  tools.js     YouTube tools (search / latest / playlists) + links + function schemas
  agent.js     the brain — native function-calling loop, createAgent().ask()
  cli.js       interactive / one-shot terminal chat
  server.js    Express API: POST /api/chat, GET /api/health
docs/PERSONA.md   persona analysis
transcripts/      source live-stream transcripts
Dockerfile, render.yaml   deploy
```

## Setup
```bash
cd Persona-assignment
npm install
cp .env.example .env    # fill OPENAI_API_KEY, BASE_URL, MODEL, YT_API_KEY
```
`YT_API_KEY` = a YouTube Data API v3 key (Google Cloud Console → enable *YouTube Data API v3* → API key).

## Run — CLI
```bash
npm run chat                      # interactive chat
node src/cli.js "docker ki video do"   # one-shot
node src/cli.js --verbose "..."        # show which tools fired
```

## Run — HTTP API (UI-ready)
```bash
npm start                         # http://localhost:3000
```
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"react seekhun ya vue?","sessionId":"u1"}'
# -> { "text": "...", "steps": [ {type:"tool", name, args} ] }
```
`sessionId` keeps per-user conversation memory. `GET /api/health` → `{ ok: true }`.

## Tools
| Tool | Does |
|------|------|
| `searchVideos(query)` | search videos by topic across Hitesh + Piyush channels |
| `getLatestVideos(channel)` | latest uploads (`chai` / `lab` / `piyush`) |
| `getPlaylists(channel)` | playlists / course series |
| `getLinks()` | portfolios, platforms, products, socials, cohort |

Tool use is via native OpenAI function-calling, so links are **always real** — the model cannot
invent video URLs.

## Docker
```bash
docker build -t persona-api .
docker run -p 3000:3000 --env-file .env persona-api
```

## Deploy on Render
Push to a Git repo, then either:
- **Blueprint:** point Render at [render.yaml](render.yaml) (Docker web service, health check
  `/api/health`). Set `OPENAI_API_KEY` and `YT_API_KEY` as secrets in the dashboard.
- **Manual:** New Web Service → Docker → add the same env vars.

## Next
- shadcn UI chat frontend calling `POST /api/chat`.
