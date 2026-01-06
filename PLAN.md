# Implementation Plan: Mashb0ard

> **Status:** Draft  
> **Last Updated:** 2025-01-06  
> **Companion Docs:** DESIGN.md, FEATURES.md, UI_UX.md, ARCHITECTURE.md

---

## Overview

This document outlines the phased implementation plan for Mashb0ard. The plan is structured to deliver working functionality incrementally, with each phase building on the previous one.

**Total Estimated Effort:** 4-6 weeks (solo developer, part-time)

**Principles:**
- Ship working increments, not big bangs
- Core functionality before polish
- Integration points tested early
- Each phase produces a usable (if incomplete) product

---

## Phase Summary

| Phase | Name | Duration | Deliverable |
|-------|------|----------|-------------|
| 0 | Project Setup | 1-2 days | Empty app running locally + in Docker |
| 1 | Layout Shell | 2-3 days | Header, sidebars, panels (empty content) |
| 2 | Settings & Storage | 2-3 days | Settings UI, localStorage persistence |
| 3 | AI Chat | 4-5 days | Working chat with OpenRouter streaming |
| 4 | Workflows & Links | 2-3 days | Workflow launcher, quick links |
| 5 | Embedded Services | 2-3 days | Notes sidebar, terminal panel (iframes) |
| 6 | Pinned Notes | 1-2 days | Pinned notes grid, sidebar integration |
| 7 | Server Status | 2-3 days | Termix API integration, status widgets |
| 8 | Snippets | 2-3 days | ByteStash popover integration |
| 9 | Command Palette | 1-2 days | Unified search/actions |
| 10 | Polish & Deploy | 2-3 days | Theming, accessibility, Docker, extension |

---

## Phase 0: Project Setup

**Goal:** Scaffolded project running locally and in Docker.

**Duration:** 1-2 days

### Tasks

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui (init + base components)
- [ ] Set up project structure (folders per ARCHITECTURE.md)
- [ ] Configure ESLint + Prettier
- [ ] Create basic `App.tsx` with "Hello Mashb0ard"
- [ ] Create Dockerfile + nginx.conf
- [ ] Create docker-compose.yml
- [ ] Verify local dev server works (`npm run dev`)
- [ ] Verify Docker build and run works
- [ ] Initialize git repository with .gitignore

### Deliverable

```
✅ npm run dev → shows "Hello Mashb0ard" at localhost:5173
✅ docker compose up → shows same at localhost:3000
```

### Dependencies

- None (starting point)

---

## Phase 1: Layout Shell

**Goal:** App skeleton with all major layout zones, empty but functional.

**Duration:** 2-3 days

### Tasks

- [ ] Create `Header` component with logo, placeholder command bar, action icons
- [ ] Create `Sidebar` reusable component (left/right, open/close, push/overlay)
- [ ] Create `AIChatSidebar` wrapper (left side, empty content)
- [ ] Create `NotesSidebar` wrapper (right side, empty content)
- [ ] Create `TerminalPanel` component (bottom, collapsible, resizable)
- [ ] Create `MainContent` area with placeholder sections
- [ ] Implement sidebar open/close state (`uiStore`)
- [ ] Implement terminal panel expand/collapse + height persistence
- [ ] Add CSS variables for theming (colors, spacing)
- [ ] Implement dark mode toggle (visual only, not persisted yet)
- [ ] Test responsive behavior at breakpoints

### Deliverable

```
✅ Header with icons (non-functional)
✅ Click AI icon → left sidebar slides in/out
✅ Click Notes icon → right sidebar slides in/out
✅ Click Terminal toggle → bottom panel expands/collapses
✅ Drag terminal resize handle → height changes
✅ Dark/light mode toggle works visually
```

### Dependencies

- Phase 0 complete

---

## Phase 2: Settings & Storage

**Goal:** Settings dialog with all configuration options, persisted to localStorage.

**Duration:** 2-3 days

### Tasks

- [ ] Create `settingsStore` with Zustand + persist middleware
- [ ] Define settings schema (API keys, URLs, preferences)
- [ ] Create `SettingsDialog` component (modal)
- [ ] Create `ApiKeysSection` with masked inputs
- [ ] Create `AiPrefsSection` with model selection (static list for now)
- [ ] Create `AppearanceSection` with theme + sidebar behavior
- [ ] Create `DataSection` with export/import/clear
- [ ] Wire settings icon in header to open dialog
- [ ] Implement `Mod+,` keyboard shortcut for settings
- [ ] Test persistence across page reloads
- [ ] Add migration logic for future schema changes

### Deliverable

```
✅ Gear icon → opens settings dialog
✅ Enter API keys → saved to localStorage
✅ Change theme → persists on reload
✅ Export → downloads JSON file
✅ Import → restores settings from JSON
✅ Clear all → wipes localStorage (with confirmation)
```

### Dependencies

- Phase 1 complete (for dialog placement)

---

## Phase 3: AI Chat

**Goal:** Fully functional AI chat with OpenRouter, streaming, and conversation management.

**Duration:** 4-5 days

### Tasks

#### Core Chat
- [ ] Create `chatStore` with conversation state
- [ ] Create `OpenRouterService` with streaming support
- [ ] Create `MessageList` component
- [ ] Create `ChatInput` component with submit handling
- [ ] Implement streaming response rendering
- [ ] Add loading state during streaming
- [ ] Handle API errors gracefully

#### Provider Management
- [ ] Create `ProviderSelector` dropdown
- [ ] Fetch model list from OpenRouter (or use static list initially)
- [ ] Implement favorite models (Mod+1-5 switching)
- [ ] Add deep reasoning toggle
- [ ] Wire default model from settings

#### Message Actions
- [ ] Add copy button per message
- [ ] Add copy button per code block
- [ ] Implement edit user message (resubmit)
- [ ] Implement conversation branching on edit

#### Session Management
- [ ] Persist conversations to localStorage
- [ ] Create `SessionTransferModal`
- [ ] Implement "Continue in New Session" with full copy
- [ ] Implement summary generation for transfer
- [ ] Add conversation clear/new

#### Keyboard Shortcuts
- [ ] `Mod+/` toggles AI sidebar
- [ ] `Mod+Enter` sends message
- [ ] `Escape` closes sidebar

### Deliverable

```
✅ Type message → get streaming response from Claude/GPT
✅ Copy code blocks with one click
✅ Edit previous message → conversation branches
✅ Switch models mid-conversation
✅ "Continue in New Session" → transfers context
✅ Conversations persist across page reloads
```

### Dependencies

- Phase 2 complete (for API key access)

---

## Phase 4: Workflows & Links

**Goal:** Workflow launcher cards and quick links panel, fully editable.

**Duration:** 2-3 days

### Tasks

#### Workflows
- [ ] Create `workflowStore` with workflow CRUD
- [ ] Create `WorkflowGrid` component
- [ ] Create `WorkflowCard` component
- [ ] Create `WorkflowEditor` dialog (add/edit)
- [ ] Implement workflow launch (opens all URLs)
- [ ] Implement drag-and-drop reordering
- [ ] Add `Mod+Shift+[1-9]` shortcuts for workflows

#### Quick Links
- [ ] Add quick links to `workflowStore` (or separate store)
- [ ] Create `QuickLinksPanel` component
- [ ] Create `LinkGroup` collapsible component
- [ ] Create link add/edit dialog
- [ ] Implement single link click (opens new tab)
- [ ] Implement group collapse/expand persistence

### Deliverable

```
✅ Workflow cards display on dashboard
✅ Click workflow → all URLs open in new tabs
✅ Add/edit/delete workflows via dialog
✅ Quick links panel with collapsible groups
✅ Mod+Shift+1 launches first workflow
```

### Dependencies

- Phase 1 complete (for main content area)
- Phase 2 complete (for persistence pattern)

---

## Phase 5: Embedded Services

**Goal:** Notes sidebar and terminal panel with functional iframes.

**Duration:** 2-3 days

### Tasks

#### Shared
- [ ] Create `ServiceIframe` component with loading/error states
- [ ] Test iframe embedding with current Dumbpad/Termix configs
- [ ] Document X-Frame-Options requirements

#### Notes Sidebar
- [ ] Wire `NotesSidebar` to use `ServiceIframe`
- [ ] Read Dumbpad URL from settings
- [ ] Implement `Mod+N` keyboard shortcut
- [ ] Add loading spinner while iframe loads

#### Terminal Panel
- [ ] Wire `TerminalPanel` to use `ServiceIframe`
- [ ] Read Termix URL from settings
- [ ] Implement `Mod+Shift+T` keyboard shortcut
- [ ] Persist panel height to localStorage
- [ ] Add resize handle interaction

### Deliverable

```
✅ Notes sidebar shows Dumbpad
✅ Terminal panel shows Termix
✅ Keyboard shortcuts toggle both
✅ Terminal panel height persists
✅ Loading states while iframes load
```

### Dependencies

- Phase 2 complete (for URL settings)
- **External:** Dumbpad/Termix configured to allow iframe embedding

---

## Phase 6: Pinned Notes

**Goal:** Pinned notes grid with configurable notes that open in sidebar.

**Duration:** 1-2 days

### Tasks

- [ ] Create `pinnedNotesStore` with default notes
- [ ] Create `PinnedNotesGrid` component
- [ ] Create `PinnedNoteCard` component
- [ ] Implement click → open notes sidebar with `?id=` parameter
- [ ] Create `PinnedNotesSection` in Settings
- [ ] Implement add/edit/delete pinned notes
- [ ] Implement drag-and-drop reordering
- [ ] Add "Reset to Defaults" button
- [ ] Seed default notes on first load

### Deliverable

```
✅ Pinned notes grid on dashboard (Ideas, Projects, Shopping List, etc.)
✅ Click pinned note → Notes sidebar opens with that note
✅ Configure pinned notes in Settings
✅ Drag to reorder
```

### Dependencies

- Phase 5 complete (notes sidebar must work first)

---

## Phase 7: Server Status

**Goal:** Server status widgets showing Termix host health and metrics.

**Duration:** 2-3 days

### Tasks

- [ ] Create `TermixService` with host/status/metrics methods
- [ ] Create `ServerStatusGrid` component
- [ ] Create `ServerStatusCard` component
- [ ] Implement status polling (60s interval)
- [ ] Display host name, online/offline indicator
- [ ] Display CPU, memory, disk metrics (progress bars)
- [ ] Handle offline hosts gracefully
- [ ] Handle Termix API errors
- [ ] Add manual refresh button
- [ ] Add "last updated" timestamp

### Deliverable

```
✅ Server status cards show on dashboard
✅ Green dot = online, red = offline
✅ CPU/MEM/DISK bars update every 60s
✅ Works gracefully when Termix unavailable
```

### Dependencies

- Phase 2 complete (for Termix credentials)

---

## Phase 8: Snippets

**Goal:** Snippets popover with ByteStash search, view, copy, and create.

**Duration:** 2-3 days

### Tasks

- [ ] Create `ByteStashService` with search/get/create methods
- [ ] Create `SnippetsPopover` component (anchored to header icon)
- [ ] Create `SnippetList` component with search input
- [ ] Create `SnippetView` component with syntax highlighting
- [ ] Create `SnippetForm` for creating new snippets
- [ ] Implement search with debouncing
- [ ] Implement copy to clipboard
- [ ] Implement "Open in ByteStash" link
- [ ] Add `Mod+Shift+S` keyboard shortcut
- [ ] Add snippets icon to header
- [ ] Handle API errors gracefully

### Deliverable

```
✅ Click </> icon or Mod+Shift+S → snippets popover opens
✅ Search snippets → results update live
✅ Click snippet → view with syntax highlighting
✅ Copy button → code copied to clipboard
✅ Create new snippet from popover
```

### Dependencies

- Phase 2 complete (for ByteStash credentials)

---

## Phase 9: Command Palette

**Goal:** Unified command palette for quick actions and navigation.

**Duration:** 1-2 days

### Tasks

- [ ] Install cmdk (or use shadcn Command component)
- [ ] Create `CommandPalette` component
- [ ] Index all available actions:
  - Toggle sidebars/panels
  - Open settings
  - Launch workflows
  - Open pinned notes
  - Recent AI conversations
- [ ] Implement fuzzy search
- [ ] Show keyboard shortcut hints
- [ ] Implement `Mod+K` to open
- [ ] Implement arrow navigation + Enter to select
- [ ] Add to command palette results when searching

### Deliverable

```
✅ Mod+K → command palette opens
✅ Type "chat" → "Open AI Chat" appears
✅ Type workflow name → can launch it
✅ Arrow keys navigate, Enter selects
✅ Escape closes
```

### Dependencies

- Phase 3, 4, 5, 6 complete (needs actions to index)

---

## Phase 10: Polish & Deploy

**Goal:** Production-ready with theming, accessibility, and deployment.

**Duration:** 2-3 days

### Tasks

#### Theming
- [ ] Finalize color tokens (dark + light)
- [ ] Test all components in both themes
- [ ] Implement system theme detection
- [ ] Add theme transition animations

#### Accessibility
- [ ] Audit keyboard navigation (all interactive elements focusable)
- [ ] Add ARIA labels to icon buttons
- [ ] Test with screen reader
- [ ] Ensure focus visible indicators
- [ ] Test color contrast ratios

#### Performance
- [ ] Add lazy loading for sidebars/modals
- [ ] Verify bundle size is reasonable
- [ ] Test on slower network (throttled)

#### Deployment
- [ ] Finalize Dockerfile
- [ ] Test Docker build and run
- [ ] Create docker-compose.yml with Traefik labels
- [ ] Create browser extension manifest
- [ ] Build extension package
- [ ] Write deployment documentation

#### Documentation
- [ ] Write README.md with setup instructions
- [ ] Document environment configuration
- [ ] Document keyboard shortcuts
- [ ] Add screenshots to README

### Deliverable

```
✅ docker compose up → working dashboard
✅ Browser extension redirects new tab
✅ All features work in light and dark mode
✅ Keyboard navigation complete
✅ README with setup instructions
```

### Dependencies

- All previous phases complete

---

## Risk Mitigation

### High-Risk Items

| Risk | Mitigation | Phase |
|------|------------|-------|
| iframe embedding blocked | Test early, document X-Frame-Options requirements | Phase 5 |
| OpenRouter API changes | Use typed service layer, easy to update | Phase 3 |
| Termix API undocumented endpoints | Test with real API early, have fallback UI | Phase 7 |
| ByteStash auth complexity | Test API key auth early in isolation | Phase 8 |
| Browser extension approval | Minimal extension (just redirect), low risk | Phase 10 |

### Validation Checkpoints

| After Phase | Validate |
|-------------|----------|
| Phase 0 | Docker deployment works |
| Phase 3 | AI chat is fully functional (core feature) |
| Phase 5 | iframes embed correctly (external dependency) |
| Phase 7 | Termix API integration works (external dependency) |
| Phase 8 | ByteStash API integration works (external dependency) |

---

## Post-MVP Roadmap

### v1.1 — Enhanced Chat
- [ ] Image attachment in AI chat
- [ ] Extended thinking visualization
- [ ] Cross-session chat memory/search

### v1.2 — Backend Proxy
- [ ] Optional backend for API key storage
- [ ] Encrypted settings sync

### v1.3 — Integrations
- [ ] Home Assistant entity cards
- [ ] Calendar widget
- [ ] Weather widget
- [ ] RSS feed reader

### v1.4 — Advanced
- [ ] Plugin/widget system
- [ ] Custom CSS themes
- [ ] Multi-device sync

---

## Success Criteria

### MVP Complete When:

- [ ] Can replace browser new tab without friction
- [ ] AI chat works with 3+ providers via OpenRouter
- [ ] Workflows launch grouped links
- [ ] Notes and terminal embedded and functional
- [ ] Pinned notes open specific Dumbpad notes
- [ ] Server status shows live Termix data
- [ ] Snippets searchable and copyable
- [ ] Keyboard shortcuts feel natural
- [ ] Docker deployment documented and working
- [ ] Basic browser extension working

---

*This plan guides the implementation of Mashb0ard. See TASKS.md for detailed, atomic task breakdown.*
