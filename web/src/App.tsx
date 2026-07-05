import { useEffect, useState } from "react"
import { BotIcon, MoonIcon, SendIcon, SunIcon, UserIcon, WrenchIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { sendChat, type ToolStep } from "@/lib/api"
import { formatMessage } from "@/lib/format"

type ChatMsg = {
  id: string
  role: "user" | "assistant"
  text: string
  steps?: ToolStep[]
}

const SESSION_ID = crypto.randomUUID()
const HITESH_AVATAR = "https://avatars.githubusercontent.com/u/11613311?v=4"

function HiteshAvatar() {
  return (
    <Avatar>
      <AvatarImage src={HITESH_AVATAR} alt="Hitesh" />
      <AvatarFallback>
        <BotIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  )
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme")
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  return [dark, setDark] as const
}

const WELCOME: ChatMsg = {
  id: "welcome",
  role: "assistant",
  text: "Hey, kaise ho? Coding, career, ya konsi video dekhni hai — kuch bhi pucho.",
}

function ToolMarker({ step }: { step: ToolStep }) {
  return (
    <Marker>
      <MarkerIcon>
        <WrenchIcon />
      </MarkerIcon>
      <MarkerContent>
        {step.name}
        {step.args && Object.keys(step.args).length > 0
          ? `(${Object.values(step.args).join(", ")})`
          : ""}
      </MarkerContent>
    </Marker>
  )
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user"
  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageAvatar>
        {isUser ? (
          <Avatar>
            <AvatarFallback>
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <HiteshAvatar />
        )}
      </MessageAvatar>
      <MessageContent>
        {msg.steps?.map((step, i) => <ToolMarker key={i} step={step} />)}
        <Bubble align={isUser ? "end" : "start"} variant={isUser ? "default" : "secondary"}>
          <BubbleContent className="whitespace-pre-wrap">{formatMessage(msg.text)}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function TypingBubble() {
  return (
    <Message align="start">
      <MessageAvatar>
        <HiteshAvatar />
      </MessageAvatar>
      <MessageContent>
        <Bubble variant="secondary">
          <BubbleContent>
            <span className="shimmer">Hitesh is typing...</span>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function App() {
  const [dark, setDark] = useDarkMode()
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }])
    setInput("")
    setLoading(true)

    try {
      const { text: reply, steps } = await sendChat(text, SESSION_ID)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: reply, steps },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Yaar, connection mein dikkat aa gayi. (${(err as Error).message})`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-svh max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <HiteshAvatar />
        <div className="flex-1">
          <p className="text-sm font-medium">Hitesh — Persona Agent</p>
          <p className="text-xs text-muted-foreground">Chai aur Code</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </header>

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="px-4 py-6">
              {messages.map((msg) => (
                <MessageScrollerItem key={msg.id}>
                  <ChatBubble msg={msg} />
                </MessageScrollerItem>
              ))}
              {loading && (
                <MessageScrollerItem>
                  <TypingBubble />
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Docker seekhna hai, konsi video dekhun?"
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <SendIcon />
        </Button>
      </form>
    </div>
  )
}

export default App
