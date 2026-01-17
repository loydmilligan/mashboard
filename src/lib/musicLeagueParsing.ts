import type { Song } from '@/types/musicLeague'

function generateSongId(): string {
  return `song-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Attempts multiple JSON repair strategies in order:
 * 1. Try raw parse
 * 2. Strip markdown fences
 * 3. Fix smart quotes
 * 4. Fix trailing commas
 * 5. Quote unquoted string values
 * 6. Handle newlines in strings
 */
function tryRepairAndParse(raw: string): unknown | null {
  const strategies: Array<(input: string) => string> = [
    // 1. Identity - try as-is
    (s) => s,
    // 2. Strip markdown
    (s) => s.replace(/```json\s*/gi, '').replace(/```\s*/g, ''),
    // 3. Fix smart quotes
    (s) => s.replace(/[""]/g, '"').replace(/['']/g, "'"),
    // 4. Fix trailing commas
    (s) => s.replace(/,\s*([}\]])/g, '$1'),
    // 5. Escape unescaped newlines inside strings
    (s) => s.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match) => {
      return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    }),
  ]

  let current = raw.trim()
  for (const strategy of strategies) {
    current = strategy(current)
    try {
      return JSON.parse(current)
    } catch {
      // Try next strategy
    }
  }

  return null
}

function extractFirstJsonSpan(raw: string, open: string, close: string): string | null {
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === open) {
      if (depth === 0) {
        start = i
      }
      depth += 1
      continue
    }

    if (ch === close && depth > 0) {
      depth -= 1
      if (depth === 0 && start >= 0) {
        return raw.slice(start, i + 1)
      }
    }
  }

  return null
}

export function extractJsonArray(raw: string): string | null {
  return extractFirstJsonSpan(raw, '[', ']')
}

export function extractJsonObject(raw: string): string | null {
  return extractFirstJsonSpan(raw, '{', '}')
}

function quoteUnquotedStringValues(raw: string): string {
  return raw.replace(/:\s*([^\s"\[{0-9\-tfn][^,\}\]]*)/g, (match, value) => {
    const trimmed = String(value).trim()
    if (!trimmed) return match
    const lower = trimmed.toLowerCase()
    if (lower === 'true' || lower === 'false' || lower === 'null') {
      return `: ${trimmed}`
    }
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return `: ${trimmed}`
    }
    const escaped = trimmed.replace(/"/g, '\\"')
    return `: "${escaped}"`
  })
}

export function sanitizeJsonPayload(raw: string): string {
  return quoteUnquotedStringValues(
    raw
      .replace(/```json/gi, '```')
      .replace(/```/g, '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,\s*([}\]])/g, '$1')
      .trim()
  )
}

export function parseJsonObject(raw: string): unknown | null {
  // Strategy 1: Extract and sanitize
  const extracted = extractJsonObject(raw)
  if (extracted) {
    const sanitized = sanitizeJsonPayload(extracted)
    try {
      return JSON.parse(sanitized)
    } catch {
      // Try repair strategies on extracted
      const repaired = tryRepairAndParse(sanitized)
      if (repaired !== null) return repaired
    }
  }

  // Strategy 2: Try repair on raw input
  const repaired = tryRepairAndParse(raw)
  if (repaired !== null && typeof repaired === 'object' && !Array.isArray(repaired)) {
    return repaired
  }

  return null
}

export function parseJsonArray(raw: string): unknown[] {
  // Strategy 1: Extract and sanitize
  const extracted = extractJsonArray(raw)
  if (extracted) {
    const sanitized = sanitizeJsonPayload(extracted)
    try {
      const parsed = JSON.parse(sanitized)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // Try repair strategies on extracted
      const repaired = tryRepairAndParse(sanitized)
      if (Array.isArray(repaired)) return repaired
    }
  }

  // Strategy 2: Try repair on raw input
  const repaired = tryRepairAndParse(raw)
  if (Array.isArray(repaired)) return repaired

  // Strategy 3: Look for array-like patterns and try to parse line by line
  const lines = raw.split('\n').filter(line => line.includes('"title"') || line.includes('"artist"'))
  if (lines.length > 0) {
    // Try to wrap lines as array items
    const wrapped = `[${lines.map(l => {
      const objMatch = extractJsonObject(l)
      return objMatch || ''
    }).filter(Boolean).join(',')}]`
    try {
      const parsed = JSON.parse(wrapped)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // Fall through
    }
  }

  return []
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

export function normalizeSongs(raw: unknown): Song[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as Record<string, unknown>
      const title = pickString(record, ['title', 'song', 'track'])
      const artist = pickString(record, ['artist', 'artistName', 'band'])
      const reason = pickString(record, ['reason', 'rationale', 'why', 'notes'])
      if (!title || !artist) return null

      const year = typeof record.year === 'number' ? record.year : Number(record.year)
      const song: Song = {
        id: generateSongId(),
        title,
        artist,
        reason: reason || 'No reason provided.',
      }

      if (typeof record.album === 'string' && record.album.trim()) {
        song.album = record.album
      }
      if (Number.isFinite(year) && year > 0) {
        song.year = year
      }
      if (typeof record.genre === 'string' && record.genre.trim()) {
        song.genre = record.genre
      }
      if (typeof record.youtubeUrl === 'string' && record.youtubeUrl.trim()) {
        song.youtubeUrl = record.youtubeUrl
      }
      if (typeof record.spotifyUri === 'string' && record.spotifyUri.trim()) {
        song.spotifyUri = record.spotifyUri
      }

      return song
    })
    .filter((song): song is Song => song !== null)
}

export function parseSongsPayload(raw: string): Song[] {
  const fromArray = normalizeSongs(parseJsonArray(raw))
  if (fromArray.length > 0) return fromArray

  const parsed = parseJsonObject(raw)
  if (!parsed || typeof parsed !== 'object') return []

  const record = parsed as Record<string, unknown>
  if (Array.isArray(record.songs)) {
    return normalizeSongs(record.songs)
  }
  if (Array.isArray(record.tracks)) {
    return normalizeSongs(record.tracks)
  }

  return []
}
