interface YouTubeAppProps {
  videoId: string
  startTime?: number
}

export function YouTubeApp({ videoId, startTime }: YouTubeAppProps) {
  // Build YouTube embed URL
  let embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  if (startTime) {
    embedUrl += `&start=${startTime}`
  }

  if (!videoId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No YouTube video ID provided
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <iframe
        src={embedUrl}
        title="YouTube Video"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
