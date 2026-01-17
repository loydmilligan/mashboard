// Spotify API Service for playlist creation and track ID lookup
import { useSettingsStore } from '@/stores/settingsStore'
import type { Song } from '@/types/musicLeague'

interface SpotifySearchResult {
  trackId: string
  name: string
  artists: string[]
  uri: string
}

interface SpotifyAccessToken {
  access_token: string
  expires_in: number
  token_type: string
}

class SpotifyService {
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private userId: string | null = null

  private get config() {
    return useSettingsStore.getState().spotify
  }

  private get isConfigured(): boolean {
    const { clientId, clientSecret, refreshToken } = this.config
    return Boolean(clientId && clientSecret && refreshToken)
  }

  // Refresh the access token using the refresh token
  private async refreshAccessToken(): Promise<string> {
    const { clientId, clientSecret, refreshToken } = this.config

    console.log('[Spotify] Refreshing token with config:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
      refreshTokenPrefix: refreshToken?.substring(0, 10) + '...',
    })

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Spotify not configured. Add credentials in Settings.')
    }

    const basicAuth = btoa(`${clientId}:${clientSecret}`)

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Spotify] Token refresh failed:', error)
      throw new Error(`Failed to refresh Spotify token: ${error}`)
    }

    const data: SpotifyAccessToken = await response.json()
    console.log('[Spotify] Token refreshed successfully')
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // 60s buffer
    return this.accessToken
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }
    return this.refreshAccessToken()
  }

  // Get the current user's ID
  private async getUserId(): Promise<string> {
    if (this.userId) return this.userId

    console.log('[Spotify] Fetching user ID...')
    const token = await this.getAccessToken()
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Spotify] Get user failed:', response.status, errorText)
      throw new Error(`Failed to get Spotify user: ${errorText}`)
    }

    const data = await response.json()
    this.userId = data.id as string
    console.log('[Spotify] Got user ID:', this.userId)
    return this.userId!
  }

  // Search for a track and get its ID
  async searchTrack(song: Song): Promise<SpotifySearchResult | null> {
    const query = `track:${song.title} artist:${song.artist}`

    const token = await this.getAccessToken()
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '1',
    })

    const response = await fetch(
      `https://api.spotify.com/v1/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Spotify search failed:', await response.text())
      return null
    }

    const data = await response.json()
    const track = data.tracks?.items?.[0]

    if (!track) return null

    return {
      trackId: track.id,
      name: track.name,
      artists: track.artists.map((a: { name: string }) => a.name),
      uri: track.uri,
    }
  }

  // Search for track IDs for all songs
  async enrichSongsWithTrackIds(songs: Song[]): Promise<Song[]> {
    if (!this.isConfigured) {
      // If not configured, just return songs as-is
      return songs
    }

    const enrichedSongs: Song[] = []

    for (const song of songs) {
      try {
        const result = await this.searchTrack(song)
        if (result) {
          enrichedSongs.push({
            ...song,
            spotifyTrackId: result.trackId,
            spotifyUri: result.uri,
          })
        } else {
          enrichedSongs.push(song)
        }
      } catch (error) {
        console.error(`Failed to search for ${song.title}:`, error)
        enrichedSongs.push(song)
      }
      // Rate limit - 100ms between requests
      await new Promise((r) => setTimeout(r, 100))
    }

    return enrichedSongs
  }

  // Create a playlist with the given songs
  async createPlaylist(
    title: string,
    description: string,
    songs: Song[]
  ): Promise<{ playlistId: string; playlistUrl: string }> {
    if (!this.isConfigured) {
      throw new Error('Spotify not configured. Add credentials in Settings.')
    }

    const token = await this.getAccessToken()
    const userId = await this.getUserId()

    // Sanitize inputs - remove newlines and special characters
    // For title: take only first line, remove special chars, limit to 100 chars
    const sanitizedTitle = title
      .split('\n')[0]  // Take only first line
      .replace(/[^\w\s\-:]/g, '')
      .trim()
      .substring(0, 100)
    // For description: replace newlines with spaces, limit to 300 chars
    const sanitizedDescription = description
      .replace(/\n+/g, ' ')  // Replace newlines with spaces
      .replace(/\s+/g, ' ')  // Collapse multiple spaces
      .trim()
      .substring(0, 300)

    console.log('[Spotify] Creating playlist for user:', userId)
    console.log('[Spotify] Playlist name:', sanitizedTitle)
    console.log('[Spotify] Playlist description:', sanitizedDescription)

    const requestBody = {
      name: sanitizedTitle || 'Music League Playlist',
      description: sanitizedDescription,
      public: false,
    }
    console.log('[Spotify] Request body:', JSON.stringify(requestBody))

    // Create the playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('[Spotify] Create playlist failed:', createResponse.status, errorText)
      throw new Error(`Failed to create playlist: ${errorText}`)
    }

    const playlist = await createResponse.json()
    const playlistId = playlist.id

    // Collect track URIs
    const trackUris: string[] = []

    for (const song of songs) {
      let uri = song.spotifyUri

      // If no URI, search for it
      if (!uri) {
        const result = await this.searchTrack(song)
        uri = result?.uri
      }

      if (uri) {
        trackUris.push(uri)
      } else {
        console.warn(`Skipping ${song.title} - no track found`)
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 100))
    }

    // Add tracks to the playlist (batch of up to 100)
    if (trackUris.length > 0) {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      })
    }

    return {
      playlistId,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
    }
  }

  // Check if the service is configured
  checkConfiguration(): { configured: boolean; error?: string } {
    const { clientId, clientSecret, refreshToken } = this.config

    if (!clientId) return { configured: false, error: 'Missing Spotify Client ID' }
    if (!clientSecret) return { configured: false, error: 'Missing Spotify Client Secret' }
    if (!refreshToken) return { configured: false, error: 'Missing Spotify Refresh Token' }

    return { configured: true }
  }
}

export const spotifyService = new SpotifyService()
