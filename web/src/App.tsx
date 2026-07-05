import { useState } from "react"
import { BotIcon, SendIcon, UserIcon, WrenchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
        <Avatar>
          <AvatarFallback>
            {isUser ? <UserIcon className="size-4" /> : <BotIcon className="size-4" />}
          </AvatarFallback>
        </Avatar>
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
        <Avatar>
          <AvatarFallback>
            <BotIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
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
        <Avatar>
          <AvatarFallback>
            <BotIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Hitesh — Persona Agent</p>
          <p className="text-xs text-muted-foreground">Chai aur Code</p>
        </div>
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
