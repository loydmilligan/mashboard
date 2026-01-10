import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useContentStore } from './contentStore'

// Mock STORAGE_KEYS
vi.mock('@/lib/constants', () => ({
  STORAGE_KEYS: {
    CONTENT_TABS: 'mashb0ard-content-tabs',
  },
}))

describe('contentStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useContentStore.setState({
      openTabs: [],
      activeTabId: null,
    })
  })

  describe('openTab', () => {
    it('should open a new tab and return its id', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({
        appType: 'termix',
        title: 'Terminal',
      })

      expect(tabId).toBeDefined()
      expect(tabId).toMatch(/^tab-/)
      expect(useContentStore.getState().openTabs).toHaveLength(1)
    })

    it('should set the new tab as active', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({
        appType: 'bytestash',
        title: 'ByteStash',
      })

      expect(useContentStore.getState().activeTabId).toBe(tabId)
    })

    it('should store tab properties', () => {
      const store = useContentStore.getState()
      store.openTab({
        appType: 'searxng',
        title: 'Search',
        props: { query: 'test search' },
      })

      const tab = useContentStore.getState().openTabs[0]
      expect(tab.appType).toBe('searxng')
      expect(tab.title).toBe('Search')
      expect(tab.props).toEqual({ query: 'test search' })
    })

    it('should allow opening multiple tabs', () => {
      const store = useContentStore.getState()
      store.openTab({ appType: 'termix', title: 'Terminal' })
      store.openTab({ appType: 'bytestash', title: 'ByteStash' })
      store.openTab({ appType: 'searxng', title: 'Search' })

      expect(useContentStore.getState().openTabs).toHaveLength(3)
    })
  })

  describe('closeTab', () => {
    it('should remove the specified tab', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({ appType: 'termix', title: 'Terminal' })

      store.closeTab(tabId)
      expect(useContentStore.getState().openTabs).toHaveLength(0)
    })

    it('should switch to adjacent tab when closing active tab', () => {
      const store = useContentStore.getState()
      const tab1 = store.openTab({ appType: 'termix', title: 'Tab 1' })
      const tab2 = store.openTab({ appType: 'bytestash', title: 'Tab 2' })

      // tab2 is now active (most recently opened)
      expect(useContentStore.getState().activeTabId).toBe(tab2)

      store.closeTab(tab2)
      expect(useContentStore.getState().activeTabId).toBe(tab1)
    })

    it('should set activeTabId to null when closing last tab', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({ appType: 'termix', title: 'Terminal' })

      store.closeTab(tabId)
      expect(useContentStore.getState().activeTabId).toBeNull()
    })

    it('should not change active tab when closing non-active tab', () => {
      const store = useContentStore.getState()
      const tab1 = store.openTab({ appType: 'termix', title: 'Tab 1' })
      const tab2 = store.openTab({ appType: 'bytestash', title: 'Tab 2' })

      // tab2 is active
      store.closeTab(tab1)

      expect(useContentStore.getState().activeTabId).toBe(tab2)
      expect(useContentStore.getState().openTabs).toHaveLength(1)
    })
  })

  describe('setActiveTab', () => {
    it('should set the active tab', () => {
      const store = useContentStore.getState()
      const tab1 = store.openTab({ appType: 'termix', title: 'Tab 1' })
      store.openTab({ appType: 'bytestash', title: 'Tab 2' })

      store.setActiveTab(tab1)
      expect(useContentStore.getState().activeTabId).toBe(tab1)
    })

    it('should allow setting activeTabId to null', () => {
      const store = useContentStore.getState()
      store.openTab({ appType: 'termix', title: 'Tab 1' })

      store.setActiveTab(null)
      expect(useContentStore.getState().activeTabId).toBeNull()
    })
  })

  describe('updateTabProps', () => {
    it('should update tab properties', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({
        appType: 'searxng',
        title: 'Search',
        props: { query: 'initial' },
      })

      store.updateTabProps(tabId, { query: 'updated search' })

      const tab = useContentStore.getState().openTabs[0]
      expect(tab.props).toEqual({ query: 'updated search' })
    })

    it('should merge with existing props', () => {
      const store = useContentStore.getState()
      const tabId = store.openTab({
        appType: 'searxng',
        title: 'Search',
        props: { query: 'search', page: 1 },
      })

      store.updateTabProps(tabId, { page: 2 })

      const tab = useContentStore.getState().openTabs[0]
      expect(tab.props).toEqual({ query: 'search', page: 2 })
    })
  })

  describe('reorderTabs', () => {
    it('should reorder tabs based on provided ids', () => {
      const store = useContentStore.getState()
      const tab1 = store.openTab({ appType: 'termix', title: 'Tab 1' })
      const tab2 = store.openTab({ appType: 'bytestash', title: 'Tab 2' })
      const tab3 = store.openTab({ appType: 'searxng', title: 'Tab 3' })

      // Reorder: 3, 1, 2
      store.reorderTabs([tab3, tab1, tab2])

      const tabs = useContentStore.getState().openTabs
      expect(tabs[0].id).toBe(tab3)
      expect(tabs[1].id).toBe(tab1)
      expect(tabs[2].id).toBe(tab2)
    })

    it('should filter out invalid tab ids', () => {
      const store = useContentStore.getState()
      const tab1 = store.openTab({ appType: 'termix', title: 'Tab 1' })
      const tab2 = store.openTab({ appType: 'bytestash', title: 'Tab 2' })

      store.reorderTabs([tab2, 'invalid-id', tab1])

      const tabs = useContentStore.getState().openTabs
      expect(tabs).toHaveLength(2)
      expect(tabs[0].id).toBe(tab2)
      expect(tabs[1].id).toBe(tab1)
    })
  })

  describe('closeAllTabs', () => {
    it('should close all tabs and set activeTabId to null', () => {
      const store = useContentStore.getState()
      store.openTab({ appType: 'termix', title: 'Tab 1' })
      store.openTab({ appType: 'bytestash', title: 'Tab 2' })
      store.openTab({ appType: 'searxng', title: 'Tab 3' })

      store.closeAllTabs()

      expect(useContentStore.getState().openTabs).toHaveLength(0)
      expect(useContentStore.getState().activeTabId).toBeNull()
    })
  })
})
