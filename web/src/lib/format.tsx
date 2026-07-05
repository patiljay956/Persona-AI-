// Minimal renderer: turns URLs into links and **bold** into <strong>. No markdown lib needed.
const TOKEN_RE = /(\*\*[^*]+\*\*|https?:\/\/\S+)/g

export function formatMessage(text: string) {
  return text.split(TOKEN_RE).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("http")) {
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
