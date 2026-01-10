import { useSettingsStore } from '@/stores/settingsStore'
import { ServiceIframe } from '@/components/shared/ServiceIframe'

interface SearxngAppProps {
  query?: string
}

export function SearxngApp({ query }: SearxngAppProps) {
  const baseUrl = useSettingsStore((s) => s.searxng.baseUrl)

  // Build the search URL with query if provided
  const searchUrl = baseUrl
    ? query
      ? `${baseUrl}/search?q=${encodeURIComponent(query)}`
      : baseUrl
    : null

  return (
    <ServiceIframe
      src={searchUrl}
      title="SearXNG"
      className="h-full"
      placeholder="SearXNG URL not configured (Settings → API Keys)"
    />
  )
}
