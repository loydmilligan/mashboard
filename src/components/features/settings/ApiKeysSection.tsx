import { useState, useEffect } from 'react'
import { Eye, EyeOff, ExternalLink, Lightbulb, BookOpen, Zap, FileText, LogIn, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettingsStore } from '@/stores/settingsStore'
import { notemarkService } from '@/services/notemark'
import type { NoteMarkBook, NoteMarkNote } from '@/services/notemark'
import { cn } from '@/lib/utils'

// selfh.st icon CDN base URL
const ICON_CDN = 'https://cdn.jsdelivr.net/gh/selfhst/icons'

// Service icon configuration with dark/light variants
interface ServiceIconConfig {
  name: string
  hasLightVariant?: boolean
  hasDarkVariant?: boolean
}

const serviceIcons: Record<string, ServiceIconConfig> = {
  openRouter: { name: 'openrouter', hasLightVariant: true },
  termix: { name: 'terminal', hasDarkVariant: true }, // generic terminal icon
  dumbpad: { name: 'dumbpad' },
  bytestash: { name: 'bytestash' },
  searxng: { name: 'searxng' },
  dozzle: { name: 'dozzle' },
  vikunja: { name: 'vikunja' },
  notemark: { name: 'note-mark' },
  betterBrain: { name: 'brain', hasDarkVariant: true }, // generic brain icon
  youtubeMusic: { name: 'youtube-music' },
  spotify: { name: 'spotify' },
}

// Get icon URL based on theme
function getIconUrl(serviceName: string, theme: 'light' | 'dark'): string {
  const config = serviceIcons[serviceName]
  if (!config) return ''

  let iconName = config.name
  // Use light variant on dark backgrounds, dark variant on light backgrounds
  if (theme === 'dark' && config.hasLightVariant) {
    iconName = `${config.name}-light`
  } else if (theme === 'light' && config.hasDarkVariant) {
    iconName = `${config.name}-dark`
  }

  return `${ICON_CDN}/png/${iconName}.png`
}

// Service icon component
function ServiceIcon({ service, className }: { service: string; className?: string }) {
  const theme = useSettingsStore((s) => s.appearance.theme)
  const [imgError, setImgError] = useState(false)
  const iconUrl = getIconUrl(service, theme === 'light' ? 'light' : 'dark')

  if (imgError || !iconUrl) {
    // Fallback to a generic icon
    return <div className={cn('w-6 h-6 rounded bg-muted', className)} />
  }

  return (
    <img
      src={iconUrl}
      alt={service}
      className={cn('w-6 h-6 object-contain', className)}
      onError={() => setImgError(true)}
    />
  )
}

interface ServiceSectionProps {
  title: string
  serviceKey: keyof typeof serviceIcons
  enabled: boolean
  onToggle: (enabled: boolean) => void
  children: React.ReactNode
}

function ServiceSection({ title, serviceKey, enabled, onToggle, children }: ServiceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ServiceIcon service={serviceKey} />
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${serviceKey}-enabled`} className="text-sm text-muted-foreground">
            {enabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id={`${serviceKey}-enabled`}
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>
      </div>
      <div className={cn(!enabled && 'opacity-50 pointer-events-none')}>
        {children}
      </div>
    </div>
  )
}

interface MaskedInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helpText?: string
  helpLink?: string
}

function MaskedInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  helpLink,
}: MaskedInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {helpLink && (
          <a
            href={helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Get API key <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  )
}

// Icon mapping for configured notes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  BookOpen,
  Zap,
  FileText,
}

export function ApiKeysSection() {
  const {
    openRouterKey,
    setOpenRouterKey,
    termix,
    setTermixConfig,
    dumbpad,
    setDumbpadConfig,
    bytestash,
    setBytestashConfig,
    searxng,
    setSearxngConfig,
    dozzle,
    setDozzleConfig,
    vikunja,
    setVikunjaConfig,
    notemark,
    setNoteMarkConfig,
    betterBrain,
    setBetterBrainConfig,
    youtubeMusic,
    setYouTubeMusicConfig,
    spotify,
    setSpotifyConfig,
    servicesEnabled,
    setServicesEnabled,
  } = useSettingsStore()

  // NoteMark state for dropdowns
  const [notemarkBooks, setNotemarkBooks] = useState<NoteMarkBook[]>([])
  const [notemarkNotes, setNotemarkNotes] = useState<Record<string, NoteMarkNote[]>>({})
  const [loadingNotemark, setLoadingNotemark] = useState(false)

  // NoteMark login state
  const [notemarkLoginPassword, setNotemarkLoginPassword] = useState('')
  const [notemarkLoginLoading, setNotemarkLoginLoading] = useState(false)
  const [notemarkLoginError, setNotemarkLoginError] = useState('')

  // NoteMark login handler
  const handleNotemarkLogin = async () => {
    if (!notemark.username || !notemarkLoginPassword) {
      setNotemarkLoginError('Username and password required')
      return
    }

    setNotemarkLoginLoading(true)
    setNotemarkLoginError('')

    try {
      const result = await notemarkService.login(notemark.username, notemarkLoginPassword)
      setNoteMarkConfig({ token: result.access_token })
      setNotemarkLoginPassword('') // Clear password after success
    } catch (error) {
      setNotemarkLoginError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setNotemarkLoginLoading(false)
    }
  }

  // Fetch NoteMark books when token is set
  useEffect(() => {
    if (notemarkService.isConfigured()) {
      setLoadingNotemark(true)
      notemarkService.getBooks()
        .then(setNotemarkBooks)
        .catch(console.error)
        .finally(() => setLoadingNotemark(false))
    }
  }, [notemark.token, notemark.baseUrl])

  // Fetch notes for selected book
  useEffect(() => {
    if (notemark.defaultBookId && notemarkService.isConfigured()) {
      notemarkService.getBookNotes(notemark.defaultBookId)
        .then((notes) => setNotemarkNotes((prev) => ({ ...prev, [notemark.defaultBookId]: notes })))
        .catch(console.error)
    }
  }, [notemark.defaultBookId])

  // Update a configured note's noteId
  const updateConfiguredNote = (configId: string, noteId: string) => {
    const updatedNotes = notemark.configuredNotes.map((cn) =>
      cn.id === configId ? { ...cn, noteId } : cn
    )
    setNoteMarkConfig({ configuredNotes: updatedNotes })
  }

  return (
    <div className="space-y-6">
      {/* OpenRouter */}
      <ServiceSection
        title="OpenRouter (AI Chat)"
        serviceKey="openRouter"
        enabled={servicesEnabled.openRouter}
        onToggle={(enabled) => setServicesEnabled({ openRouter: enabled })}
      >
        <MaskedInput
          id="openrouter-key"
          label="API Key"
          value={openRouterKey}
          onChange={setOpenRouterKey}
          placeholder="sk-or-v1-..."
          helpText="Required for AI chat functionality"
          helpLink="https://openrouter.ai/keys"
        />
      </ServiceSection>

      <Separator />

      {/* Termix */}
      <ServiceSection
        title="Termix (Terminal & Server Status)"
        serviceKey="termix"
        enabled={servicesEnabled.termix}
        onToggle={(enabled) => setServicesEnabled({ termix: enabled })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="termix-iframe-url">Iframe URL (Terminal Panel)</Label>
            <Input
              id="termix-iframe-url"
              value={termix.iframeUrl}
              onChange={(e) => setTermixConfig({ iframeUrl: e.target.value })}
              placeholder="http://localhost:8080"
            />
            <p className="text-xs text-muted-foreground">
              Direct URL to Termix for the embedded terminal (e.g., http://localhost:8080)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="termix-url">API Base URL (Server Status)</Label>
            <Input
              id="termix-url"
              value={termix.baseUrl}
              onChange={(e) => setTermixConfig({ baseUrl: e.target.value })}
              placeholder="/api/termix"
            />
            <p className="text-xs text-muted-foreground">
              Use /api/termix with the proxy Docker setup for API calls
            </p>
          </div>
          <MaskedInput
            id="termix-token"
            label="JWT Token (Server Status)"
            value={termix.token}
            onChange={(value) => setTermixConfig({ token: value })}
            placeholder="eyJ..."
            helpText="F12 → Application → Cookies → copy 'jwt' value from Termix"
          />
        </div>
      </ServiceSection>

      <Separator />

      {/* Dumbpad */}
      <ServiceSection
        title="Dumbpad (Notes)"
        serviceKey="dumbpad"
        enabled={servicesEnabled.dumbpad}
        onToggle={(enabled) => setServicesEnabled({ dumbpad: enabled })}
      >
        <div className="space-y-2">
          <Label htmlFor="dumbpad-url">Base URL</Label>
          <Input
            id="dumbpad-url"
            value={dumbpad.baseUrl}
            onChange={(e) => setDumbpadConfig({ baseUrl: e.target.value })}
            placeholder="https://dumbpad.yourdomain.com or /dumbpad"
          />
          <p className="text-xs text-muted-foreground">
            Use /dumbpad if using the proxy Docker setup (solves PIN cookie issues)
          </p>
        </div>
      </ServiceSection>

      <Separator />

      {/* ByteStash */}
      <ServiceSection
        title="ByteStash (Snippets)"
        serviceKey="bytestash"
        enabled={servicesEnabled.bytestash}
        onToggle={(enabled) => setServicesEnabled({ bytestash: enabled })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bytestash-url">Base URL</Label>
            <Input
              id="bytestash-url"
              value={bytestash.baseUrl}
              onChange={(e) => setBytestashConfig({ baseUrl: e.target.value })}
              placeholder="https://bytestash.yourdomain.com"
            />
          </div>
          <MaskedInput
            id="bytestash-key"
            label="API Key"
            value={bytestash.apiKey}
            onChange={(value) => setBytestashConfig({ apiKey: value })}
            placeholder="bs_..."
            helpText="API key for ByteStash access"
          />
        </div>
      </ServiceSection>

      <Separator />

      {/* SearXNG */}
      <ServiceSection
        title="SearXNG (Search)"
        serviceKey="searxng"
        enabled={servicesEnabled.searxng}
        onToggle={(enabled) => setServicesEnabled({ searxng: enabled })}
      >
        <div className="space-y-2">
          <Label htmlFor="searxng-url">Base URL</Label>
          <Input
            id="searxng-url"
            value={searxng.baseUrl}
            onChange={(e) => setSearxngConfig({ baseUrl: e.target.value })}
            placeholder="https://searxng.yourdomain.com"
          />
          <p className="text-xs text-muted-foreground">
            URL to your SearXNG instance for web search integration
          </p>
        </div>
      </ServiceSection>

      <Separator />

      {/* Dozzle */}
      <ServiceSection
        title="Dozzle (Container Logs)"
        serviceKey="dozzle"
        enabled={servicesEnabled.dozzle}
        onToggle={(enabled) => setServicesEnabled({ dozzle: enabled })}
      >
        <div className="space-y-2">
          <Label htmlFor="dozzle-url">Base URL</Label>
          <Input
            id="dozzle-url"
            value={dozzle.baseUrl}
            onChange={(e) => setDozzleConfig({ baseUrl: e.target.value })}
            placeholder="/dozzle"
          />
          <p className="text-xs text-muted-foreground">
            URL to Dozzle for viewing Docker container logs (e.g., /dozzle with proxy setup)
          </p>
        </div>
      </ServiceSection>

      <Separator />

      {/* Vikunja */}
      <ServiceSection
        title="Vikunja (Tasks)"
        serviceKey="vikunja"
        enabled={servicesEnabled.vikunja}
        onToggle={(enabled) => setServicesEnabled({ vikunja: enabled })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vikunja-iframe-url">Iframe URL</Label>
            <Input
              id="vikunja-iframe-url"
              value={vikunja.iframeUrl}
              onChange={(e) => setVikunjaConfig({ iframeUrl: e.target.value })}
              placeholder="http://localhost:3000/vikunja or /vikunja"
            />
            <p className="text-xs text-muted-foreground">
              URL to open Vikunja in a new tab (for full task management)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vikunja-url">API Base URL</Label>
            <Input
              id="vikunja-url"
              value={vikunja.baseUrl}
              onChange={(e) => setVikunjaConfig({ baseUrl: e.target.value })}
              placeholder="/api/vikunja"
            />
            <p className="text-xs text-muted-foreground">
              Use /api/vikunja with the proxy Docker setup for API calls
            </p>
          </div>
          <MaskedInput
            id="vikunja-token"
            label="API Token"
            value={vikunja.token}
            onChange={(value) => setVikunjaConfig({ token: value })}
            placeholder="tk_..."
            helpText="Create an API token in Vikunja Settings → API Tokens"
          />
        </div>
      </ServiceSection>

      <Separator />

      {/* NoteMark */}
      <ServiceSection
        title="NoteMark (Notes)"
        serviceKey="notemark"
        enabled={servicesEnabled.notemark}
        onToggle={(enabled) => setServicesEnabled({ notemark: enabled })}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notemark-iframe-url">Iframe URL</Label>
            <Input
              id="notemark-iframe-url"
              value={notemark.iframeUrl}
              onChange={(e) => setNoteMarkConfig({ iframeUrl: e.target.value })}
              placeholder="http://localhost:8080"
            />
            <p className="text-xs text-muted-foreground">
              URL to open NoteMark in a new tab (for full note editing)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notemark-url">API Base URL</Label>
            <Input
              id="notemark-url"
              value={notemark.baseUrl}
              onChange={(e) => setNoteMarkConfig({ baseUrl: e.target.value })}
              placeholder="/api/notemark"
            />
            <p className="text-xs text-muted-foreground">
              Use /api/notemark with the proxy Docker setup for API calls
            </p>
          </div>
          {/* Login Form */}
          <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
            <Label className="text-sm font-medium">Login to NoteMark</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="notemark-username" className="text-xs">Username</Label>
                <Input
                  id="notemark-username"
                  value={notemark.username}
                  onChange={(e) => setNoteMarkConfig({ username: e.target.value })}
                  placeholder="your-username"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notemark-password" className="text-xs">Password</Label>
                <Input
                  id="notemark-password"
                  type="password"
                  value={notemarkLoginPassword}
                  onChange={(e) => setNotemarkLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && handleNotemarkLogin()}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleNotemarkLogin}
                disabled={notemarkLoginLoading || !notemark.username || !notemarkLoginPassword}
              >
                {notemarkLoginLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Login
              </Button>
              {notemark.token && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Token set</span>
              )}
              {notemarkLoginError && (
                <span className="text-xs text-red-600 dark:text-red-400">{notemarkLoginError}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your NoteMark credentials to get an access token
            </p>
          </div>

          {/* Manual Token Entry (for advanced users) */}
          <MaskedInput
            id="notemark-token"
            label="Access Token (manual)"
            value={notemark.token}
            onChange={(value) => setNoteMarkConfig({ token: value })}
            placeholder="eyJ..."
            helpText="Or paste a token directly if you have one"
          />

          {/* Default Book Selection */}
          {notemarkBooks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="notemark-book">Default Notebook</Label>
              <Select
                value={notemark.defaultBookId}
                onValueChange={(value) => setNoteMarkConfig({ defaultBookId: value })}
              >
                <SelectTrigger id="notemark-book">
                  <SelectValue placeholder="Select a notebook..." />
                </SelectTrigger>
                <SelectContent>
                  {notemarkBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default notebook for creating new notes
              </p>
            </div>
          )}

          {/* Configured Notes */}
          {notemark.defaultBookId && notemarkNotes[notemark.defaultBookId]?.length > 0 && (
            <div className="space-y-3">
              <Label>Quick Access Notes</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Map specific notes for quick access (Ideas, Research, Quick Thoughts)
              </p>
              {notemark.configuredNotes.map((configNote) => {
                const Icon = iconMap[configNote.icon] || FileText
                return (
                  <div key={configNote.id} className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${configNote.color}`} />
                    <span className="w-28 text-sm font-medium">{configNote.name}</span>
                    <Select
                      value={configNote.noteId || 'none'}
                      onValueChange={(value) => updateConfiguredNote(configNote.id, value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a note..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not configured</SelectItem>
                        {notemarkNotes[notemark.defaultBookId]?.map((note) => (
                          <SelectItem key={note.id} value={note.id}>
                            {note.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          )}

          {loadingNotemark && (
            <p className="text-xs text-muted-foreground">Loading NoteMark data...</p>
          )}
        </div>
      </ServiceSection>

      <Separator />

      {/* Better Brain */}
      <ServiceSection
        title="Better Brain (Knowledge Base)"
        serviceKey="betterBrain"
        enabled={servicesEnabled.betterBrain}
        onToggle={(enabled) => setServicesEnabled({ betterBrain: enabled })}
      >
        <div className="space-y-2">
          <Label htmlFor="betterbrain-url">API Base URL</Label>
          <Input
            id="betterbrain-url"
            value={betterBrain.baseUrl}
            onChange={(e) => setBetterBrainConfig({ baseUrl: e.target.value })}
            placeholder="http://localhost:8002"
          />
          <p className="text-xs text-muted-foreground">
            URL to your Better Brain API (for knowledge base and daily briefings)
          </p>
        </div>
      </ServiceSection>

      <Separator />

      {/* YouTube Music */}
      <ServiceSection
        title="YouTube Music (Playlist Export)"
        serviceKey="youtubeMusic"
        enabled={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Configure OAuth credentials to create YouTube Music playlists from Music League.
            Requires a Google Cloud project with YouTube Data API v3 enabled.
          </p>
          <MaskedInput
            id="youtube-client-id"
            label="Client ID"
            value={youtubeMusic.clientId}
            onChange={(value) => setYouTubeMusicConfig({ clientId: value })}
            placeholder="xxxx.apps.googleusercontent.com"
            helpText="From Google Cloud Console → APIs & Services → Credentials"
            helpLink="https://console.cloud.google.com/apis/credentials"
          />
          <MaskedInput
            id="youtube-client-secret"
            label="Client Secret"
            value={youtubeMusic.clientSecret}
            onChange={(value) => setYouTubeMusicConfig({ clientSecret: value })}
            placeholder="GOCSPX-..."
            helpText="OAuth 2.0 Client Secret"
          />
          <MaskedInput
            id="youtube-refresh-token"
            label="Refresh Token"
            value={youtubeMusic.refreshToken}
            onChange={(value) => setYouTubeMusicConfig({ refreshToken: value })}
            placeholder="1//..."
            helpText="OAuth refresh token (use OAuth Playground to generate)"
            helpLink="https://developers.google.com/oauthplayground/"
          />
        </div>
      </ServiceSection>

      <Separator />

      {/* Spotify */}
      <ServiceSection
        title="Spotify (Playlist Export)"
        serviceKey="spotify"
        enabled={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Configure OAuth credentials to create Spotify playlists from Music League.
            Requires a Spotify Developer app.
          </p>
          <MaskedInput
            id="spotify-client-id"
            label="Client ID"
            value={spotify.clientId}
            onChange={(value) => setSpotifyConfig({ clientId: value })}
            placeholder="32 character hex string"
            helpText="From Spotify Developer Dashboard → Your App → Settings"
            helpLink="https://developer.spotify.com/dashboard"
          />
          <MaskedInput
            id="spotify-client-secret"
            label="Client Secret"
            value={spotify.clientSecret}
            onChange={(value) => setSpotifyConfig({ clientSecret: value })}
            placeholder="32 character hex string"
            helpText="Client Secret from your Spotify app"
          />
          <MaskedInput
            id="spotify-refresh-token"
            label="Refresh Token"
            value={spotify.refreshToken}
            onChange={(value) => setSpotifyConfig({ refreshToken: value })}
            placeholder="AQ..."
            helpText="OAuth refresh token (use Spotify auth flow to generate)"
            helpLink="https://developer.spotify.com/documentation/web-api/tutorials/code-flow"
          />
        </div>
      </ServiceSection>
    </div>
  )
}
