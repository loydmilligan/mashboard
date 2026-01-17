// Music League Strategist Store - Conversational Design

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MusicLeaguePhase,
  MusicLeagueSession,
  MusicLeagueUserProfile,
  PreferenceEvidence,
  Song,
  ThemeContext,
  RejectedSong,
  SessionPreference,
  LongTermPreference,
} from '@/types/musicLeague'
import { MUSIC_LEAGUE_PROMPTS } from '@/types/musicLeague'
import { STORAGE_KEYS } from '@/lib/constants'

function generateId(): string {
  return `ml-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateSongId(): string {
  return `song-${Math.random().toString(36).slice(2, 11)}`
}

interface MusicLeagueState {
  // State
  sessions: MusicLeagueSession[]
  activeSessionId: string | null
  strategistModel: string | null
  isProcessing: boolean
  error: string | null
  userProfile: MusicLeagueUserProfile | null

  // Getters
  activeSession: () => MusicLeagueSession | undefined

  // Session Management
  createSession: () => string
  resumeSession: (id: string) => void
  deleteSession: (id: string) => void
  clearAllSessions: () => void

  // Phase Management
  setPhase: (phase: MusicLeaguePhase) => void

  // Theme Management
  setTheme: (theme: ThemeContext) => void

  // Candidate Management (5-8 songs)
  setCandidates: (songs: Song[]) => void
  updateCandidate: (songId: string, updates: Partial<Song>) => void
  toggleFavorite: (songId: string) => void

  // Finalists Management
  setFinalists: (songs: Song[]) => void
  addToFinalists: (song: Song) => void
  removeFromFinalists: (songId: string) => void

  // Conversation History
  addToConversation: (role: 'user' | 'assistant' | 'system', content: string) => void
  clearConversation: () => void
  addPreferenceEvidence: (role: PreferenceEvidence['role'], content: string) => void

  // Playlist Creation
  setPlaylistCreated: (platform: 'youtube' | 'spotify', playlistId: string, playlistUrl: string) => void

  // Iteration tracking
  incrementIteration: () => void

  // Rejected Songs Management
  addRejectedSong: (song: RejectedSong) => void
  addRejectedSongs: (songs: RejectedSong[]) => void
  isRejected: (title: string, artist: string) => boolean

  // Session Preferences Management
  addSessionPreference: (pref: SessionPreference) => void
  addSessionPreferences: (prefs: SessionPreference[]) => void
  clearSessionPreferences: () => void

  // Long-Term Preferences Management
  addLongTermPreferences: (prefs: LongTermPreference[]) => void
  removeLongTermPreference: (statement: string) => void

  // Final Pick
  setFinalPick: (song: Song) => void

  // Utility
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  setUserProfile: (profile: MusicLeagueUserProfile | null) => void
  setStrategistModel: (model: string | null) => void
}

export const useMusicLeagueStore = create<MusicLeagueState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      strategistModel: null,
      isProcessing: false,
      error: null,
      userProfile: null,

      activeSession: () => {
        const state = get()
        return state.sessions.find((s) => s.id === state.activeSessionId)
      },

      createSession: () => {
        const id = generateId()
        const session: MusicLeagueSession = {
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          phase: 'conversation',
          theme: null,
          candidates: [],
          finalists: [],
          rejectedSongs: [],
          sessionPreferences: [],
          conversationHistory: [],
          preferenceEvidence: [],
          iterationCount: 0,
        }

        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
          error: null,
        }))

        return id
      },

      resumeSession: (id) => {
        set({ activeSessionId: id, error: null })
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id)
          const newActiveId =
            state.activeSessionId === id
              ? newSessions[0]?.id || null
              : state.activeSessionId

          return {
            sessions: newSessions,
            activeSessionId: newActiveId,
          }
        })
      },

      clearAllSessions: () => {
        set({
          sessions: [],
          activeSessionId: null,
          error: null,
        })
      },

      setPhase: (phase) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, phase, updatedAt: Date.now() }
              : s
          ),
        }))
      },

      setTheme: (theme) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, theme, updatedAt: Date.now() }
              : s
          ),
        }))
      },

      setCandidates: (songs) => {
        // Assign IDs to songs that don't have them
        const songsWithIds = songs.map((song) => ({
          ...song,
          id: song.id || generateSongId(),
        }))

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, candidates: songsWithIds, updatedAt: Date.now() }
              : s
          ),
        }))
      },

      updateCandidate: (songId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s
            return {
              ...s,
              candidates: s.candidates.map((song) =>
                song.id === songId ? { ...song, ...updates } : song
              ),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      toggleFavorite: (songId) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s
            return {
              ...s,
              candidates: s.candidates.map((song) =>
                song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
              ),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      setFinalists: (songs) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, finalists: songs, phase: 'finalists', updatedAt: Date.now() }
              : s
          ),
        }))
      },

      addToFinalists: (song) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s
            if (s.finalists.some((f) => f.id === song.id)) return s
            return {
              ...s,
              finalists: [...s.finalists, song],
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      removeFromFinalists: (songId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  finalists: s.finalists.filter((song) => song.id !== songId),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      addToConversation: (role, content) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  conversationHistory: [
                    ...s.conversationHistory,
                    { role, content, timestamp: Date.now() },
                  ],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      clearConversation: () => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, conversationHistory: [], updatedAt: Date.now() }
              : s
          ),
        }))
      },

      addPreferenceEvidence: (role, content) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  preferenceEvidence: [
                    ...(s.preferenceEvidence ?? []),
                    { role, content, timestamp: Date.now() },
                  ],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      setPlaylistCreated: (platform, playlistId, playlistUrl) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  playlistCreated: {
                    platform,
                    playlistId,
                    playlistUrl,
                    createdAt: Date.now(),
                  },
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      incrementIteration: () => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, iterationCount: s.iterationCount + 1, updatedAt: Date.now() }
              : s
          ),
        }))
      },

      // Rejected Songs Management
      addRejectedSong: (song: RejectedSong) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  rejectedSongs: [...(s.rejectedSongs || []), song],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      addRejectedSongs: (songs: RejectedSong[]) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  rejectedSongs: [...(s.rejectedSongs || []), ...songs],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      isRejected: (title: string, artist: string) => {
        const session = get().activeSession()
        if (!session?.rejectedSongs) return false
        const normalizedTitle = title.toLowerCase().trim()
        const normalizedArtist = artist.toLowerCase().trim()
        return session.rejectedSongs.some(
          (r) =>
            r.title.toLowerCase().trim() === normalizedTitle &&
            r.artist.toLowerCase().trim() === normalizedArtist
        )
      },

      // Session Preferences Management
      addSessionPreference: (pref: SessionPreference) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  sessionPreferences: [...(s.sessionPreferences || []), pref],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      addSessionPreferences: (prefs: SessionPreference[]) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? {
                  ...s,
                  sessionPreferences: [...(s.sessionPreferences || []), ...prefs],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }))
      },

      clearSessionPreferences: () => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, sessionPreferences: [], updatedAt: Date.now() }
              : s
          ),
        }))
      },

      // Long-Term Preferences Management
      addLongTermPreferences: (prefs: LongTermPreference[]) => {
        set((state) => {
          if (!state.userProfile) {
            // Initialize user profile if it doesn't exist
            return {
              userProfile: {
                summary: 'Preference profile being built',
                categories: {
                  genres: [],
                  eras: [],
                  moods: [],
                  instrumentation: [],
                  vocals: [],
                  lyrics: [],
                  riskAppetite: [],
                  nostalgia: [],
                  dislikes: [],
                  misc: [],
                },
                longTermPreferences: prefs,
                evidenceCount: prefs.length,
                weight: 0.5,
                updatedAt: Date.now(),
              },
            }
          }

          // Add to existing profile, avoiding duplicates
          const existingStatements = new Set(
            (state.userProfile.longTermPreferences || []).map((p) =>
              p.statement.toLowerCase()
            )
          )
          const newPrefs = prefs.filter(
            (p) => !existingStatements.has(p.statement.toLowerCase())
          )

          return {
            userProfile: {
              ...state.userProfile,
              longTermPreferences: [
                ...(state.userProfile.longTermPreferences || []),
                ...newPrefs,
              ],
              evidenceCount: state.userProfile.evidenceCount + newPrefs.length,
              updatedAt: Date.now(),
            },
          }
        })
      },

      removeLongTermPreference: (statement: string) => {
        set((state) => {
          if (!state.userProfile) return state
          return {
            userProfile: {
              ...state.userProfile,
              longTermPreferences: (
                state.userProfile.longTermPreferences || []
              ).filter((p) => p.statement !== statement),
              updatedAt: Date.now(),
            },
          }
        })
      },

      // Final Pick
      setFinalPick: (song: Song) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId
              ? { ...s, finalPick: song, phase: 'complete', updatedAt: Date.now() }
              : s
          ),
        }))
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing })
      },

      setError: (error) => {
        set({ error })
      },

      setUserProfile: (profile) => {
        set({ userProfile: profile })
      },

      setStrategistModel: (model) => {
        set({ strategistModel: model })
      },
    }),
    {
      name: STORAGE_KEYS.MUSIC_LEAGUE || 'mashb0ard-music-league',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        userProfile: state.userProfile,
        strategistModel: state.strategistModel,
      }),
    }
  )
)

// Helper: Format candidate list for AI context
export function formatCandidatesForPrompt(candidates: Song[]): string {
  if (candidates.length === 0) return 'No candidates yet.'
  return candidates
    .map((song, i) => {
      const favorite = song.isFavorite ? ' ⭐' : ''
      const year = song.year ? ` (${song.year})` : ''
      const genre = song.genre ? ` [${song.genre}]` : ''
      return `${i + 1}. "${song.title}" by ${song.artist}${year}${genre}${favorite}\n   Reason: ${song.reason}\n   Question: ${song.question || 'N/A'}`
    })
    .join('\n\n')
}

// Helper: Format rejected songs for AI context
export function formatRejectedSongsForPrompt(rejectedSongs: RejectedSong[]): string {
  if (!rejectedSongs || rejectedSongs.length === 0) return 'None'
  return rejectedSongs
    .map((r) => `- "${r.title}" by ${r.artist} (Reason: ${r.reason})`)
    .join('\n')
}

// Helper: Format session preferences for AI context
export function formatSessionPreferencesForPrompt(prefs: SessionPreference[]): string {
  if (!prefs || prefs.length === 0) return 'None learned yet'
  return prefs
    .map((p) => `- [${p.confidence}] ${p.statement}`)
    .join('\n')
}

// Helper: Format long-term preferences for AI context
export function formatLongTermPreferencesForPrompt(prefs: LongTermPreference[]): string {
  if (!prefs || prefs.length === 0) return 'None'
  // Sort by specificity (general first) then by weight
  const sorted = [...prefs].sort((a, b) => {
    if (a.specificity !== b.specificity) {
      return a.specificity === 'general' ? -1 : 1
    }
    return b.weight - a.weight
  })
  return sorted
    .map((p) => `- [${p.specificity}, ${Math.round(p.weight * 100)}%] ${p.statement}`)
    .join('\n')
}

// Helper: Format finalists for AI context
export function formatFinalistsForPrompt(finalists: Song[]): string {
  if (finalists.length === 0) return 'No finalists selected.'
  return finalists
    .map((song, i) => `${i + 1}. [${song.id}] "${song.title}" by ${song.artist} - ${song.reason}`)
    .join('\n')
}

// Get system prompt for conversation mode
export function getConversationPrompt(
  session: MusicLeagueSession,
  userProfile: MusicLeagueUserProfile | null
): string {
  let prompt = MUSIC_LEAGUE_PROMPTS.conversation_system

  // Add current context
  const contextParts: string[] = []

  if (session.theme) {
    contextParts.push(`=== CURRENT THEME ===\n${session.theme.rawTheme}`)
    if (session.theme.interpretation) {
      contextParts.push(`Interpretation: ${session.theme.interpretation}`)
    }
  }

  if (session.candidates.length > 0) {
    contextParts.push(`\n=== CURRENT CANDIDATES (${session.candidates.length}) ===\n${formatCandidatesForPrompt(session.candidates)}`)
  }

  // Add rejected songs (CRITICAL: AI must not re-propose these)
  if (session.rejectedSongs && session.rejectedSongs.length > 0) {
    contextParts.push(`\n=== REJECTED SONGS (DO NOT RE-PROPOSE) ===\n${formatRejectedSongsForPrompt(session.rejectedSongs)}`)
  }

  // Add session preferences (learned this session)
  if (session.sessionPreferences && session.sessionPreferences.length > 0) {
    contextParts.push(`\n=== SESSION PREFERENCES (from this conversation) ===\n${formatSessionPreferencesForPrompt(session.sessionPreferences)}`)
  }

  // Add long-term preferences from user profile
  if (userProfile?.longTermPreferences && userProfile.longTermPreferences.length > 0) {
    contextParts.push(`\n=== LONG-TERM PREFERENCES (general preferences, prioritize these) ===\n${formatLongTermPreferencesForPrompt(userProfile.longTermPreferences)}`)
  }

  if (session.playlistCreated) {
    contextParts.push(`\n=== PLAYLIST CREATED ===\nPlatform: ${session.playlistCreated.platform}\nURL: ${session.playlistCreated.playlistUrl}\nNOTE: Assume the player has listened to these songs. Ask follow-up questions about what they heard.`)
  }

  if (userProfile) {
    const profileStr = [
      `\n=== PLAYER PROFILE (${Math.round(userProfile.weight * 100)}% confidence) ===`,
      `Summary: ${userProfile.summary}`,
      `Genres: ${userProfile.categories.genres.join(', ') || '—'}`,
      `Eras: ${userProfile.categories.eras.join(', ') || '—'}`,
      `Moods: ${userProfile.categories.moods.join(', ') || '—'}`,
      `Risk Appetite: ${userProfile.categories.riskAppetite.join(', ') || '—'}`,
      `Dislikes: ${userProfile.categories.dislikes.join(', ') || '—'}`,
    ].join('\n')
    contextParts.push(profileStr)
  }

  if (contextParts.length > 0) {
    prompt += '\n\n' + contextParts.join('\n')
  }

  return prompt
}

// Get system prompt for finalists mode
export function getFinalistsPrompt(session: MusicLeagueSession): string {
  return MUSIC_LEAGUE_PROMPTS.finalists_system.replace(
    '{finalistsList}',
    formatFinalistsForPrompt(session.finalists)
  )
}

// Get system prompt for long-term preference extraction
export function getLongTermPreferencePrompt(
  sessionPreferences: SessionPreference[],
  existingPreferences: LongTermPreference[]
): string {
  return MUSIC_LEAGUE_PROMPTS.longterm_preference_extraction
    .replace('{sessionPreferences}', formatSessionPreferencesForPrompt(sessionPreferences))
    .replace('{existingPreferences}', formatLongTermPreferencesForPrompt(existingPreferences))
}
