# Feature Specification: Mashb0ard

> **Status:** Draft  
> **Last Updated:** 2025-01-05  
> **Companion Docs:** DESIGN.md, UI_UX.md

---

## Feature Overview

| Feature | Priority | Status | Complexity |
|---------|----------|--------|------------|
| AI Chat Sidebar | P0 | Planned | High |
| Workflow Launcher | P0 | Planned | Medium |
| Quick Links | P0 | Planned | Low |
| Notes Sidebar | P1 | Planned | Low |
| Terminal Panel | P1 | Planned | Medium |
| Server Status Widgets | P1 | Planned | Medium |
| Keyboard Navigation | P0 | Planned | Medium |
| Theming / Dark Mode | P2 | Planned | Low |
| Settings Panel | P1 | Planned | Medium |

**Priority Key:**
- P0 = Must have for MVP
- P1 = Should have for MVP
- P2 = Nice to have, can ship without

---

## Feature: AI Chat Sidebar

### Description

A slide-out sidebar providing multi-provider AI chat via OpenRouter. Users can quickly query AI models, switch providers, maintain conversation history, and transfer conversations between sessions.

### User Stories

**Core Chat:**
- As a user, I want to open an AI chat sidebar with a keyboard shortcut so that I can quickly ask questions without leaving my dashboard.
- As a user, I want to send messages and see streaming responses so that I get immediate feedback.
- As a user, I want to copy any AI response to clipboard with one click so that I can use it elsewhere.
- As a user, I want to see my conversation history so that I can reference previous exchanges.

**Multi-Provider:**
- As a user, I want to switch between AI providers (Claude, GPT-4, Gemini, etc.) so that I can use the best model for my task.
- As a user, I want to switch providers with a keyboard shortcut (e.g., `Mod+1`, `Mod+2`) so that I can change quickly without mouse interaction.
- As a user, I want switching providers to start a fresh conversation so that I don't get confused context bleed between models.

**Message Editing:**
- As a user, I want to edit a previous message and resubmit so that I can refine my question without retyping.
- As a user, I want resubmitting an edited message to regenerate from that point so that the conversation branches cleanly.

**Image Attachment:**
- As a user, I want to attach an image to my message so that I can ask questions about visual content.
- As a user, I want to see a thumbnail preview of attached images before sending so that I know what I'm submitting.
- As a user, I want the system to warn me if I select a non-vision model with an image attached so that I don't waste a query.

**Extended Thinking:**
- As a user, I want to enable "deep reasoning" mode so that the AI thinks more carefully about complex problems.
- As a user, I want to see the model's thinking process (when available) so that I understand its reasoning.
- As a user, I want deep reasoning to fall back to chain-of-thought prompting for models that don't support extended thinking natively.

**Session Transfer:**
- As a user, I want a "Continue in New Session" button so that I can transfer context to a different model.
- As a user, I want to choose between copying the full conversation or generating a summary when transferring sessions.
- As a user, I want to select which model to use for the new session (and optionally which model generates the summary).
- As a user, I want the summary to be injected as invisible system context so that the new conversation feels clean.

**History Management:**
- As a user, I want my conversations to persist across browser sessions so that I don't lose context.
- As a user, I want to view a list of past conversations so that I can resume previous chats.
- As a user, I want to delete conversations I no longer need so that I can keep my history tidy.

### Acceptance Criteria

**Core:**
- [ ] Sidebar opens/closes with `Mod+/` keyboard shortcut
- [ ] Messages stream in real-time (SSE from OpenRouter)
- [ ] Each response has a visible copy button
- [ ] Copy button provides visual feedback on click (checkmark or similar)
- [ ] Conversation scrolls to bottom on new messages
- [ ] Input field supports multi-line with `Shift+Enter`
- [ ] `Mod+Enter` sends message

**Multi-Provider:**
- [ ] Provider selector dropdown shows available models
- [ ] Models grouped by provider (Anthropic, OpenAI, Google, Meta, etc.)
- [ ] Switching provider clears current conversation (starts fresh)
- [ ] Keyboard shortcuts `Mod+1` through `Mod+5` switch to favorite/pinned models
- [ ] Current model displayed in sidebar header

**Message Editing:**
- [ ] Hover on user message reveals edit button
- [ ] Edit mode replaces message text with editable input
- [ ] Submitting edit removes all messages after that point and resubmits
- [ ] Cancel edit restores original message

**Image Attachment:**
- [ ] Attachment button (paperclip icon) opens file picker
- [ ] Drag-and-drop onto input area attaches image
- [ ] Paste image from clipboard attaches image
- [ ] Thumbnail preview shown before sending
- [ ] Warning displayed if non-vision model selected with image
- [ ] Images sent as base64 to OpenRouter

**Extended Thinking:**
- [ ] Toggle for "Deep Reasoning" mode visible in sidebar
- [ ] When enabled, uses `thinking` parameter for Claude models
- [ ] For non-Claude models, prepends "Think step by step" to system prompt
- [ ] Thinking content displayed in collapsible block (if returned by model)

**Session Transfer:**
- [ ] "Continue in New Session" button visible at bottom of chat
- [ ] Modal opens with: model selector, transfer method (full/summary), summary model selector
- [ ] Full copy: all messages transferred as-is to new conversation
- [ ] Summary: generates summary, injects as system message in new conversation
- [ ] Summary model defaults to current model, configurable in settings
- [ ] New session opens immediately after transfer

**History:**
- [ ] Conversations saved to localStorage (keyed by unique ID)
- [ ] History panel accessible from sidebar
- [ ] Each history item shows: title (first message truncated), date, model used
- [ ] Click history item loads that conversation
- [ ] Delete button on each history item (with confirmation)

### Technical Notes

- **API:** OpenRouter (https://openrouter.ai/api/v1/chat/completions)
- **Auth:** User's OpenRouter API key stored in settings
- **Streaming:** Use `stream: true` parameter, handle SSE events
- **Vision:** Send images as base64 in `content` array with `type: "image_url"`
- **Extended Thinking:** Use `thinking` parameter for Anthropic models via OpenRouter
- **Storage:** localStorage for MVP; consider IndexedDB for larger history later

---

## Feature: Workflow Launcher

### Description

Grouped links that open multiple related tabs with a single click or keyboard shortcut. Enables quick context-switching between different work modes (3D printing, news reading, home lab, etc.).

### User Stories

- As a user, I want to define workflow groups (e.g., "3D Printing", "News", "Home Lab") so that I can organize related links together.
- As a user, I want each workflow group to contain multiple URLs so that launching one opens all related sites.
- As a user, I want to launch a workflow with one click so that I don't have to open tabs manually.
- As a user, I want to launch workflows with keyboard shortcuts (e.g., `Mod+Shift+1`) so that I can switch contexts quickly.
- As a user, I want to customize the icon and color for each workflow so that I can visually distinguish them.
- As a user, I want to add, edit, and remove workflows so that I can keep my launcher current.
- As a user, I want to reorder workflows so that my most-used ones are first.

### Acceptance Criteria

- [ ] Workflow groups displayed as cards/buttons in main dashboard area
- [ ] Each workflow shows: icon, name, link count
- [ ] Clicking workflow opens all links in new tabs
- [ ] `Mod+Shift+[1-9]` launches workflow by position
- [ ] Add workflow: modal with name, icon picker, color picker, URL list
- [ ] Edit workflow: same modal, pre-populated
- [ ] Delete workflow: confirmation dialog
- [ ] Drag-and-drop reordering of workflows
- [ ] Workflows persist to localStorage
- [ ] Empty state prompts user to create first workflow

### Technical Notes

- **Storage:** localStorage JSON array of workflow objects
- **Schema:**
  ```json
  {
    "id": "uuid",
    "name": "3D Printing",
    "icon": "printer",
    "color": "#ff6b6b",
    "urls": [
      { "title": "Printables", "url": "https://printables.com" },
      { "title": "OctoPrint", "url": "https://octoprint.local" }
    ],
    "order": 0
  }
  ```
- **Tab Opening:** Use `window.open()` for each URL; opens as separate tabs
- **Vivaldi Users:** Tabs open normally; users can manually stack via Shift-select → right-click → "Stack Selected Tabs". No programmatic access to Vivaldi's tab stacking API currently available.
- **Future Enhancement:** Investigate Vivaldi command palette automation or extension APIs for native stacking support

---

## Feature: Quick Links

### Description

Individual frequently-used links organized in customizable groups. Similar to bookmarks but more visible and keyboard-accessible.

### User Stories

- As a user, I want to add quick links to sites I visit frequently so that they're always one click away.
- As a user, I want to organize links into groups (e.g., "Self-Hosted", "Social", "Tools") so that related links are together.
- As a user, I want each link to show a favicon or custom icon so that I can identify them quickly.
- As a user, I want to click a link to open it in a new tab so that my dashboard stays open.
- As a user, I want to navigate links with keyboard (arrow keys when focused) so that I can launch without mouse.
- As a user, I want to add, edit, and remove links so that I can keep them current.
- As a user, I want to reorder links within groups and reorder groups so that my layout is optimized.

### Acceptance Criteria

- [ ] Links displayed in grid/list within labeled groups
- [ ] Each link shows: favicon (auto-fetched or custom), title
- [ ] Click opens link in new tab
- [ ] Keyboard navigation: arrow keys move focus, Enter opens
- [ ] Add link: modal with title, URL, optional icon override, group selector
- [ ] Edit link: same modal, pre-populated
- [ ] Delete link: confirmation or undo toast
- [ ] Drag-and-drop reordering within and between groups
- [ ] Add/edit/delete groups
- [ ] Links and groups persist to localStorage
- [ ] Empty state prompts user to add first link

### Technical Notes

- **Favicon Fetching:** Use `https://www.google.com/s2/favicons?domain={domain}` or similar service
- **Storage:** localStorage JSON structure of groups containing links
- **Schema:**
  ```json
  {
    "groups": [
      {
        "id": "uuid",
        "name": "Self-Hosted",
        "order": 0,
        "links": [
          { "id": "uuid", "title": "Portainer", "url": "https://portainer.local", "icon": null, "order": 0 }
        ]
      }
    ]
  }
  ```

---

## Feature: Notes Sidebar

### Description

A slide-out sidebar embedding Dumbpad for quick note-taking. Provides persistent notes without leaving the dashboard.

### User Stories

- As a user, I want to open a notes sidebar with a keyboard shortcut so that I can capture thoughts quickly.
- As a user, I want the sidebar to load my Dumbpad instance so that my notes are already there.
- As a user, I want the sidebar to remember its open/closed state so that it persists how I left it.
- As a user, I want to resize the sidebar width so that I can see more or less as needed.

### Acceptance Criteria

- [ ] Sidebar opens/closes with `Mod+N` keyboard shortcut
- [ ] Sidebar contains iframe to dumbpad.mattmariani.com
- [ ] iframe loads on sidebar open (lazy load for performance)
- [ ] Sidebar width adjustable via drag handle
- [ ] Width preference persists to localStorage
- [ ] Open/closed state persists to localStorage
- [ ] Sidebar closes on `Escape` key
- [ ] Sidebar pushes or overlays main content (configurable)

### Technical Notes

- **iframe URL:** `https://dumbpad.mattmariani.com`
- **CORS/Framing:** Verify Dumbpad allows iframe embedding (X-Frame-Options)
- **Lazy Loading:** Only mount iframe when sidebar opens
- **State:** Store `{ isOpen: boolean, width: number }` in localStorage

---

## Feature: Terminal Panel

### Description

An embedded SSH terminal panel showing the full Termix interface. Termix is a React SPA without URL-based routing, so we embed the full UI and let users select hosts within Termix itself. The Termix API is used separately to power the Server Status Widgets.

### User Stories

- As a user, I want the Termix terminal embedded in my dashboard so that I can access SSH without leaving.
- As a user, I want to toggle the terminal panel open/closed so that I can reclaim screen space.
- As a user, I want to resize the terminal panel so that I can adjust based on my needs.
- As a user, I want the terminal to remember my session so that I don't have to re-authenticate constantly.

### Acceptance Criteria

- [ ] Terminal panel embeds full Termix UI via iframe (`https://termix.mattmariani.com`)
- [ ] Panel toggle button (expand/collapse)
- [ ] Panel height adjustable via drag handle
- [ ] Height and open state persist to localStorage
- [ ] `Mod+Shift+T` keyboard shortcut toggles terminal panel
- [ ] Loading state while iframe loads
- [ ] Error state if Termix unreachable
- [ ] iframe allows Termix authentication to persist (check cookie/storage policies)

### Technical Notes

- **iframe URL:** `https://termix.mattmariani.com` (full app, no deep-linking available)
- **Host Selection:** Handled within Termix UI (no external deep-link support in Termix currently)
- **Status Data:** Termix API used separately for Server Status Widgets, not for terminal routing
- **Future Enhancement:** If Termix adds URL-based routing, we can add a host selector that deep-links
- **Auth Persistence:** Termix uses JWT; iframe should maintain session if same-origin or CORS configured

---

## Feature: Server Status Widgets

### Description

Dashboard widgets displaying real-time server health information from Termix API. Shows online/offline status and key metrics (CPU, memory, disk) for monitored hosts.

### User Stories

- As a user, I want to see at-a-glance status of my servers so that I know if something needs attention.
- As a user, I want to see online/offline indicators for each host so that I know what's reachable.
- As a user, I want to see CPU, memory, and disk usage so that I can monitor resource consumption.
- As a user, I want status to refresh automatically so that I always see current data.
- As a user, I want to click a status widget to open more details so that I can investigate issues.
- As a user, I want to configure which hosts appear as widgets so that I only see what matters.

### Acceptance Criteria

- [ ] Status widgets displayed in designated dashboard area
- [ ] Each widget shows: host name, status (online/offline), CPU %, memory %, disk %
- [ ] Visual indicators: green for healthy, yellow for warning (>80%), red for critical (>90%) or offline
- [ ] Data fetched from Termix API (`GET /status`, `GET /metrics/{id}`)
- [ ] Auto-refresh every 60 seconds (configurable)
- [ ] Manual refresh button
- [ ] Click widget opens detail view or links to Termix
- [ ] Settings: select which hosts to display as widgets
- [ ] Graceful handling if Termix API unavailable
- [ ] Compact and expanded view options

### Technical Notes

- **Termix API Endpoints:**
  - `GET /status` — all server statuses
  - `GET /metrics/{id}` — detailed metrics per server
- **Polling:** setInterval for auto-refresh, clear on unmount
- **Thresholds:** Configurable in settings (default: warning 80%, critical 90%)
- **Schema (display):**
  ```json
  {
    "hostId": 1,
    "name": "dietpi",
    "status": "online",
    "cpu": 45.2,
    "memory": 62.1,
    "disk": 78.3,
    "lastChecked": "2025-01-05T10:30:00Z"
  }
  ```

---

## Feature: Keyboard Navigation

### Description

Comprehensive keyboard shortcuts for all major actions, following the design principle of "10 useful shortcuts with muscle memory > 100 documented but forgotten."

### User Stories

- As a user, I want to open/close sidebars with keyboard shortcuts so that I can navigate without mouse.
- As a user, I want a command palette to discover and execute actions so that I can find features quickly.
- As a user, I want consistent shortcuts across all panels (Escape closes, Mod+Enter submits) so that I don't have to remember different patterns.
- As a user, I want shortcuts that don't conflict with browser defaults so that I don't accidentally close tabs or trigger browser features.
- As a user, I want to see a shortcut hint overlay so that I can learn the shortcuts.

### Acceptance Criteria

**Global Shortcuts:**
- [ ] `Mod+K` — Open command palette
- [ ] `Mod+/` — Toggle AI chat sidebar
- [ ] `Mod+N` — Toggle notes sidebar
- [ ] `Mod+Shift+T` — Toggle terminal panel
- [ ] `Mod+Shift+S` — Open snippets popover
- [ ] `Mod+[1-9]` — Switch AI provider (1-5) or launch workflow (with Shift)
- [ ] `Escape` — Close any open sidebar/modal/palette
- [ ] `?` — Show keyboard shortcut overlay (when not in input)

**Panel-Specific:**
- [ ] `Mod+Enter` — Send message (AI chat), submit form (any modal)
- [ ] Arrow keys — Navigate within focused panel
- [ ] `Enter` — Activate focused item (launch link, select option)

**Command Palette:**
- [ ] Fuzzy search for commands
- [ ] Arrow keys to navigate results
- [ ] Enter to execute
- [ ] Shows keyboard shortcut for each command (if exists)

### Technical Notes

- **Modifier Detection:** Detect OS on load, use `Cmd` for Mac, `Ctrl` for Windows/Linux
- **Event Handling:** Global keydown listener, check for `event.metaKey` or `event.ctrlKey`
- **Conflict Avoidance:** Avoid `Mod+T` (new tab), `Mod+W` (close tab), `Mod+L` (address bar)
  - Note: `Mod+T` may need to be `Mod+Shift+T` or alternative
- **Command Palette:** Render as modal, filter commands on input, execute on select

---

## Feature: Snippets Panel (Popover)

### Description

A popover panel for quick access to code snippets stored in ByteStash. Allows searching, viewing, copying, and creating snippets without leaving the dashboard. Triggered from header icon or command palette.

### User Stories

- As a user, I want to quickly search my snippets so that I can find and copy code I've saved.
- As a user, I want to copy a snippet to clipboard with one click so that I can paste it elsewhere.
- As a user, I want to create a new snippet from the dashboard so that I don't have to open ByteStash directly.
- As a user, I want to see syntax highlighting in snippet previews so that code is readable.

### Acceptance Criteria

**Trigger & Display:**
- [ ] Snippets icon in header (e.g., `</>` or code icon)
- [ ] Click opens popover anchored to icon
- [ ] `Mod+Shift+S` keyboard shortcut opens popover
- [ ] Popover appears in command palette results ("Open Snippets")
- [ ] Escape or click outside closes popover

**Search & Browse:**
- [ ] Search input at top of popover
- [ ] Search calls ByteStash API (`GET /api/v1/snippets/search?q=term`)
- [ ] Results show: title, language badge, category tags
- [ ] Results update as user types (debounced 300ms)
- [ ] Empty state when no results

**Snippet View:**
- [ ] Click snippet to expand/view content
- [ ] Syntax highlighting for code (highlight.js)
- [ ] Copy button copies snippet code to clipboard
- [ ] "Open in ByteStash" link for full editing
- [ ] Multi-fragment snippets show fragment tabs

**Create Snippet:**
- [ ] "New Snippet" button at bottom of popover
- [ ] Opens mini-form: title, language dropdown, code textarea
- [ ] Submit calls ByteStash API (`POST /api/v1/snippets/push`)
- [ ] Success notification and snippet appears in list
- [ ] Cancel returns to search view

**State:**
- [ ] Remember last search query during session
- [ ] Loading states for API calls
- [ ] Error state if ByteStash unreachable

### Technical Notes

- **ByteStash API Base:** Configured in settings (e.g., `https://bytestash.mattmariani.com`)
- **Auth:** API key via `x-api-key` header (stored in settings)
- **Endpoints:**
  - `GET /api/v1/snippets/search?q=term` — search
  - `GET /api/v1/snippets/{id}` — get full snippet
  - `POST /api/v1/snippets/push` — create new
- **Popover Size:** ~400px wide, max 500px tall with scroll
- **Syntax Highlighting:** Use highlight.js (same as Dumbpad uses)

---

## Feature: Pinned Notes

### Description

A dedicated section on the dashboard for quick access to specific Dumbpad notes. Clicking a pinned note opens the Notes sidebar with that specific note loaded via URL parameter. Categories are user-configurable with sensible defaults.

### User Stories

- As a user, I want quick access to my most important notes (shopping list, ideas, etc.) so that I can view/edit them instantly.
- As a user, I want clicking a pinned note to open it in the sidebar so that I stay in my dashboard.
- As a user, I want to customize which notes are pinned so that I can organize based on my needs.
- As a user, I want to add new pinned note categories so that I can expand my quick access list.

### Acceptance Criteria

**Display:**
- [ ] "Pinned Notes" section on dashboard (separate from Quick Links)
- [ ] Each pinned note shows: icon, name
- [ ] Visual distinction from Quick Links (different card style or icon treatment)
- [ ] Grid or list layout (consistent with Quick Links style)

**Interaction:**
- [ ] Click pinned note → Notes sidebar opens
- [ ] Notes sidebar iframe loads with `?id={notepadName}` parameter
- [ ] If sidebar already open, iframe URL updates to new note
- [ ] Keyboard shortcut: `Mod+Shift+[1-5]` for first 5 pinned notes (if not conflicting)

**Configuration:**
- [ ] Pinned notes configurable in Settings
- [ ] Add new pinned note: name, icon (optional), notepad ID
- [ ] Remove pinned note
- [ ] Reorder via drag-and-drop
- [ ] Default pinned notes (created on first load):
  - 💡 Ideas
  - 📁 Projects
  - 🛒 Shopping List
  - 🎁 Gift Ideas
  - 🔬 Research Topics

**Notepad ID Handling:**
- [ ] Notepad ID = name used in Dumbpad URL (case-insensitive per Dumbpad docs)
- [ ] Validate format (no special characters that break URLs)
- [ ] If notepad doesn't exist, Dumbpad creates it automatically

### Technical Notes

- **Dumbpad URL Pattern:** `https://dumbpad.mattmariani.com/?id={notepadName}`
- **Storage:** localStorage array of pinned note objects
- **Schema:**
  ```json
  {
    "id": "uuid",
    "name": "Shopping List",
    "icon": "🛒",
    "notepadId": "shopping-list",
    "order": 0
  }
  ```
- **Defaults:** Seeded on first load if no pinned notes exist
- **Sidebar Behavior:** If Notes sidebar closed, open it. If open, update iframe src.

---

## Feature: Settings Panel

### Description

Centralized configuration for API keys, service URLs, AI preferences, pinned notes, and customization options.

### User Stories

- As a user, I want to configure my OpenRouter API key so that AI chat works.
- As a user, I want to configure my Termix credentials so that terminal and status features work.
- As a user, I want to configure my ByteStash credentials so that snippets work.
- As a user, I want to set my preferred AI models so that they appear in quick-switch slots.
- As a user, I want to configure the summary model for session transfers so that I control the quality/cost tradeoff.
- As a user, I want to manage my pinned notes so that I can customize quick access.
- As a user, I want to toggle dark/light mode so that the dashboard matches my preference.
- As a user, I want to import/export my settings so that I can backup or transfer to another browser.

### Acceptance Criteria

- [ ] Settings accessible via gear icon and `Mod+,` shortcut
- [ ] Sections: API Keys & Services, AI Preferences, Pinned Notes, Appearance, Data

**API Keys & Services:**
- [ ] OpenRouter API key input (masked, show/hide toggle)
- [ ] Termix URL, JWT token
- [ ] Dumbpad URL
- [ ] ByteStash URL, API key

**AI Preferences:**
- [ ] Favorite models (for Mod+1-5 quick switch)
- [ ] Default model dropdown
- [ ] Summary model for session transfer
- [ ] Deep reasoning default toggle

**Pinned Notes:**
- [ ] List of current pinned notes with edit/delete buttons
- [ ] Add new: name, icon picker (emoji), notepad ID
- [ ] Drag-and-drop reordering
- [ ] Reset to defaults button

**Appearance:**
- [ ] Dark/light/system theme toggle
- [ ] Sidebar behavior (push/overlay)

**Data:**
- [ ] Export settings (JSON download)
- [ ] Import settings (JSON upload)
- [ ] Clear all data (with confirmation modal)

- [ ] Settings persist to localStorage
- [ ] Sensitive fields (API keys) stored with consideration for security (see Technical Notes)

### Technical Notes

- **Storage:** localStorage for settings object
- **Security:** API keys in localStorage are not truly secure (accessible via devtools). For MVP this is acceptable given self-hosted/personal use. Document the risk. Future: consider encrypted storage or backend proxy.
- **Schema:**
  ```json
  {
    "openRouterKey": "sk-...",
    "termix": {
      "baseUrl": "https://termix.mattmariani.com",
      "token": "jwt..."
    },
    "dumbpad": {
      "baseUrl": "https://dumbpad.mattmariani.com"
    },
    "bytestash": {
      "baseUrl": "https://bytestash.mattmariani.com",
      "apiKey": "..."
    },
    "ai": {
      "defaultModel": "anthropic/claude-3.5-sonnet",
      "favoriteModels": ["anthropic/claude-3.5-sonnet", "openai/gpt-4", ...],
      "summaryModel": "anthropic/claude-3-haiku",
      "deepReasoningDefault": false
    },
    "pinnedNotes": [
      { "id": "uuid", "name": "Ideas", "icon": "💡", "notepadId": "ideas", "order": 0 },
      { "id": "uuid", "name": "Projects", "icon": "📁", "notepadId": "projects", "order": 1 },
      { "id": "uuid", "name": "Shopping List", "icon": "🛒", "notepadId": "shopping-list", "order": 2 },
      { "id": "uuid", "name": "Gift Ideas", "icon": "🎁", "notepadId": "gift-ideas", "order": 3 },
      { "id": "uuid", "name": "Research Topics", "icon": "🔬", "notepadId": "research-topics", "order": 4 }
    ],
    "appearance": {
      "theme": "dark",
      "sidebarBehavior": "push"
    }
  }
  ```

---

## Feature: Theming / Dark Mode

### Description

Support for dark and light themes with system preference detection.

### User Stories

- As a user, I want to choose between dark and light mode so that the dashboard is comfortable for my environment.
- As a user, I want a "system" option that follows my OS preference so that it automatically adjusts.
- As a user, I want the theme to persist so that I don't have to set it every time.

### Acceptance Criteria

- [ ] Three theme options: Light, Dark, System
- [ ] System option uses `prefers-color-scheme` media query
- [ ] Theme toggle in header or settings
- [ ] Theme persists to localStorage
- [ ] All UI components respect theme
- [ ] Smooth transition when switching themes
- [ ] Default to System on first load

### Technical Notes

- **CSS Strategy:** CSS variables for colors, switch variable values based on theme class on `<html>` or `<body>`
- **Detection:** `window.matchMedia('(prefers-color-scheme: dark)')`
- **Persistence:** Store preference in settings localStorage

---

## Open Questions

- [ ] Command palette: should it include search functionality (search links, history)?
- [ ] Should workflows support a "preview" mode showing which URLs will open before launching?

## Resolved Questions

| Question | Resolution |
|----------|------------|
| Termix iframe URL pattern | No deep-linking; embed full Termix UI, use API for status widgets only |
| Keyboard shortcut for terminal | `Mod+Shift+T` (avoids browser conflict with `Mod+T`) |
| Workflow tab opening (Vivaldi) | Opens tabs normally; document manual stacking for Vivaldi users |

---

*This document will be updated as features are refined. See UI_UX.md for visual design and interaction patterns.*
