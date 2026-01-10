import { Music } from 'lucide-react'

interface AudioPlayerAppProps {
  url: string
  originalName?: string
}

export function AudioPlayerApp({ url, originalName }: AudioPlayerAppProps) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No audio URL provided
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-muted/20 to-muted/5 p-8">
      {/* Album art placeholder */}
      <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted/50 shadow-lg">
        <Music className="h-24 w-24 text-muted-foreground/50" />
      </div>

      {/* Track name */}
      <div className="text-center">
        <p className="text-lg font-medium">{originalName || 'Audio Track'}</p>
      </div>

      {/* Audio player */}
      <audio
        src={url}
        controls
        className="w-full max-w-md"
        controlsList="nodownload"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
