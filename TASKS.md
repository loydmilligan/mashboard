# Tasks: Mashb0ard

> **Status:** Ready for Implementation  
> **Last Updated:** 2025-01-06  
> **Usage:** Check off tasks as completed. Each task should be atomic and independently testable.

---

## Phase 0: Project Setup

### 0.1 Initialize Project
- [ ] Run `npm create vite@latest mashb0ard -- --template react-ts`
- [ ] `cd mashb0ard && npm install`
- [ ] Verify `npm run dev` works (shows Vite default page)

### 0.2 Configure Tailwind CSS
- [ ] `npm install -D tailwindcss postcss autoprefixer`
- [ ] `npx tailwindcss init -p`
- [ ] Update `tailwind.config.js` with content paths
- [ ] Replace `src/index.css` with Tailwind directives
- [ ] Add dark mode config: `darkMode: 'class'`
- [ ] Verify Tailwind classes work in App.tsx

### 0.3 Configure shadcn/ui
- [ ] `npx shadcn@latest init` (select: TypeScript, Default style, CSS variables, neutral base)
- [ ] Verify `components.json` created
- [ ] Verify `src/lib/utils.ts` created with `cn()` function
- [ ] Install first component: `npx shadcn@latest add button`
- [ ] Test Button component renders in App.tsx

### 0.4 Project Structure
- [ ] Create folder structure per ARCHITECTURE.md:
  ```
  src/
    components/ui/
    components/layout/
    components/features/
    components/shared/
    hooks/
    stores/
    services/
    types/
    lib/
  ```
- [ ] Move shadcn components to `src/components/ui/`
- [ ] Create `src/lib/constants.ts` with app name, version

### 0.5 Linting & Formatting
- [ ] `npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser`
- [ ] `npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks`
- [ ] Create `.eslintrc.cjs` with React + TypeScript rules
- [ ] Create `.prettierrc` with preferences (singleQuote, semi, etc.)
- [ ] Add lint script to package.json: `"lint": "eslint src --ext ts,tsx"`
- [ ] Run lint, fix any issues

### 0.6 Basic App Shell
- [ ] Clear App.tsx, replace with minimal "Mashb0ard" heading
- [ ] Apply dark background via Tailwind class
- [ ] Set page title in index.html: "Mashb0ard"
- [ ] Add favicon (placeholder or simple icon)

### 0.7 Docker Setup
- [ ] Create `docker/Dockerfile` (multi-stage: node build → nginx serve)
- [ ] Create `docker/nginx.conf` with SPA routing
- [ ] Create `docker/docker-compose.yml`
- [ ] Build: `docker build -f docker/Dockerfile -t mashb0ard .`
- [ ] Run: `docker run -p 3000:80 mashb0ard`
- [ ] Verify app loads at localhost:3000

### 0.8 Git Setup
- [ ] Create `.gitignore` (node_modules, dist, .env, etc.)
- [ ] `git init`
- [ ] `git add . && git commit -m "Initial project setup"`

---

## Phase 1: Layout Shell

### 1.1 CSS Variables & Theming Foundation
- [ ] Define CSS variables in `index.css`:
  ```css
  :root { --background, --foreground, --accent, etc. }
  .dark { /* dark theme overrides */ }
  ```
- [ ] Create `src/hooks/useTheme.ts` with theme state
- [ ] Implement `ThemeProvider` wrapper component
- [ ] Add/remove `dark` class on `<html>` element based on theme

### 1.2 Header Component
- [ ] Create `src/components/layout/Header.tsx`
- [ ] Add logo/app name (left side)
- [ ] Add placeholder command bar (center) — just styled input, non-functional
- [ ] Add icon buttons (right): snippets `</>`, theme toggle, settings gear, help `?`
- [ ] Style with Tailwind: sticky top, border-bottom, backdrop-blur

### 1.3 Sidebar Base Component
- [ ] Create `src/components/layout/Sidebar.tsx`
- [ ] Props: `side: 'left' | 'right'`, `open: boolean`, `onClose: () => void`
- [ ] Implement slide-in animation (transform + transition)
- [ ] Add close button (X) in header
- [ ] Support both push and overlay modes (prop)
- [ ] Handle Escape key to close

### 1.4 UI Store
- [ ] `npm install zustand`
- [ ] Create `src/stores/uiStore.ts`
- [ ] State: `aiSidebarOpen`, `notesSidebarOpen`, `terminalPanelOpen`, `terminalPanelHeight`
- [ ] Actions: `toggleAiSidebar`, `toggleNotesSidebar`, `toggleTerminalPanel`, `setTerminalPanelHeight`
- [ ] Export `useUIStore` hook

### 1.5 AI Chat Sidebar (Shell)
- [ ] Create `src/components/features/ai-chat/AIChatSidebar.tsx`
- [ ] Use `Sidebar` component with `side="left"`
- [ ] Add placeholder content: "AI Chat coming soon"
- [ ] Wire to `uiStore.aiSidebarOpen`
- [ ] Add AI icon to Header that toggles sidebar

### 1.6 Notes Sidebar (Shell)
- [ ] Create `src/components/features/notes/NotesSidebar.tsx`
- [ ] Use `Sidebar` component with `side="right"`
- [ ] Add placeholder content: "Notes coming soon"
- [ ] Wire to `uiStore.notesSidebarOpen`
- [ ] Add notes icon to Header that toggles sidebar

### 1.7 Terminal Panel (Shell)
- [ ] Create `src/components/layout/TerminalPanel.tsx`
- [ ] Fixed to bottom, collapsible
- [ ] Add drag handle for resizing (top edge)
- [ ] Implement resize logic (mouse drag updates height)
- [ ] Min height: 100px, max height: 60vh
- [ ] Wire to `uiStore.terminalPanelOpen` and `terminalPanelHeight`
- [ ] Add expand/collapse toggle button

### 1.8 Main Content Area
- [ ] Create `src/components/layout/MainContent.tsx`
- [ ] Placeholder sections: "Workflows", "Pinned Notes", "Server Status", "Quick Links"
- [ ] Responsive grid layout
- [ ] Adjust margins when sidebars open (if push mode)

### 1.9 App Layout Assembly
- [ ] Update `App.tsx` to compose:
  ```tsx
  <ThemeProvider>
    <Header />
    <div className="main-wrapper">
      <AIChatSidebar />
      <MainContent />
      <NotesSidebar />
    </div>
    <TerminalPanel />
  </ThemeProvider>
  ```
- [ ] Verify layout at different viewport sizes
- [ ] Test sidebar open/close animations

### 1.10 Theme Toggle
- [ ] Create theme toggle button component
- [ ] Toggle between light/dark on click
- [ ] Show sun/moon icon based on current theme
- [ ] Verify both themes look correct

---

## Phase 2: Settings & Storage

### 2.1 Settings Store
- [ ] Create `src/stores/settingsStore.ts`
- [ ] Define `SettingsState` interface per ARCHITECTURE.md
- [ ] Use Zustand persist middleware with `mashb0ard-settings` key
- [ ] Initialize with sensible defaults (empty keys, dark theme)
- [ ] Add schema version for migrations

### 2.2 Settings Dialog Component
- [ ] `npx shadcn@latest add dialog`
- [ ] Create `src/components/features/settings/SettingsDialog.tsx`
- [ ] Add tabs/sidebar navigation: API Keys, AI Prefs, Pinned Notes, Appearance, Data
- [ ] Wire to open from Header gear icon
- [ ] Add to `uiStore`: `settingsOpen`, `setSettingsOpen`

### 2.3 API Keys Section
- [ ] Create `src/components/features/settings/ApiKeysSection.tsx`
- [ ] Input fields: OpenRouter key, Termix URL, Termix token, Dumbpad URL, ByteStash URL, ByteStash API key
- [ ] Masked inputs with show/hide toggle
- [ ] Wire to `settingsStore`
- [ ] Auto-save on blur or debounced onChange

### 2.4 AI Preferences Section
- [ ] Create `src/components/features/settings/AiPrefsSection.tsx`
- [ ] Default model dropdown (static list for now)
- [ ] Favorite models multi-select (max 5)
- [ ] Summary model dropdown
- [ ] Deep reasoning toggle switch
- [ ] Wire to `settingsStore.ai`

### 2.5 Appearance Section
- [ ] Create `src/components/features/settings/AppearanceSection.tsx`
- [ ] Theme selector: Light / Dark / System
- [ ] Sidebar behavior: Push / Overlay
- [ ] Wire to `settingsStore.appearance`
- [ ] Apply theme changes immediately

### 2.6 Data Section
- [ ] Create `src/components/features/settings/DataSection.tsx`
- [ ] Export button: downloads settings as JSON
- [ ] Import button: file input, parses JSON, updates store
- [ ] Clear all button: confirmation dialog, then wipes localStorage
- [ ] Show storage usage estimate

### 2.7 Settings Keyboard Shortcut
- [ ] Create `src/hooks/useKeyboardShortcuts.ts` (base implementation)
- [ ] Detect Mod key (Cmd on Mac, Ctrl on Windows)
- [ ] Add `Mod+,` shortcut to open settings
- [ ] Wire in App.tsx

### 2.8 Persistence Verification
- [ ] Enter test API key, reload page, verify persisted
- [ ] Change theme, reload, verify persisted
- [ ] Export settings, clear all, import, verify restored

---

## Phase 3: AI Chat

### 3.1 Types
- [ ] Create `src/types/chat.ts`:
  ```typescript
  interface Message { id, role, content, timestamp }
  interface Conversation { id, title, messages, model, createdAt }
  ```
- [ ] Export types

### 3.2 Chat Store
- [ ] Create `src/stores/chatStore.ts`
- [ ] State: `conversations`, `activeConversationId`, `isStreaming`
- [ ] Actions: `addMessage`, `updateMessage`, `editMessage`, `createConversation`, `deleteConversation`, `setActiveConversation`
- [ ] Persist with Zustand middleware

### 3.3 OpenRouter Service
- [ ] Create `src/services/openrouter.ts`
- [ ] Constructor takes API key from settings store
- [ ] Implement `streamChat()` async generator
- [ ] Parse SSE responses, yield content chunks
- [ ] Handle errors (401, 429, network)
- [ ] Implement `getModels()` for model list

### 3.4 Message List Component
- [ ] Create `src/components/features/ai-chat/MessageList.tsx`
- [ ] Render list of messages from active conversation
- [ ] User messages: right-aligned or distinct style
- [ ] Assistant messages: left-aligned, with avatar
- [ ] Auto-scroll to bottom on new message
- [ ] Show typing indicator during streaming

### 3.5 Message Component
- [ ] Create `src/components/features/ai-chat/Message.tsx`
- [ ] Render markdown content (install `react-markdown`)
- [ ] Syntax highlighting for code blocks (`react-syntax-highlighter` or `highlight.js`)
- [ ] Copy button for entire message
- [ ] Copy button per code block
- [ ] Edit button for user messages

### 3.6 Chat Input Component
- [ ] Create `src/components/features/ai-chat/ChatInput.tsx`
- [ ] Textarea with auto-resize
- [ ] Send button (disabled while streaming)
- [ ] Placeholder: "Message..."
- [ ] Handle Mod+Enter to send
- [ ] Handle Enter for newline (or configurable)

### 3.7 Provider Selector
- [ ] Create `src/components/features/ai-chat/ProviderSelector.tsx`
- [ ] Dropdown with model list
- [ ] Show favorite models first (from settings)
- [ ] Deep reasoning toggle next to selector
- [ ] Wire to current conversation model

### 3.8 Streaming Integration
- [ ] In AIChatSidebar, handle send:
  1. Add user message to store
  2. Create empty assistant message
  3. Call `streamChat()`, update assistant message on each chunk
  4. Set `isStreaming` true/false
- [ ] Handle errors: show error message in chat

### 3.9 Edit & Resubmit
- [ ] Click edit on user message → show inline textarea
- [ ] Submit edit → truncate conversation at that point, add edited message, resubmit
- [ ] Store maintains message history for branching

### 3.10 Session Transfer Modal
- [ ] `npx shadcn@latest add select`
- [ ] Create `src/components/features/ai-chat/SessionTransferModal.tsx`
- [ ] Target model selector
- [ ] Transfer method: Full copy / Generate summary
- [ ] Summary model selector (if summary chosen)
- [ ] "Create Session" button
- [ ] Implement full copy: new conversation with all messages
- [ ] Implement summary: generate summary, inject as system message

### 3.11 Conversation Management
- [ ] "New Chat" button in sidebar header
- [ ] Conversation list (recent conversations)
- [ ] Click conversation to switch
- [ ] Delete conversation option

### 3.12 AI Chat Keyboard Shortcuts
- [ ] `Mod+/` toggles AI sidebar
- [ ] `Mod+Enter` sends message (in input)
- [ ] `Mod+1` through `Mod+5` switches to favorite models
- [ ] `Escape` closes sidebar

### 3.13 Polish
- [ ] Loading state for model list fetch
- [ ] Empty state: "Start a conversation"
- [ ] Error state: API key missing, API error
- [ ] Test with real OpenRouter API

---

## Phase 4: Workflows & Links

### 4.1 Types
- [ ] Create `src/types/workflow.ts`:
  ```typescript
  interface Workflow { id, name, icon, color, urls: {title, url}[], order }
  interface LinkGroup { id, name, links: {title, url, favicon?}[], collapsed, order }
  ```

### 4.2 Workflow Store
- [ ] Create `src/stores/workflowStore.ts`
- [ ] State: `workflows`, `quickLinks`
- [ ] Actions: CRUD for both, `launchWorkflow`, reorder functions
- [ ] Persist with Zustand

### 4.3 Workflow Grid
- [ ] Create `src/components/features/workflows/WorkflowGrid.tsx`
- [ ] Responsive grid layout (2-4 columns based on viewport)
- [ ] Render WorkflowCard for each workflow
- [ ] "Add Workflow" button at end

### 4.4 Workflow Card
- [ ] Create `src/components/features/workflows/WorkflowCard.tsx`
- [ ] Display: icon, name, URL count
- [ ] Click → launch workflow (open all URLs)
- [ ] Right-click or menu → edit/delete options
- [ ] Hover state with subtle elevation

### 4.5 Workflow Editor
- [ ] `npx shadcn@latest add input textarea`
- [ ] Create `src/components/features/workflows/WorkflowEditor.tsx`
- [ ] Modal/dialog form
- [ ] Fields: name, icon (emoji picker or text), color picker
- [ ] URL list: add/remove/reorder URLs
- [ ] Each URL: title input, URL input
- [ ] Save/Cancel buttons

### 4.6 Launch Workflow
- [ ] Implement `launchWorkflow(id)` in store
- [ ] For each URL in workflow, call `window.open(url, '_blank')`
- [ ] Add small delay between opens if needed (browser popup blocking)

### 4.7 Workflow Keyboard Shortcuts
- [ ] `Mod+Shift+1` through `Mod+Shift+9` launches workflow by position
- [ ] Wire in useKeyboardShortcuts

### 4.8 Quick Links Panel
- [ ] Create `src/components/features/quick-links/QuickLinksPanel.tsx`
- [ ] Render list of LinkGroup components
- [ ] "Add Group" button

### 4.9 Link Group Component
- [ ] Create `src/components/features/quick-links/LinkGroup.tsx`
- [ ] Collapsible header with group name
- [ ] List of links inside
- [ ] Each link: favicon (if available), title, click opens new tab
- [ ] Collapse state persisted

### 4.10 Link Editor
- [ ] Dialog for adding/editing links and groups
- [ ] Group: name
- [ ] Link: title, URL
- [ ] Drag-and-drop reordering within group

### 4.11 Drag and Drop
- [ ] Install `@dnd-kit/core @dnd-kit/sortable`
- [ ] Implement reordering for workflows
- [ ] Implement reordering for link groups
- [ ] Persist order to store

---

## Phase 5: Embedded Services

### 5.1 Service Iframe Component
- [ ] Create `src/components/shared/ServiceIframe.tsx`
- [ ] Props: `src`, `title`, `className`
- [ ] Loading state with spinner
- [ ] Error state with retry button
- [ ] Handle iframe load/error events

### 5.2 Notes Sidebar Implementation
- [ ] Update `NotesSidebar.tsx` to use `ServiceIframe`
- [ ] Read Dumbpad URL from `settingsStore`
- [ ] Manage active note ID state
- [ ] Expose `openNote(notepadId)` function globally (for pinned notes)
- [ ] When `openNote` called, update iframe src with `?id=` param

### 5.3 Terminal Panel Implementation
- [ ] Update `TerminalPanel.tsx` to use `ServiceIframe`
- [ ] Read Termix URL from `settingsStore`
- [ ] Show placeholder when URL not configured
- [ ] Persist collapsed/expanded state

### 5.4 Keyboard Shortcuts
- [ ] `Mod+N` toggles notes sidebar (already planned)
- [ ] `Mod+Shift+T` toggles terminal panel (already planned)
- [ ] Verify both work

### 5.5 iframe Configuration Check
- [ ] Test Dumbpad embedding locally
- [ ] Test Termix embedding locally
- [ ] Document X-Frame-Options requirements
- [ ] Add settings validation (URL format)

---

## Phase 6: Pinned Notes

### 6.1 Pinned Notes Store
- [ ] Create `src/stores/pinnedNotesStore.ts`
- [ ] State: `pinnedNotes` array
- [ ] Actions: add, update, delete, reorder, resetToDefaults
- [ ] Default notes seeded on first load:
  - 💡 Ideas (ideas)
  - 📁 Projects (projects)
  - 🛒 Shopping List (shopping-list)
  - 🎁 Gift Ideas (gift-ideas)
  - 🔬 Research Topics (research-topics)
- [ ] Persist with Zustand

### 6.2 Pinned Notes Grid
- [ ] Create `src/components/features/pinned-notes/PinnedNotesGrid.tsx`
- [ ] Responsive grid layout
- [ ] Render PinnedNoteCard for each note
- [ ] Section title: "Pinned Notes"

### 6.3 Pinned Note Card
- [ ] Create `src/components/features/pinned-notes/PinnedNoteCard.tsx`
- [ ] Display: emoji icon, name
- [ ] Click → call `openNote(notepadId)` and open notes sidebar
- [ ] Subtle hover state

### 6.4 Pinned Notes in Settings
- [ ] Create `src/components/features/settings/PinnedNotesSection.tsx`
- [ ] List current pinned notes with edit/delete buttons
- [ ] Add form: name, emoji picker, notepad ID
- [ ] Drag-and-drop reordering
- [ ] "Reset to Defaults" button with confirmation

### 6.5 Integration
- [ ] Clicking pinned note opens notes sidebar if closed
- [ ] If already open, updates iframe URL
- [ ] Verify Dumbpad loads with correct note

---

## Phase 7: Server Status

### 7.1 Termix Service
- [ ] Create `src/services/termix.ts`
- [ ] Constructor reads URL and token from settings
- [ ] Implement `getHosts()` → list of hosts
- [ ] Implement `getStatus()` → online/offline per host
- [ ] Implement `getMetrics(hostId)` → CPU, memory, disk
- [ ] Handle auth errors, network errors

### 7.2 Types
- [ ] Create `src/types/termix.ts`:
  ```typescript
  interface Host { id, name, ... }
  interface HostStatus { hostId, online, lastSeen }
  interface HostMetrics { cpu, memory, disk }
  ```

### 7.3 Server Status Grid
- [ ] Create `src/components/features/server-status/ServerStatusGrid.tsx`
- [ ] Fetch hosts on mount
- [ ] Poll status every 60 seconds
- [ ] Section title: "Server Status"
- [ ] Manual refresh button
- [ ] "Last updated" timestamp

### 7.4 Server Status Card
- [ ] Create `src/components/features/server-status/ServerStatusCard.tsx`
- [ ] Display: host name, status dot (green/red)
- [ ] If online: CPU, memory, disk progress bars
- [ ] If offline: "Last seen: X ago"
- [ ] Subtle pulse animation on status dot

### 7.5 Error Handling
- [ ] Show empty state if no Termix config
- [ ] Show error state if API fails
- [ ] Retry button on error
- [ ] Don't break entire dashboard if Termix unavailable

### 7.6 Polling Logic
- [ ] Use `useEffect` with `setInterval`
- [ ] Clear interval on unmount
- [ ] Configurable interval (default 60s)
- [ ] Pause polling when tab not visible (optional optimization)

---

## Phase 8: Snippets

### 8.1 ByteStash Service
- [ ] Create `src/services/bytestash.ts`
- [ ] Constructor reads URL and API key from settings
- [ ] Implement `searchSnippets(query)` → array of snippets
- [ ] Implement `getSnippet(id)` → full snippet with code
- [ ] Implement `createSnippet(input)` → new snippet
- [ ] Handle auth errors

### 8.2 Types
- [ ] Create `src/types/snippet.ts`:
  ```typescript
  interface Fragment { id, file_name, code, language }
  interface Snippet { id, title, description, categories, fragments }
  ```

### 8.3 Snippets Popover
- [ ] `npx shadcn@latest add popover`
- [ ] Create `src/components/features/snippets/SnippetsPopover.tsx`
- [ ] Anchor to snippets icon in header
- [ ] Width: ~400px, max-height: 500px with scroll
- [ ] Close on Escape or click outside

### 8.4 Snippet List
- [ ] Create `src/components/features/snippets/SnippetList.tsx`
- [ ] Search input at top
- [ ] Debounced search (300ms)
- [ ] Display: title, language badge, category tags
- [ ] Click → expand to SnippetView
- [ ] Empty state: "No snippets found"

### 8.5 Snippet View
- [ ] Create `src/components/features/snippets/SnippetView.tsx`
- [ ] Back button to return to list
- [ ] Title and tags
- [ ] Code block with syntax highlighting
- [ ] Multi-fragment: tabs or accordion
- [ ] Copy button → copies code to clipboard
- [ ] "Open in ByteStash" link

### 8.6 Snippet Form
- [ ] Create `src/components/features/snippets/SnippetForm.tsx`
- [ ] "New Snippet" button at bottom of popover
- [ ] Fields: title, language dropdown, code textarea
- [ ] Submit → create via API
- [ ] Success → add to list, show confirmation
- [ ] Cancel → return to list

### 8.7 Keyboard Shortcut
- [ ] `Mod+Shift+S` opens snippets popover
- [ ] Add to useKeyboardShortcuts

### 8.8 Header Icon
- [ ] Add `</>` or code icon to header
- [ ] Wire to open snippets popover

---

## Phase 9: Command Palette

### 9.1 Command Component
- [ ] `npx shadcn@latest add command` (uses cmdk)
- [ ] Create `src/components/features/command-palette/CommandPalette.tsx`
- [ ] Modal overlay, centered
- [ ] Search input with fuzzy matching

### 9.2 Action Registry
- [ ] Define all available actions:
  ```typescript
  { id, label, shortcut?, icon?, action: () => void, keywords?: string[] }
  ```
- [ ] Actions: Open AI Chat, Open Notes, Toggle Terminal, Open Settings, Open Snippets
- [ ] Dynamic: Launch workflow (for each workflow)
- [ ] Dynamic: Open pinned note (for each note)
- [ ] Dynamic: Recent conversations (from chat store)

### 9.3 Command Palette UI
- [ ] Group results: Actions, Workflows, Pinned Notes, Recent Chats
- [ ] Show keyboard shortcut hints
- [ ] Arrow key navigation
- [ ] Enter to execute
- [ ] Escape to close

### 9.4 Keyboard Shortcut
- [ ] `Mod+K` opens command palette
- [ ] Focus search input on open
- [ ] Wire in useKeyboardShortcuts

### 9.5 Integration
- [ ] Add to uiStore: `commandPaletteOpen`
- [ ] Wire to App.tsx

---

## Phase 10: Polish & Deploy

### 10.1 Theme Finalization
- [ ] Audit all components in light mode
- [ ] Audit all components in dark mode
- [ ] Fix any color inconsistencies
- [ ] Implement system theme detection
- [ ] Add smooth transition between themes

### 10.2 Accessibility Audit
- [ ] All buttons have accessible names
- [ ] All icon buttons have aria-labels
- [ ] Focus visible on all interactive elements
- [ ] Logical tab order
- [ ] Test with keyboard-only navigation
- [ ] Color contrast check (4.5:1 minimum)

### 10.3 Performance
- [ ] Add React.lazy for AIChatSidebar
- [ ] Add React.lazy for NotesSidebar
- [ ] Add React.lazy for SettingsDialog
- [ ] Add React.lazy for SnippetsPopover
- [ ] Verify bundle size (`npm run build`, check dist)
- [ ] Add loading skeletons where needed

### 10.4 Error Boundaries
- [ ] Create ErrorBoundary component
- [ ] Wrap major sections (chat, status, etc.)
- [ ] Show friendly error message with retry

### 10.5 Docker Finalization
- [ ] Review Dockerfile for production best practices
- [ ] Ensure nginx config handles all routes
- [ ] Add health check endpoint (or static file check)
- [ ] Test full build and run cycle
- [ ] Document environment variables (if any)

### 10.6 Browser Extension
- [ ] Create `extension/manifest.json` (Manifest V3)
- [ ] Create `extension/background.js` with redirect logic
- [ ] Add extension icons (16, 48, 128)
- [ ] Build extension: copy dist + manifest
- [ ] Test in Chrome
- [ ] Test in Firefox (may need separate manifest)

### 10.7 Documentation
- [ ] Write README.md:
  - Project description
  - Screenshots
  - Features list
  - Prerequisites
  - Installation (Docker)
  - Installation (Extension)
  - Configuration
  - Keyboard shortcuts
  - Development setup
  - Contributing
  - License
- [ ] Add screenshots to repo
- [ ] Document iframe requirements for Dumbpad/Termix

### 10.8 Final Testing
- [ ] Full walkthrough of all features
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on mobile viewport (responsive)
- [ ] Test with no API keys configured (graceful degradation)
- [ ] Test with invalid API keys (error handling)

---

## Post-MVP Backlog

### Chat Enhancements
- [ ] Image attachment support
- [ ] Extended thinking visualization
- [ ] Search across conversations
- [ ] Export conversation as markdown

### Backend Proxy
- [ ] Create simple Node.js backend
- [ ] Proxy API requests
- [ ] Store API keys server-side
- [ ] Add authentication

### Additional Widgets
- [ ] Weather widget
- [ ] Calendar widget
- [ ] RSS feed reader
- [ ] Home Assistant entities

### Advanced
- [ ] Custom CSS theme import
- [ ] Plugin/widget system
- [ ] Multi-device sync
- [ ] Keyboard shortcut customization

---

*Check off tasks as you complete them. Each task should result in a testable change.*
