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

  // === NEW: Playlist Sync Methods ===

  // Get tracks currently in a playlist
  async getPlaylistTracks(playlistId: string): Promise<Song[]> {
    if (!this.isConfigured) {
      throw new Error('Spotify not configured')
    }

    const token = await this.getAccessToken()
    const songs: Song[] = []
    let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to get playlist tracks: ${error}`)
      }

      const data = await response.json()
      for (const item of data.items || []) {
        const track = item.track
        if (track) {
          songs.push({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: { name: string }) => a.name).join(', '),
            album: track.album?.name,
            year: track.album?.release_date ? parseInt(track.album.release_date.split('-')[0]) : undefined,
            spotifyTrackId: track.id,
            spotifyUri: track.uri,
            reason: '',
          })
        }
      }

      nextUrl = data.next
    }

    return songs
  }

  // Add tracks to a playlist
  async addTracksToPlaylist(playlistId: string, songs: Song[]): Promise<void> {
    if (!this.isConfigured || songs.length === 0) return

    const token = await this.getAccessToken()

    // Collect URIs
    const uris: string[] = []
    for (const song of songs) {
      let uri = song.spotifyUri
      if (!uri) {
        const result = await this.searchTrack(song)
        uri = result?.uri
      }
      if (uri) {
        uris.push(uri)
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 100))
    }

    if (uris.length === 0) return

    // Add in batches of 100
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100)
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: batch }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to add tracks: ${error}`)
      }
    }
  }

  // Remove tracks from a playlist
  async removeTracksFromPlaylist(playlistId: string, songs: Song[]): Promise<void> {
    if (!this.isConfigured || songs.length === 0) return

    const token = await this.getAccessToken()

    // Collect URIs
    const uris: string[] = []
    for (const song of songs) {
      if (song.spotifyUri) {
        uris.push(song.spotifyUri)
      }
    }

    if (uris.length === 0) return

    // Remove in batches of 100
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100)
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracks: batch.map((uri) => ({ uri })),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to remove tracks: ${error}`)
      }
    }
  }

  // Smart sync: Update playlist to match desired songs
  async syncPlaylistWithSongs(playlistId: string, desiredSongs: Song[]): Promise<{ added: number; removed: number }> {
    if (!this.isConfigured) {
      throw new Error('Spotify not configured')
    }

    // Get current playlist tracks
    const currentTracks = await this.getPlaylistTracks(playlistId)

    // Find songs to add (in desired but not in current)
    const toAdd: Song[] = []
    for (const song of desiredSongs) {
      const exists = currentTracks.some(
        (t) =>
          t.spotifyUri === song.spotifyUri ||
          (t.title.toLowerCase() === song.title.toLowerCase() &&
            t.artist.toLowerCase() === song.artist.toLowerCase())
      )
      if (!exists) {
        toAdd.push(song)
      }
    }

    // Find songs to remove (in current but not in desired)
    const toRemove: Song[] = []
    for (const track of currentTracks) {
      const wanted = desiredSongs.some(
        (s) =>
          s.spotifyUri === track.spotifyUri ||
          (s.title.toLowerCase() === track.title.toLowerCase() &&
            s.artist.toLowerCase() === track.artist.toLowerCase())
      )
      if (!wanted) {
        toRemove.push(track)
      }
    }

    // Perform sync
    if (toRemove.length > 0) {
      await this.removeTracksFromPlaylist(playlistId, toRemove)
    }
    if (toAdd.length > 0) {
      await this.addTracksToPlaylist(playlistId, toAdd)
    }

    console.log(`[Spotify] Sync complete: added ${toAdd.length}, removed ${toRemove.length}`)

    return { added: toAdd.length, removed: toRemove.length }
  }

  // Create or sync a playlist with songs from a specific tier
  async createOrSyncTierPlaylist(
    title: string,
    description: string,
    songs: Song[],
    existingPlaylistId?: string
  ): Promise<{ playlistId: string; playlistUrl: string; added: number; removed: number }> {
    if (existingPlaylistId) {
      // Sync existing playlist
      const result = await this.syncPlaylistWithSongs(existingPlaylistId, songs)
      return {
        playlistId: existingPlaylistId,
        playlistUrl: `https://open.spotify.com/playlist/${existingPlaylistId}`,
        ...result,
      }
    } else {
      // Create new playlist
      const result = await this.createPlaylist(title, description, songs)
      return {
        ...result,
        added: songs.length,
        removed: 0,
      }
    }
  }
}

export const spotifyService = new SpotifyService()
