import { ServiceIframe } from '@/components/shared/ServiceIframe'

interface WebViewAppProps {
  url: string
}

export function WebViewApp({ url }: WebViewAppProps) {
  return (
    <ServiceIframe
      src={url}
      title="Web View"
      className="h-full"
      placeholder="No URL provided"
    />
  )
}
