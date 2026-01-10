import { useSettingsStore } from '@/stores/settingsStore'
import { ServiceIframe } from '@/components/shared/ServiceIframe'

export function TermixApp() {
  const iframeUrl = useSettingsStore((s) => s.termix.iframeUrl)

  return (
    <ServiceIframe
      src={iframeUrl || null}
      title="Termix"
      className="h-full"
      placeholder="Termix iframe URL not configured (Settings → API Keys)"
    />
  )
}
