import { describe, expect, it } from 'vitest'

import { normalizeSongs, parseJsonObject, parseSongsPayload } from '@/lib/musicLeagueParsing'

describe('musicLeagueParsing', () => {
  it('parses a fenced JSON array response', () => {
    const raw = `Sure, here you go:
\n\n\`\`\`json\n[
  {"title": "Midnight City", "artist": "M83", "year": "2011", "reason": "SAFE - synth nostalgia"}
]\n\`\`\``
    const songs = parseSongsPayload(raw)

    expect(songs).toHaveLength(1)
    expect(songs[0].title).toBe('Midnight City')
    expect(songs[0].artist).toBe('M83')
    expect(songs[0].year).toBe(2011)
    expect(songs[0].id).toMatch(/^song-/)
  })

  it('parses an object-wrapped payload with alternate keys', () => {
    const raw = JSON.stringify({
      songs: [
        {
          song: 'Electric Feel',
          artistName: 'MGMT',
          rationale: 'SAFE - hooky and nostalgic',
          genre: 'indie pop',
        },
      ],
    })

    const songs = parseSongsPayload(raw)

    expect(songs).toHaveLength(1)
    expect(songs[0].title).toBe('Electric Feel')
    expect(songs[0].artist).toBe('MGMT')
    expect(songs[0].reason).toBe('SAFE - hooky and nostalgic')
    expect(songs[0].genre).toBe('indie pop')
  })

  it('normalizes missing reasons into a default', () => {
    const songs = normalizeSongs([{ title: 'Track', artist: 'Artist' }])

    expect(songs).toHaveLength(1)
    expect(songs[0].reason).toBe('No reason provided.')
  })

  it('sanitizes curly quotes in JSON objects', () => {
    const raw = '```json\n{“summary”: “Tight focus”, “categories”: {"genres": []}}\n```'
    const parsed = parseJsonObject(raw) as { summary?: string } | null

    expect(parsed?.summary).toBe('Tight focus')
  })
})
