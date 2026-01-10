import { useSettingsStore } from '@/stores/settingsStore'
import { ServiceIframe } from '@/components/shared/ServiceIframe'

export function ByteStashApp() {
  const baseUrl = useSettingsStore((s) => s.bytestash.baseUrl)

  return (
    <ServiceIframe
      src={baseUrl || null}
      title="ByteStash"
      className="h-full"
      placeholder="ByteStash URL not configured (Settings → API Keys)"
    />
  )
}
