import { test, expect, Page } from '@playwright/test'

// Helper to open Music League
async function openMusicLeague(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000) // Give the app time to render

  // Click on Music League in the sidebar
  await page.locator('text=Music League').first().click()

  // Wait for the strategist to load
  await page.waitForSelector('[data-testid="music-league-strategist"]', { timeout: 10000 })
}

// Helper to set up test data via localStorage after navigation
async function setupTestData(page: Page, candidates: Array<{title: string, artist: string, question: string}>) {
  // First navigate to the page
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  // Now we can access localStorage
  await page.evaluate((testCandidates) => {
    const sessionId = `ml-test-${Date.now()}`
    const session = {
      id: sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      phase: 'conversation',
      theme: { rawTheme: 'Test Theme: Songs with colors in the title' },
      candidates: testCandidates.map((c, i) => ({
        id: `song-${i}`,
        title: c.title,
        artist: c.artist,
        reason: `Test reason for ${c.title}`,
        question: c.question,
      })),
      finalists: [],
      conversationHistory: [
        { role: 'user', content: 'Test Theme: Songs with colors in the title', timestamp: Date.now() - 1000 },
        { role: 'assistant', content: 'Here are your candidates!', timestamp: Date.now() },
      ],
      preferenceEvidence: [],
      iterationCount: 1,
    }

    const store = {
      state: {
        sessions: [session],
        activeSessionId: sessionId,
        userProfile: null,
        strategistModel: null,
      },
      version: 0,
    }

    localStorage.setItem('mashb0ard-music-league', JSON.stringify(store))
  }, candidates)

  // Reload to pick up the localStorage data
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)

  // Click on Music League
  await page.locator('text=Music League').first().click()
  await page.waitForSelector('[data-testid="music-league-strategist"]', { timeout: 10000 })
}

test.describe('Music League Strategist - UI Structure', () => {
  test('should render all main UI elements', async ({ page }) => {
    await openMusicLeague(page)

    // Feature 2: Chat-only interaction - verify chat panel exists
    await expect(page.locator('[data-testid="ml-chat-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeVisible()

    // Verify candidates panel exists
    await expect(page.locator('[data-testid="ml-candidates-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-candidates-count"]')).toBeVisible()

    // Verify header
    await expect(page.locator('[data-testid="ml-header"]')).toContainText('Music League Strategist')
    await expect(page.locator('[data-testid="ml-mode"]')).toContainText('Conversation Mode')

    // Verify new session button
    await expect(page.locator('[data-testid="ml-new-session"]')).toBeVisible()
  })

  test('should show welcome message when no conversation', async ({ page }) => {
    await openMusicLeague(page)

    // Click new session to ensure clean state
    await page.locator('[data-testid="ml-new-session"]').click()
    await page.waitForTimeout(500)

    // Verify welcome message with instructions
    await expect(page.locator('[data-testid="ml-welcome-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-welcome-message"]')).toContainText('5-8 candidates')
    await expect(page.locator('[data-testid="ml-welcome-message"]')).toContainText('make this a Spotify playlist')
  })

  test('should show empty candidates state', async ({ page }) => {
    await openMusicLeague(page)

    // Click new session
    await page.locator('[data-testid="ml-new-session"]').click()
    await page.waitForTimeout(500)

    await expect(page.locator('[data-testid="ml-no-candidates"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-candidates-count"]')).toContainText('0')
  })
})

test.describe('Music League Strategist - Feature 1: 5-8 Candidates', () => {
  test('should display 5-8 candidates with proper structure', async ({ page }) => {
    // Setup with exactly 6 candidates (within 5-8 range)
    const testCandidates = [
      { title: 'Purple Rain', artist: 'Prince', question: 'Is this too obvious?' },
      { title: 'Blue Monday', artist: 'New Order', question: 'Do you like synth-heavy tracks?' },
      { title: 'Yellow', artist: 'Coldplay', question: 'Too mainstream for your group?' },
      { title: 'Black Hole Sun', artist: 'Soundgarden', question: 'How does grunge play with your league?' },
      { title: 'White Wedding', artist: 'Billy Idol', question: 'Is 80s rock in your wheelhouse?' },
      { title: 'Paint It Black', artist: 'Rolling Stones', question: 'Classic rock: safe or predictable?' },
    ]

    await setupTestData(page, testCandidates)

    // Verify candidate count is between 5-8
    const countText = await page.locator('[data-testid="ml-candidates-count"]').textContent()
    const count = parseInt(countText || '0')
    expect(count).toBeGreaterThanOrEqual(5)
    expect(count).toBeLessThanOrEqual(8)

    // Verify each candidate is rendered
    for (let i = 0; i < testCandidates.length; i++) {
      await expect(page.locator(`[data-testid="ml-candidate-${i}"]`)).toBeVisible()
    }
  })
})

test.describe('Music League Strategist - Feature 3: Probing Questions', () => {
  test('should display probing question for each candidate', async ({ page }) => {
    const testCandidates = [
      { title: 'Purple Rain', artist: 'Prince', question: 'Is this too obvious a pick?' },
      { title: 'Blue Monday', artist: 'New Order', question: 'Do you like synth-heavy tracks?' },
      { title: 'Yellow', artist: 'Coldplay', question: 'Too mainstream for your group?' },
      { title: 'Black Hole Sun', artist: 'Soundgarden', question: 'How does grunge play with your league?' },
      { title: 'White Wedding', artist: 'Billy Idol', question: 'Is 80s rock in your wheelhouse?' },
    ]

    await setupTestData(page, testCandidates)

    // Feature 3 & 5: Verify each candidate has a probing question
    for (let i = 0; i < testCandidates.length; i++) {
      const questionEl = page.locator(`[data-testid="ml-candidate-question-${i}"]`)
      await expect(questionEl).toBeVisible()
      await expect(questionEl).toContainText('❓')
      await expect(questionEl).toContainText(testCandidates[i].question)
    }
  })
})

test.describe('Music League Strategist - Feature 7: No Duplicate Artists', () => {
  test('should not have duplicate artists in candidates', async ({ page }) => {
    const testCandidates = [
      { title: 'Purple Rain', artist: 'Prince', question: 'Q1' },
      { title: 'Blue Monday', artist: 'New Order', question: 'Q2' },
      { title: 'Yellow', artist: 'Coldplay', question: 'Q3' },
      { title: 'Black Hole Sun', artist: 'Soundgarden', question: 'Q4' },
      { title: 'White Wedding', artist: 'Billy Idol', question: 'Q5' },
    ]

    await setupTestData(page, testCandidates)

    // Get all artist names from data attributes
    const candidates = page.locator('[data-testid^="ml-candidate-"]')
    const count = await candidates.count()

    const artists: string[] = []
    for (let i = 0; i < count; i++) {
      const artist = await candidates.nth(i).getAttribute('data-artist')
      if (artist) artists.push(artist)
    }

    // Verify no duplicates
    const uniqueArtists = new Set(artists)
    expect(uniqueArtists.size).toBe(artists.length)
  })
})

test.describe('Music League Strategist - Feature 6: Playlist Buttons', () => {
  test('should show Spotify and YouTube buttons when candidates exist', async ({ page }) => {
    const testCandidates = [
      { title: 'Purple Rain', artist: 'Prince', question: 'Q1' },
      { title: 'Blue Monday', artist: 'New Order', question: 'Q2' },
      { title: 'Yellow', artist: 'Coldplay', question: 'Q3' },
      { title: 'Black Hole Sun', artist: 'Soundgarden', question: 'Q4' },
      { title: 'White Wedding', artist: 'Billy Idol', question: 'Q5' },
    ]

    await setupTestData(page, testCandidates)

    // Feature 6: Natural language playlist detection - buttons should be visible
    await expect(page.locator('[data-testid="ml-spotify-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-youtube-button"]')).toBeVisible()
  })

  test('should not show playlist buttons when no candidates', async ({ page }) => {
    await openMusicLeague(page)

    // Click new session to clear candidates
    await page.locator('[data-testid="ml-new-session"]').click()
    await page.waitForTimeout(500)

    // Playlist buttons should not be visible
    await expect(page.locator('[data-testid="ml-spotify-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="ml-youtube-button"]')).not.toBeVisible()
  })
})

test.describe('Music League Strategist - Feature 9: Finalists Mode', () => {
  test('should show finalists panel when in finalists mode', async ({ page }) => {
    // Navigate first
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Setup with finalists mode via localStorage
    await page.evaluate(() => {
      const sessionId = `ml-test-${Date.now()}`
      const session = {
        id: sessionId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        phase: 'finalists',
        theme: { rawTheme: 'Test Theme' },
        candidates: [],
        finalists: [
          { id: 'f1', title: 'Purple Rain', artist: 'Prince', reason: 'Great fit' },
          { id: 'f2', title: 'Blue Monday', artist: 'New Order', reason: 'Unique choice' },
        ],
        conversationHistory: [],
        preferenceEvidence: [],
        iterationCount: 2,
      }

      const store = {
        state: {
          sessions: [session],
          activeSessionId: sessionId,
          userProfile: null,
          strategistModel: null,
        },
        version: 0,
      }

      localStorage.setItem('mashb0ard-music-league', JSON.stringify(store))
    })

    // Reload and open Music League
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)
    await page.locator('text=Music League').first().click()
    await page.waitForSelector('[data-testid="music-league-strategist"]', { timeout: 10000 })

    // Feature 9: Finalists mode
    await expect(page.locator('[data-testid="ml-mode"]')).toContainText('Finalists Mode')
    await expect(page.locator('[data-testid="ml-finalists-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-finalists-list"]')).toBeVisible()

    // Verify finalists are displayed
    await expect(page.locator('[data-testid="ml-finalist-0"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-finalist-1"]')).toBeVisible()
  })
})

test.describe('Music League Strategist - Feature 2: Chat-Only Interaction', () => {
  test('should allow text input in chat', async ({ page }) => {
    await openMusicLeague(page)

    // Click new session
    await page.locator('[data-testid="ml-new-session"]').click()
    await page.waitForTimeout(500)

    // Feature 2: Chat-only - verify input accepts text
    const input = page.locator('[data-testid="ml-input"]')
    await input.fill('Songs with colors in the title')

    // Verify the input has the value
    await expect(input).toHaveValue('Songs with colors in the title')

    // Verify send button is enabled when there's input
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeEnabled()
  })

  test('should have disabled send button when input is empty', async ({ page }) => {
    await openMusicLeague(page)

    // Click new session
    await page.locator('[data-testid="ml-new-session"]').click()
    await page.waitForTimeout(500)

    // Verify send button is disabled with empty input
    await expect(page.locator('[data-testid="ml-send-button"]')).toBeDisabled()
  })
})

test.describe('Music League Strategist - Conversation History', () => {
  test('should display conversation messages', async ({ page }) => {
    const testCandidates = [
      { title: 'Purple Rain', artist: 'Prince', question: 'Q1' },
      { title: 'Blue Monday', artist: 'New Order', question: 'Q2' },
      { title: 'Yellow', artist: 'Coldplay', question: 'Q3' },
      { title: 'Black Hole Sun', artist: 'Soundgarden', question: 'Q4' },
      { title: 'White Wedding', artist: 'Billy Idol', question: 'Q5' },
    ]

    await setupTestData(page, testCandidates)

    // Verify user message is displayed
    await expect(page.locator('[data-testid="ml-message-user-0"]')).toBeVisible()
    await expect(page.locator('[data-testid="ml-message-content-0"]')).toContainText('Songs with colors')

    // Verify assistant message is displayed
    await expect(page.locator('[data-testid="ml-message-assistant-1"]')).toBeVisible()
  })
})
