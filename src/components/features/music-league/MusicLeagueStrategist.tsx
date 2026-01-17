import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Music2,
  Send,
  Star,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trophy,
  ListMusic,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMusicLeagueStore, getConversationPrompt, getFinalistsPrompt, getLongTermPreferencePrompt } from '@/stores/musicLeagueStore'
import { useModelsStore } from '@/stores/modelsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { openRouterService } from '@/services/openrouter'
import { youtubeMusicService } from '@/services/youtubeMusic'
import { spotifyService } from '@/services/spotify'
import type { AIConversationResponse, Song, RejectedSong, SessionPreference, LongTermPreference } from '@/types/musicLeague'
import { cn } from '@/lib/utils'

// Parse AI JSON response
function parseAIResponse(content: string): AIConversationResponse | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return null
  }
}

// Get YouTube search URL for a song
function getYouTubeUrl(song: Song): string {
  if (song.youtubeVideoId) {
    return `https://www.youtube.com/watch?v=${song.youtubeVideoId}`
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.artist}`)}`
}

export function MusicLeagueStrategist(): JSX.Element {
  const [input, setInput] = useState('')
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Store state
  const {
    sessions,
    activeSessionId,
    strategistModel,
    isProcessing,
    error,
    userProfile,
    activeSession,
    createSession,
    resumeSession,
    setTheme,
    setCandidates,
    toggleFavorite,
    setFinalists,
    addToConversation,
    setPlaylistCreated,
    incrementIteration,
    setProcessing,
    setError,
    setStrategistModel,
    addRejectedSongs,
    addSessionPreferences,
    addLongTermPreferences,
    setFinalPick,
  } = useMusicLeagueStore()

  // Models and settings
  const { models } = useModelsStore()
  const openRouterKey = useSettingsStore((s) => s.openRouterKey)
  const defaultModel = useSettingsStore((s) => s.ai.defaultModel)

  // Derived state
  const session = activeSession()
  const candidates = session?.candidates || []
  const finalists = session?.finalists || []
  const conversation = session?.conversationHistory || []

  // Get the model to use
  const getModelId = useCallback((): string => {
    if (strategistModel) return strategistModel
    if (defaultModel) return defaultModel
    return 'anthropic/claude-sonnet-4'
  }, [strategistModel, defaultModel])

  // Get model nickname
  const getNickname = (modelId: string): string => {
    const entry = models.find((m) => m.model_id === modelId)
    return entry?.nickname || modelId.split('/').pop() || modelId
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.length])

  // Create session on mount if none exists
  useEffect(() => {
    if (!activeSessionId && sessions.length === 0) {
      createSession()
    }
  }, [activeSessionId, sessions.length, createSession])

  // Main send handler - all interaction goes through chat
  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing || !session) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Check API key
    if (!openRouterKey) {
      setError('OpenRouter API key not configured. Add it in Settings.')
      return
    }

    // Add user message to conversation
    addToConversation('user', userMessage)

    // Set theme if this is the first message
    if (!session.theme && conversation.length === 0) {
      setTheme({ rawTheme: userMessage })
    }

    setProcessing(true)

    try {
      // Build system prompt with current context
      const systemPrompt = session.phase === 'finalists'
        ? getFinalistsPrompt(session)
        : getConversationPrompt(session, userProfile)

      // Build messages
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...conversation.map((entry) => ({
          role: entry.role as 'user' | 'assistant',
          content: entry.content,
        })),
        { role: 'user', content: userMessage },
      ]

      // Call OpenRouter (non-streaming for JSON parsing)
      const assistantContent = await openRouterService.chat(
        messages,
        getModelId(),
        { temperature: 0.8, max_tokens: 4000 }
      )

      // Parse the AI response
      const parsed = parseAIResponse(assistantContent)

      if (parsed) {
        // Update candidates from response
        if (parsed.candidates && parsed.candidates.length > 0) {
          const newCandidates: Song[] = parsed.candidates.map((c, idx) => ({
            id: `song-${Date.now()}-${idx}`,
            title: c.title,
            artist: c.artist,
            album: c.album,
            year: c.year,
            genre: c.genre,
            reason: c.reason,
            question: c.question,
          }))
          setCandidates(newCandidates)
        }

        // Update theme interpretation
        if (parsed.interpretation && session.theme) {
          setTheme({
            ...session.theme,
            interpretation: parsed.interpretation,
          })
        }

        // Handle extracted preferences from AI response
        if (parsed.extractedPreferences && parsed.extractedPreferences.length > 0) {
          const sessionPrefs: SessionPreference[] = parsed.extractedPreferences.map((p) => ({
            statement: p.statement,
            confidence: p.confidence,
            source: userMessage,
            timestamp: Date.now(),
          }))
          addSessionPreferences(sessionPrefs)
        }

        // Handle songs to reject from AI response
        if (parsed.songsToReject && parsed.songsToReject.length > 0) {
          const rejectedSongs: RejectedSong[] = parsed.songsToReject.map((s) => ({
            title: s.title,
            artist: s.artist,
            reason: s.reason,
            timestamp: Date.now(),
          }))
          addRejectedSongs(rejectedSongs)
        }

        // Handle actions
        if (parsed.action) {
          if (parsed.action === 'create_playlist:spotify' || parsed.action === 'create_playlist:youtube') {
            const platform = parsed.action.includes('spotify') ? 'spotify' : 'youtube'
            await handleCreatePlaylist(platform)
          } else if (parsed.action === 'enter_finalists') {
            // Move current candidates to finalists
            setFinalists(candidates)
          } else if (parsed.action === 'finalize_pick') {
            // Handle final pick - extract long-term preferences
            // Find the picked song
            let finalSong: Song | undefined
            const pickedCandidate = parsed.candidates?.[0]
            if (pickedCandidate) {
              finalSong = candidates.find(
                (c) => c.title.toLowerCase() === pickedCandidate.title.toLowerCase() &&
                       c.artist.toLowerCase() === pickedCandidate.artist.toLowerCase()
              )
            }
            if (!finalSong && finalists.length > 0) {
              finalSong = finalists[0]
            }
            if (!finalSong && candidates.length > 0) {
              finalSong = candidates[0]
            }
            if (finalSong) {
              setFinalPick(finalSong)
            }

            // Extract long-term preferences from session
            if (session.sessionPreferences && session.sessionPreferences.length > 0) {
              try {
                const extractionPrompt = getLongTermPreferencePrompt(
                  session.sessionPreferences,
                  userProfile?.longTermPreferences || []
                )
                const extractionMessages: Array<{ role: 'system' | 'user'; content: string }> = [
                  { role: 'system', content: extractionPrompt },
                  { role: 'user', content: 'Extract long-term preferences from this session now.' },
                ]
                const extractionResult = await openRouterService.chat(
                  extractionMessages,
                  getModelId(),
                  { temperature: 0.3, max_tokens: 2000 }
                )
                try {
                  const jsonMatch = extractionResult.match(/\{[\s\S]*\}/)
                  if (jsonMatch) {
                    const extractedPrefs = JSON.parse(jsonMatch[0]) as {
                      newLongTermPreferences?: Array<{
                        statement: string
                        specificity: 'general' | 'specific'
                        weight: number
                      }>
                    }
                    if (extractedPrefs.newLongTermPreferences && extractedPrefs.newLongTermPreferences.length > 0) {
                      const newPrefs: LongTermPreference[] = extractedPrefs.newLongTermPreferences.map((p) => ({
                        statement: p.statement,
                        specificity: p.specificity,
                        weight: p.weight,
                        addedAt: Date.now(),
                      }))
                      addLongTermPreferences(newPrefs)
                      addToConversation('system', `Learned ${newPrefs.length} new long-term preference(s) from this session.`)
                    }
                  }
                } catch (parseError) {
                  console.error('Failed to parse long-term preference extraction:', parseError)
                }
              } catch (err) {
                console.error('Failed to extract long-term preferences:', err)
              }
            }
          }
        }

        // Add the conversational message to history
        addToConversation('assistant', parsed.message)
      } else {
        // If we can't parse, just add the raw response
        addToConversation('assistant', assistantContent)
      }

      incrementIteration()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get response'
      setError(message)
      addToConversation('system', `Error: ${message}`)
    } finally {
      setProcessing(false)
    }
  }, [
    input,
    isProcessing,
    session,
    conversation,
    openRouterKey,
    userProfile,
    candidates,
    finalists,
    addToConversation,
    setTheme,
    setCandidates,
    setFinalists,
    incrementIteration,
    setProcessing,
    setError,
    getModelId,
    addRejectedSongs,
    addSessionPreferences,
    addLongTermPreferences,
    setFinalPick,
  ])

  // Create playlist handler
  const handleCreatePlaylist = useCallback(async (platform: 'youtube' | 'spotify') => {
    if (candidates.length === 0) return

    setIsCreatingPlaylist(true)

    try {
      const service = platform === 'spotify' ? spotifyService : youtubeMusicService
      const configCheck = service.checkConfiguration()

      if (!configCheck.configured) {
        // Fallback to opening search tabs
        candidates.forEach((song, index) => {
          const query = encodeURIComponent(`${song.title} ${song.artist}`)
          const baseUrl = platform === 'spotify'
            ? 'https://open.spotify.com/search/'
            : 'https://music.youtube.com/search?q='
          setTimeout(() => {
            window.open(`${baseUrl}${query}`, '_blank', 'noopener')
          }, index * 250)
        })
        addToConversation('system', `${platform === 'spotify' ? 'Spotify' : 'YouTube Music'} not configured. Opened search tabs instead.`)
        return
      }

      // Create actual playlist
      const themeName = session?.theme?.rawTheme || 'Music League'
      const title = `ML: ${themeName.split('\n')[0].substring(0, 50)}`
      const description = `Music League candidates. Generated by Mashboard.`

      const result = await service.createPlaylist(title, description, candidates)

      setPlaylistCreated(platform, result.playlistId, result.playlistUrl)
      addToConversation('assistant', `✅ Playlist created on ${platform === 'spotify' ? 'Spotify' : 'YouTube Music'}!\n\n🎵 [Open Playlist](${result.playlistUrl})\n\nGive it a listen, then come back and tell me what you think. Any songs that hit different? Any that fell flat?`)

      // Open the playlist
      window.open(result.playlistUrl, '_blank', 'noopener')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create playlist'
      setError(message)
      addToConversation('system', `Error creating playlist: ${message}`)
    } finally {
      setIsCreatingPlaylist(false)
    }
  }, [candidates, session, addToConversation, setPlaylistCreated, setError])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Model options
  const modelOptions = models.filter((entry) => entry.model_id)
  const defaultModelLabel = defaultModel ? `Default (${getNickname(defaultModel)})` : 'Default'
  const modelValue = strategistModel ?? '__default__'

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden bg-background p-4" data-testid="music-league-strategist">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" data-testid="ml-header">Music League Strategist</h2>
            <p className="text-xs text-muted-foreground" data-testid="ml-mode">
              {session?.phase === 'finalists' ? 'Finalists Mode' : 'Conversation Mode'}
              {session?.iterationCount ? ` • ${session.iterationCount} iterations` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Session selector */}
          <Select
            value={activeSessionId ?? ''}
            onValueChange={(value) => resumeSession(value)}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {new Date(s.createdAt).toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Model selector */}
          <Select
            value={modelValue}
            onValueChange={(value) =>
              setStrategistModel(value === '__default__' ? null : value)
            }
            disabled={modelOptions.length === 0}
          >
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default__">{defaultModelLabel}</SelectItem>
              {modelOptions.map((entry) => (
                <SelectItem key={entry.id} value={entry.model_id}>
                  {entry.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => createSession()} data-testid="ml-new-session">
            <RefreshCw className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Main content - Chat + Candidates side by side */}
      <div className="grid h-full grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[2fr_1fr]">
        {/* Chat Panel */}
        <Card className="flex h-full flex-col overflow-hidden" data-testid="ml-chat-panel">
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListMusic className="h-4 w-4 text-primary" />
              Chat
              {session?.theme && (
                <Badge variant="outline" className="ml-2 font-normal">
                  {session.theme.rawTheme.split('\n')[0].substring(0, 40)}...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col overflow-hidden p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3">
                {conversation.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground" data-testid="ml-welcome-message">
                    <p className="font-medium">Drop your Music League theme to get started.</p>
                    <p className="mt-2 text-xs">
                      I'll generate 5-8 candidates and ask questions to refine the list.
                      Just chat naturally - say things like "make this a Spotify playlist" when ready.
                    </p>
                  </div>
                ) : (
                  conversation.map((entry, index) => (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      data-testid={`ml-message-${entry.role}-${index}`}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm',
                        entry.role === 'assistant' && 'bg-muted/30',
                        entry.role === 'user' && 'bg-primary/5 border-primary/20',
                        entry.role === 'system' && 'bg-yellow-500/10 border-yellow-500/20'
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                        <span>{entry.role === 'assistant' ? 'Strategist' : entry.role}</span>
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap" data-testid={`ml-message-content-${index}`}>{entry.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Error display */}
            {error && (
              <div className="border-t border-destructive bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Input area */}
            <div className="border-t px-4 py-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !session?.theme
                    ? 'Paste your Music League theme here...'
                    : 'Chat to refine candidates, or say "make this a Spotify playlist"...'
                }
                className="min-h-[80px] resize-none"
                disabled={isProcessing}
                data-testid="ml-input"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                    className="gap-2"
                    data-testid="ml-send-button"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" data-testid="ml-loading" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
                <div className="flex gap-2">
                  {candidates.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreatePlaylist('spotify')}
                        disabled={isCreatingPlaylist}
                        data-testid="ml-spotify-button"
                      >
                        {isCreatingPlaylist ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : null}
                        Spotify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreatePlaylist('youtube')}
                        disabled={isCreatingPlaylist}
                        data-testid="ml-youtube-button"
                      >
                        YouTube
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Panel */}
        <Card className="flex h-full flex-col overflow-hidden" data-testid="ml-candidates-panel">
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Candidates
                <Badge variant="secondary" className="ml-1" data-testid="ml-candidates-count">
                  {candidates.length}
                </Badge>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-3">
                {candidates.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground" data-testid="ml-no-candidates">
                    No candidates yet. Start chatting to generate songs.
                  </div>
                ) : (
                  candidates.map((song, index) => (
                    <div
                      key={song.id}
                      data-testid={`ml-candidate-${index}`}
                      data-artist={song.artist}
                      className={cn(
                        'rounded-lg border p-3 transition-colors',
                        song.isFavorite && 'border-amber-500/50 bg-amber-500/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{index + 1}.</span>
                            <span className="font-medium truncate">{song.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleFavorite(song.id)}
                          >
                            <Star
                              className={cn(
                                'h-4 w-4',
                                song.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
                              )}
                            />
                          </Button>
                          <a
                            href={getYouTubeUrl(song)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        </div>
                      </div>
                      {song.reason && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {song.reason}
                        </p>
                      )}
                      {song.question && (
                        <div className="mt-2 rounded bg-primary/5 px-2 py-1" data-testid={`ml-candidate-question-${index}`}>
                          <p className="text-xs text-primary">❓ {song.question}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Finalists section - shown when in finalists mode */}
      {session?.phase === 'finalists' && finalists.length > 0 && (
        <Card className="border-amber-500/50" data-testid="ml-finalists-panel">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-500" />
              Finalists ({finalists.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" data-testid="ml-finalists-list">
              {finalists.map((song, index) => (
                <Badge key={song.id} variant="outline" className="py-1" data-testid={`ml-finalist-${index}`}>
                  {song.title} - {song.artist}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
