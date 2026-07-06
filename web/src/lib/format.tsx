// Minimal renderer: turns URLs into links and **bold** into <strong>. No markdown lib needed.
import { Card } from "@/components/ui/card"

const TOKEN_RE = /(\*\*[^*]+\*\*|https?:\/\/\S+)/g
const YT_RE = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function formatMessage(text: string) {
  return text.split(TOKEN_RE).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("http")) {
      const isYouTube = part.includes("youtube.com") || part.includes("youtu.be")
      
      if (isYouTube) {
        const ytMatch = part.match(YT_RE)
        const videoId = ytMatch ? ytMatch[1] : null
        
        const playlistMatch = part.match(/[?&]list=([a-zA-Z0-9_-]+)/)
        const playlistId = playlistMatch ? playlistMatch[1] : null

        if (videoId || playlistId) {
          let embedUrl = ""
          if (videoId && playlistId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?list=${playlistId}`
          } else if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`
          } else if (playlistId) {
            embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`
          }

          return (
            <Card key={i} className="my-2 max-w-sm overflow-hidden p-0">
              <iframe
                width="100%"
                className="aspect-video w-full"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </Card>
          )
        }
      }

      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {part}
        </a>
      )
    }
    return part
  })
}
