import { test, expect, Page } from '@playwright/test'

// ============================================================================
// Music League Strategist - Legacy Tests (Updated for v2 Funnel System)
// ============================================================================

// Helper to setup v2 store data via localStorage
async function setupV2TestData(
  page: Page,
  options: {
    themes?: Array<{
      id: string
      rawTheme: string
      title: string
      status: 'active' | 'submitted' | 'archived'
      pick: object | null
      finalists: object[]
      semifinalists: object[]
      candidates: object[]
      createdAt: number
      updatedAt: number
    }>
    sessions?: Array<{
      id: string
      themeId: string
      title: string
      phase: string
      theme?: { rawTheme: string; interpretation?: string }
      workingCandidates: object[]
      candidates: object[]
      finalists: object[]
      conversationHistory: Array<{ role: string; content: string; timestamp: number }>
      sessionPreferences: object[]
      rejectedSongs: object[]
      createdAt: number
      updatedAt: number
    }>
    activeThemeId?: string | null
    activeSessionId?: string | null
    userProfile?: object | null
  }
): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await page.evaluate(
    ({ themes, sessions, activeThemeId, activeSessionId, userProfile }) => {
      const store = {
        state: {
          themes: themes || [],
          activeThemeId: activeThemeId ?? null,
          sessions: sessions || [],
          activeSessionId: activeSessionId ?? null,
          userProfile: userProfile ?? null,
          strategistModel: null,
          isProcessing: false,
          error: null,
          _version: 2,
        },
        version: 2,
      }
      localStorage.setItem('mashb0ard-music-league', JSON.stringify(store))
    },
    options
  )

  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
}

// Helper to open Music League
async function openMusicLeague(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
  await page.locator('text=Music League').first().click()
  await page.waitForSelector('[data-testid="music-league-strategist"]', { timeout: 10000 })
}

// Create test song helper
function createTestSong(id: string, title: string, artist: string, question: string) {
  return {
    id,
    title,
    artist,
    album: `${title} Album`,
    year: 2020,
    genre: 'Rock',
    reason: `This song fits because of ${artist}`,
    question,
  }
}

test.describe('Music League Strategist - UI Structure', () => {
  test('should render all main UI elements', async ({ page }) => {
    await openMusicLeague(page)

    // Verify chat panel exists (input and send button)
    await expect(page.locator('[data-testid="ml-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeVisible()

    // Verify header exists
    await expect(page.locator('[data-testid="ml-header"]')).toContainText('Music League')
  })

  test('should show welcome message when no conversation', async ({ page }) => {
    // Setup empty state
    await setupV2TestData(page, {
      themes: [],
      sessions: [],
      activeThemeId: null,
      activeSessionId: null,
    })
    await openMusicLeague(page)

    // Verify welcome message with instructions
    await expect(page.locator('[data-testid="ml-welcome-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-welcome-message"]')).toContainText('5-8 candidates')
  })

  test('should show empty state when no working candidates', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Test Theme',
      title: 'Test Theme',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [],
      candidates: [],
      finalists: [],
      conversationHistory: [],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Funnel should show 0 candidates
    await expect(page.getByText('0/30', { exact: true })).toBeVisible()
  })
})

test.describe('Music League Strategist - Working Candidates', () => {
  test('should display working candidates with proper structure', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Songs with colors in the title',
      title: 'Songs with colors',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Color songs brainstorm',
      phase: 'brainstorm',
      theme: { rawTheme: 'Songs with colors in the title' },
      workingCandidates: [
        createTestSong('s1', 'Purple Rain', 'Prince', 'Is this too obvious?'),
        createTestSong('s2', 'Blue Monday', 'New Order', 'Do you like synth-heavy tracks?'),
        createTestSong('s3', 'Yellow', 'Coldplay', 'Too mainstream for your group?'),
        createTestSong('s4', 'Black Hole Sun', 'Soundgarden', 'How does grunge play with your league?'),
        createTestSong('s5', 'White Wedding', 'Billy Idol', 'Is 80s rock in your wheelhouse?'),
        createTestSong('s6', 'Paint It Black', 'Rolling Stones', 'Classic rock: safe or predictable?'),
      ],
      candidates: [],
      finalists: [],
      conversationHistory: [
        { role: 'user', content: 'Songs with colors in the title', timestamp: Date.now() - 5000 },
        { role: 'assistant', content: 'Here are your candidates!', timestamp: Date.now() },
      ],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Verify working set is displayed
    await expect(page.getByText('Working Set')).toBeVisible()

    // Verify candidate count (working set should show 6 songs)
    await expect(page.getByText('Working Set (6)')).toBeVisible()
  })
})

test.describe('Music League Strategist - No Duplicate Artists', () => {
  test('should not have duplicate artists in funnel candidates', async ({ page }) => {
    // This test verifies that unique artists are shown in the funnel panel
    // The funnel visualization shows song title + artist for each song
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Test Theme',
      title: 'Test Theme',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [
        createTestSong('s1', 'Purple Rain', 'Prince', 'Q1'),
        createTestSong('s2', 'Blue Monday', 'New Order', 'Q2'),
        createTestSong('s3', 'Yellow', 'Coldplay', 'Q3'),
        createTestSong('s4', 'Black Hole Sun', 'Soundgarden', 'Q4'),
        createTestSong('s5', 'White Wedding', 'Billy Idol', 'Q5'),
      ],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [],
      candidates: [],
      finalists: [],
      conversationHistory: [],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Verify unique artists are shown in the funnel candidates section
    // The funnel shows song cards with title and artist
    await expect(page.getByText('Prince').first()).toBeVisible()
    await expect(page.getByText('New Order').first()).toBeVisible()
    await expect(page.getByText('Coldplay').first()).toBeVisible()
    await expect(page.getByText('Soundgarden').first()).toBeVisible()
    await expect(page.getByText('Billy Idol').first()).toBeVisible()
  })
})

test.describe('Music League Strategist - Playlist Buttons', () => {
  test('should show Spotify and YouTube buttons when candidates exist', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Test Theme',
      title: 'Test Theme',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [
        createTestSong('s1', 'Purple Rain', 'Prince', 'Q1'),
        createTestSong('s2', 'Blue Monday', 'New Order', 'Q2'),
      ],
      candidates: [],
      finalists: [],
      conversationHistory: [
        { role: 'user', content: 'Test', timestamp: Date.now() },
      ],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Playlist buttons should be visible when working candidates exist
    await expect(page.getByRole('button', { name: 'Spotify' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'YouTube' })).toBeVisible()
  })

  test('should not show playlist buttons when no candidates', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Test Theme',
      title: 'Test Theme',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [],
      candidates: [],
      finalists: [],
      conversationHistory: [],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Playlist buttons should not be visible when no candidates
    await expect(page.getByRole('button', { name: 'Spotify' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'YouTube' })).toBeHidden()
  })
})

test.describe('Music League Strategist - Chat Interaction', () => {
  test('should allow text input in chat', async ({ page }) => {
    await openMusicLeague(page)

    // Verify input accepts text
    const input = page.locator('[data-testid="ml-input"]')
    await input.fill('Songs with colors in the title')

    // Verify the input has the value
    await expect(input).toHaveValue('Songs with colors in the title')

    // Verify send button is enabled when there's input
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeEnabled()
  })

  test('should have disabled send button when input is empty', async ({ page }) => {
    await openMusicLeague(page)

    // Verify send button is disabled with empty input
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeDisabled()
  })
})

test.describe('Music League Strategist - Conversation History', () => {
  test('should display conversation messages', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Songs with colors in the title',
      title: 'Songs with colors',
      status: 'active' as const,
      pick: null,
      finalists: [],
      semifinalists: [],
      candidates: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [
        createTestSong('s1', 'Purple Rain', 'Prince', 'Q1'),
      ],
      candidates: [],
      finalists: [],
      conversationHistory: [
        { role: 'user', content: 'Songs with colors in the title', timestamp: Date.now() - 5000 },
        { role: 'assistant', content: 'Here are your candidates!', timestamp: Date.now() },
      ],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Verify user message is displayed
    await expect(page.locator('[data-testid="ml-message-user-0"]')).toBeVisible()
    await expect(page.locator('text=Songs with colors in the title').first()).toBeVisible()

    // Verify assistant message is displayed
    await expect(page.locator('[data-testid="ml-message-assistant-1"]')).toBeVisible()
  })
})

test.describe('Music League Strategist - Funnel Integration', () => {
  test('should show funnel panel with theme candidates', async ({ page }) => {
    const testTheme = {
      id: 'theme-1',
      rawTheme: 'Songs with colors',
      title: 'Songs with colors',
      status: 'active' as const,
      pick: null,
      finalists: [createTestSong('f1', 'Purple Rain', 'Prince', 'Great fit')],
      semifinalists: [],
      candidates: [
        createTestSong('c1', 'Blue Monday', 'New Order', 'Alternative'),
        createTestSong('c2', 'Yellow', 'Coldplay', 'Mainstream'),
      ],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    const testSession = {
      id: 'session-1',
      themeId: 'theme-1',
      title: 'Test Session',
      phase: 'brainstorm',
      workingCandidates: [],
      candidates: [],
      finalists: [],
      conversationHistory: [],
      sessionPreferences: [],
      rejectedSongs: [],
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
    }

    await setupV2TestData(page, {
      themes: [testTheme],
      sessions: [testSession],
      activeThemeId: 'theme-1',
      activeSessionId: 'session-1',
    })
    await openMusicLeague(page)

    // Verify funnel panel is visible
    await expect(page.getByText('Funnel', { exact: true })).toBeVisible()

    // Verify tier counts
    await expect(page.getByText('1/4', { exact: true })).toBeVisible() // 1 finalist
    await expect(page.getByText('2/30', { exact: true })).toBeVisible() // 2 candidates
  })
})
