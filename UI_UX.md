# UI/UX Specification: Mashb0ard

> **Status:** Draft  
> **Last Updated:** 2025-01-05  
> **Companion Docs:** DESIGN.md, FEATURES.md

---

## Design Philosophy

### Ambient Guidance
The UI guides workflow intuitively — users receive direction without conscious awareness of being guided. Information hierarchy, visual affordances, and subtle animation surface what matters *right now*.

**Core Tenets:**
- **Show, don't tell:** No tooltips explaining what to do next; the design makes it obvious
- **Respect focus:** Never interrupt active work; queue attention cues for natural break points
- **Progressive disclosure:** Complexity exists but stays hidden until needed

### Keyboard-First
10 highly-used shortcuts with muscle memory > 100 documented but forgotten. Every shortcut earns its place through daily use.

### Workspace, Not Launcher
Users do work *here*, not just launch to other places. Panels embed functionality rather than linking away (except for workflow link groups).

---

## Layout Architecture

### Primary Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                            [icons] │
│  [Logo] [Search/Command Bar]                      [Theme] [Settings] [?]   │
├─────────────────────────────────────────────────────────────────────────────┤
│         │                                                         │         │
│         │                                                         │         │
│   AI    │                    MAIN CONTENT                         │  NOTES  │
│  CHAT   │                                                         │ SIDEBAR │
│ SIDEBAR │  ┌─────────────────────────────────────────────────┐    │         │
│         │  │  Workflow Launcher  │  Quick Links              │    │         │
│  (left) │  ├─────────────────────────────────────────────────┤    │ (right) │
│         │  │                                                 │    │         │
│         │  │  Server Status Widgets                          │    │         │
│         │  │                                                 │    │         │
│         │  └─────────────────────────────────────────────────┘    │         │
│         │                                                         │         │
│         │  ┌─────────────────────────────────────────────────┐    │         │
│         │  │                                                 │    │         │
│         │  │  TERMINAL PANEL (collapsible, bottom)           │    │         │
│         │  │                                                 │    │         │
│         │  └─────────────────────────────────────────────────┘    │         │
│         │                                                         │         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Zones

| Zone | Position | Behavior | Default State |
|------|----------|----------|---------------|
| Header | Top, fixed | Always visible | Visible |
| AI Chat Sidebar | Left | Slide-out, push or overlay (configurable) | Closed |
| Notes Sidebar | Right | Slide-out, push or overlay (configurable) | Closed |
| Main Content | Center | Scrollable, contains widgets | Visible |
| Terminal Panel | Bottom | Collapsible, resizable | Closed |

### Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop | >1200px | Full layout, sidebars push content |
| Tablet | 768-1200px | Sidebars overlay, terminal full-width |
| Mobile | <768px | Single column, sidebars full-screen overlay |

---

## Screen Inventory

### 1. Dashboard (Default View)

**Purpose:** Home base showing quick access items and status at a glance.

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Mashb0ard            [Mod+K to search...]  </> 🌙 ⚙️  ?    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WORKFLOWS                                    QUICK LINKS       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         ┌────────────────┐│
│  │ 🖨️      │ │ 📰      │ │ 🏠      │         │ Self-Hosted    ││
│  │3D Print │ │ News    │ │Home Lab │         │ ├─ Portainer   ││
│  │ 4 links │ │ 3 links │ │ 5 links │         │ ├─ Proxmox     ││
│  └─────────┘ └─────────┘ └─────────┘         │ ├─ Home Asst   ││
│  [+ Add Workflow]                             │ └─ Pihole      ││
│                                               │                ││
│  PINNED NOTES                                 │ Social         ││
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │ ├─ GitHub      ││
│  │ 💡    │ │ 📁    │ │ 🛒    │ │ 🎁    │     │ ├─ Twitter     ││
│  │ Ideas │ │Project│ │ Shop  │ │ Gifts │     │ └─ Reddit      ││
│  └───────┘ └───────┘ └───────┘ └───────┘     └────────────────┘│
│  ┌───────┐                                                     │
│  │ 🔬    │                                    [+ Add Link]     │
│  │Research│                                                    │
│  └───────┘                                                     │
│                                                                 │
│  SERVER STATUS                                                  │
│  ┌──────────────────────────────────────┐                      │
│  │ dietpi      ● Online                 │                      │
│  │ CPU 23%  MEM 45%  DISK 67%           │                      │
│  ├──────────────────────────────────────┤                      │
│  │ ubuntu       ● Online                │                      │
│  │ CPU 12%  MEM 38%  DISK 45%           │                      │
│  └──────────────────────────────────────┘                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  TERMINAL                                          [▲ Expand]   │
│  ─────────────────────────────────────────────────────────────  │
│  Termix iframe when expanded                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Header with logo, command bar, snippets icon (`</>`), and action icons
- Workflow cards in a responsive grid
- **Pinned Notes** section with emoji icons (click opens Notes sidebar with that note)
- Quick links in collapsible groups
- Server status widgets showing host health
- Collapsible terminal panel at bottom

---

### 2. Snippets Popover

**Purpose:** Quick access to search, view, and copy code snippets from ByteStash.

```
                                    ┌─────────────────────────────────┐
                                    │  SNIPPETS                   [✕] │
                                    ├─────────────────────────────────┤
                                    │  🔍 Search snippets...          │
                                    ├─────────────────────────────────┤
                                    │                                 │
                                    │  ┌─────────────────────────────┐│
                                    │  │ nginx-reverse-proxy         ││
                                    │  │ [nginx] [devops]            ││
                                    │  └─────────────────────────────┘│
                                    │  ┌─────────────────────────────┐│
                                    │  │ docker-compose-template     ││
                                    │  │ [yaml] [docker]             ││
                                    │  └─────────────────────────────┘│
                                    │  ┌─────────────────────────────┐│
                                    │  │ python-api-boilerplate      ││
                                    │  │ [python] [api]              ││
                                    │  └─────────────────────────────┘│
                                    │                                 │
                                    │  ─────────────────────────────  │
                                    │  [+ New Snippet]                │
                                    └─────────────────────────────────┘
```

**Expanded Snippet View:**
```
                                    ┌─────────────────────────────────┐
                                    │  ← Back         SNIPPETS    [✕] │
                                    ├─────────────────────────────────┤
                                    │  nginx-reverse-proxy            │
                                    │  [nginx] [devops]               │
                                    ├─────────────────────────────────┤
                                    │  ┌─────────────────────────────┐│
                                    │  │ server {                    ││
                                    │  │   listen 80;                ││
                                    │  │   server_name example.com;  ││
                                    │  │   location / {              ││
                                    │  │     proxy_pass http://...   ││
                                    │  │   }                         ││
                                    │  │ }                           ││
                                    │  └─────────────────────────────┘│
                                    │                                 │
                                    │  [📋 Copy]  [↗ Open in ByteStash]│
                                    └─────────────────────────────────┘
```

**Key Elements:**
- Search input with live filtering
- Snippet list with title and tags
- Click to expand and view code
- Syntax highlighting
- Copy to clipboard button
- Link to open in full ByteStash UI

---

### 2. AI Chat Sidebar (Open)

**Purpose:** Multi-provider AI chat with conversation management.

```
┌──────────────────────────────────┬──────────────────────────────┐
│  AI CHAT                    [✕]  │                              │
├──────────────────────────────────┤                              │
│  [Claude 3.5 Sonnet ▼] [⚡Deep]  │                              │
├──────────────────────────────────┤                              │
│                                  │                              │
│  ┌────────────────────────────┐  │        MAIN CONTENT          │
│  │ You               [✏️]     │  │        (pushed right)        │
│  │ How do I configure nginx   │  │                              │
│  │ for reverse proxy?         │  │                              │
│  └────────────────────────────┘  │                              │
│                                  │                              │
│  ┌────────────────────────────┐  │                              │
│  │ Claude            [📋]     │  │                              │
│  │ To configure nginx as a    │  │                              │
│  │ reverse proxy, you'll      │  │                              │
│  │ need to...                 │  │                              │
│  │                            │  │                              │
│  │ ```nginx                   │  │                              │
│  │ server {                   │  │                              │
│  │   listen 80;               │  │                              │
│  │   ...                      │  │                              │
│  │ ```                        │  │                              │
│  │                     [📋]   │  │                              │
│  └────────────────────────────┘  │                              │
│                                  │                              │
│  ──────────────────────────────  │                              │
│  [Continue in New Session...]    │                              │
│  ──────────────────────────────  │                              │
│  ┌────────────────────────────┐  │                              │
│  │ 📎 │ Message...    [Enter] │  │                              │
│  └────────────────────────────┘  │                              │
└──────────────────────────────────┴──────────────────────────────┘
```

**Key Elements:**
- Provider selector dropdown with deep reasoning toggle
- Message list with user/assistant distinction
- Edit button on user messages
- Copy button on assistant messages (per message and per code block)
- "Continue in New Session" action at bottom
- Input area with attachment and submit

---

### 3. Notes Sidebar (Open)

**Purpose:** Quick access to Dumbpad for note-taking.

```
┌──────────────────────────────────┬──────────────────────────────┐
│                                  │  NOTES                  [✕]  │
│                                  ├──────────────────────────────┤
│                                  │                              │
│        MAIN CONTENT              │  ┌────────────────────────┐  │
│        (pushed left)             │  │                        │  │
│                                  │  │   [Dumbpad iframe]     │  │
│                                  │  │                        │  │
│                                  │  │   Full Dumbpad UI      │  │
│                                  │  │   embedded here        │  │
│                                  │  │                        │  │
│                                  │  │                        │  │
│                                  │  │                        │  │
│                                  │  │                        │  │
│                                  │  │                        │  │
│                                  │  │                        │  │
│                                  │  └────────────────────────┘  │
│                                  │                              │
└──────────────────────────────────┴──────────────────────────────┘
```

**Key Elements:**
- Full Dumbpad iframe
- Resizable width via drag handle
- Close button

---

### 4. Terminal Panel (Expanded)

**Purpose:** Embedded SSH terminal via Termix.

```
┌─────────────────────────────────────────────────────────────────┐
│  [Main dashboard content - compressed vertically]               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ═══════════════════ [drag handle] ═══════════════════════════  │
├─────────────────────────────────────────────────────────────────┤
│  TERMINAL                                          [▼ Collapse] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                    [Termix iframe]                        │  │
│  │                                                           │  │
│  │   Full Termix application embedded                        │  │
│  │   User selects host within Termix UI                      │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Drag handle for resizing
- Collapse/expand toggle
- Full Termix iframe (host selection happens within Termix)

---

### 5. Command Palette

**Purpose:** Quick action launcher and navigation (Spotlight-style).

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         ┌─────────────────────────────────────────────┐         │
│         │  🔍 Type a command or search...             │         │
│         ├─────────────────────────────────────────────┤         │
│         │                                             │         │
│         │  Actions                                    │         │
│         │  ├─ 💬 Open AI Chat              Mod+/     │         │
│         │  ├─ 📝 Open Notes                Mod+N     │         │
│         │  ├─ 💻 Toggle Terminal        Mod+Shift+T  │         │
│         │  ├─ ⚙️  Open Settings            Mod+,     │         │
│         │                                             │         │
│         │  Workflows                                  │         │
│         │  ├─ 🖨️  Launch 3D Printing    Mod+Shift+1  │         │
│         │  ├─ 📰 Launch News            Mod+Shift+2  │         │
│         │                                             │         │
│         │  Recent Chats                               │         │
│         │  ├─ "nginx reverse proxy" (Claude)         │         │
│         │  ├─ "docker compose help" (GPT-4)          │         │
│         │                                             │         │
│         └─────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Search input with fuzzy matching
- Grouped results (Actions, Workflows, Recent)
- Keyboard shortcut hints
- Arrow key navigation, Enter to select

---

### 6. Settings Panel

**Purpose:** Configuration for API keys, preferences, pinned notes, and appearance.

```
┌─────────────────────────────────────────────────────────────────┐
│  SETTINGS                                                  [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌───────────────────────────────────────────┐ │
│  │             │  │                                           │ │
│  │ • API Keys  │  │  API KEYS & SERVICES                      │ │
│  │   AI Prefs  │  │                                           │ │
│  │   Pinned    │  │  OpenRouter API Key                       │ │
│  │   Notes     │  │  [sk-or-v1-••••••••••••••••]    [Show]    │ │
│  │   Appearance│  │                                           │ │
│  │   Data      │  │  ByteStash URL                            │ │
│  │             │  │  [https://bytestash.mattmariani.com]      │ │
│  │             │  │                                           │ │
│  │             │  │  ByteStash API Key                        │ │
│  │             │  │  [••••••••••••••••••••••••]     [Show]    │ │
│  │             │  │                                           │ │
│  │             │  │  Termix URL                               │ │
│  │             │  │  [https://termix.mattmariani.com]         │ │
│  │             │  │                                           │ │
│  │             │  │  Termix Token                             │ │
│  │             │  │  [••••••••••••••••••••••••]     [Show]    │ │
│  │             │  │                                           │ │
│  │             │  │  Dumbpad URL                              │ │
│  │             │  │  [https://dumbpad.mattmariani.com]        │ │
│  │             │  │                                           │ │
│  └─────────────┘  └───────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Pinned Notes Section:**
```
┌───────────────────────────────────────────────────────────────┐
│  PINNED NOTES                                                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ≡  💡 Ideas           ideas            [✏️] [🗑️]      │  │
│  │  ≡  📁 Projects        projects         [✏️] [🗑️]      │  │
│  │  ≡  🛒 Shopping List   shopping-list    [✏️] [🗑️]      │  │
│  │  ≡  🎁 Gift Ideas      gift-ideas       [✏️] [🗑️]      │  │
│  │  ≡  🔬 Research        research-topics  [✏️] [🗑️]      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  [+ Add Pinned Note]              [Reset to Defaults]         │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Sections:**
- API Keys & Services: OpenRouter, ByteStash, Termix, Dumbpad URLs and credentials
- AI Preferences: Default model, favorites, summary model, deep reasoning default
- Pinned Notes: List with drag-to-reorder, add/edit/delete, reset to defaults
- Appearance: Theme (light/dark/system), sidebar behavior
- Data: Export/import settings, clear all data

---

### 7. Session Transfer Modal

**Purpose:** Transfer AI conversation context to a new session/model.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         ┌─────────────────────────────────────────────┐         │
│         │  CONTINUE IN NEW SESSION                    │         │
│         ├─────────────────────────────────────────────┤         │
│         │                                             │         │
│         │  Target Model                               │         │
│         │  [GPT-4 Turbo                          ▼]   │         │
│         │                                             │         │
│         │  Transfer Method                            │         │
│         │  ○ Copy full conversation                   │         │
│         │  ● Generate summary                         │         │
│         │                                             │         │
│         │  Summary Model                              │         │
│         │  [Use current model                    ▼]   │         │
│         │                                             │         │
│         │  ┌───────────────────────────────────────┐  │         │
│         │  │ Summary will be injected as system   │  │         │
│         │  │ context (not visible in chat).       │  │         │
│         │  └───────────────────────────────────────┘  │         │
│         │                                             │         │
│         │           [Cancel]    [Create Session]      │         │
│         │                                             │         │
│         └─────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Quick AI Query

```
1. User on dashboard
   │
2. Press Mod+/ (or click AI icon)
   │
3. AI Chat sidebar slides open
   │
4. Type question in input
   │
5. Press Enter (or Mod+Enter)
   │
6. See streaming response
   │
7. Click copy button on response (if needed)
   │
8. Press Escape to close sidebar (or leave open)
```

### Flow 2: Launch Workflow

```
1. User on dashboard
   │
2. Click workflow card (or press Mod+Shift+[1-9])
   │
3. All workflow URLs open in new tabs
   │
4. (Vivaldi users: manually stack tabs if desired)
```

### Flow 3: Check Server Status

```
1. User on dashboard
   │
2. Server status widgets visible in main area
   │
3. Glance at indicators (green=healthy, yellow=warning, red=critical/offline)
   │
4. Click widget for more details (opens Termix or shows expanded metrics)
```

### Flow 4: Quick SSH Session

```
1. User on dashboard
   │
2. Press Mod+Shift+T (or click terminal toggle)
   │
3. Terminal panel expands, Termix loads
   │
4. Select host within Termix UI
   │
5. Work in terminal
   │
6. Press Mod+Shift+T or click collapse to minimize
```

### Flow 5: Quick Note Capture

```
1. User anywhere in dashboard
   │
2. Press Mod+N (or click notes icon)
   │
3. Notes sidebar slides open with Dumbpad
   │
4. Dumbpad ready for input
   │
5. Press Escape to close when done
```

### Flow 6: Switch AI Provider

```
1. AI Chat sidebar open
   │
2. Click provider dropdown (or press Mod+[1-5])
   │
3. Select new provider/model
   │
4. Current conversation clears (fresh start)
   │
5. Continue chatting with new model
```

### Flow 7: Continue Chat in New Session

```
1. AI Chat sidebar open with existing conversation
   │
2. Click "Continue in New Session"
   │
3. Modal opens with options
   │
4. Select target model
   │
5. Choose transfer method (full copy or summary)
   │
6. Click "Create Session"
   │
7. New conversation starts with transferred context
   │
8. (If summary: summary injected as invisible system context)
```

### Flow 8: Copy a Snippet

```
1. User on dashboard
   │
2. Press Mod+Shift+S (or click </> icon in header)
   │
3. Snippets popover opens
   │
4. Type search query (optional)
   │
5. Click snippet to expand
   │
6. Click "Copy" button
   │
7. Snippet code copied to clipboard
   │
8. Press Escape to close popover
```

### Flow 9: Open a Pinned Note

```
1. User on dashboard
   │
2. See Pinned Notes section with icons (Ideas, Projects, etc.)
   │
3. Click a pinned note (e.g., "Shopping List")
   │
4. Notes sidebar opens
   │
5. iframe loads Dumbpad with ?id=shopping-list
   │
6. User views/edits note
   │
7. Press Escape to close sidebar (changes auto-save in Dumbpad)
```

### Flow 10: Add a New Pinned Note

```
1. User opens Settings (Mod+,)
   │
2. Navigate to "Pinned Notes" section
   │
3. Click "Add Pinned Note"
   │
4. Enter name, select emoji icon, enter notepad ID
   │
5. Click "Save"
   │
6. New pinned note appears on dashboard
```

---

## Component Library

### Buttons

| Variant | Use Case | Visual |
|---------|----------|--------|
| Primary | Main actions (Submit, Save) | Solid accent color, elevated |
| Secondary | Alternative actions | Outline, subtle |
| Ghost | Toolbar actions | No border, hover reveals |
| Danger | Destructive actions | Red tint |
| Icon | Compact actions (copy, edit, close) | Icon only, tooltip on hover |

### Cards

| Type | Use Case | Elements |
|------|----------|----------|
| Workflow Card | Workflow launcher grid | Icon, title, link count, click to launch |
| Link Card | Quick links | Favicon, title, click opens new tab |
| Status Card | Server status | Host name, status dot, metrics bars |

### Sidebars

**Behavior Options:**
- **Push:** Main content compresses to make room
- **Overlay:** Sidebar floats over content with backdrop

**Interaction:**
- Open/close with keyboard shortcut
- Close on Escape
- Drag handle for width adjustment
- Width persists to localStorage

### Inputs

| Type | Use Case | Features |
|------|----------|----------|
| Search/Command | Command palette, search | Icon prefix, placeholder, clear button |
| Chat Input | AI chat | Multi-line, attachment button, send button |
| Text Input | Settings forms | Label, validation, masked option |
| Dropdown | Provider selector, model picker | Search/filter, grouped options |

### Modals

- Centered with backdrop
- Close on Escape or backdrop click
- Focus trap inside modal
- Primary action on right, secondary on left

---

## Keyboard Shortcuts

### Global

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod+K` | Open command palette | Anywhere |
| `Mod+/` | Toggle AI chat sidebar | Anywhere |
| `Mod+N` | Toggle notes sidebar | Anywhere |
| `Mod+Shift+T` | Toggle terminal panel | Anywhere |
| `Mod+Shift+S` | Open snippets popover | Anywhere |
| `Mod+,` | Open settings | Anywhere |
| `Escape` | Close current overlay/sidebar | When overlay open |
| `?` | Show shortcut help | When not in input |

### AI Chat

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod+Enter` | Send message | In chat input |
| `Mod+1` - `Mod+5` | Switch to favorite model | In chat sidebar |
| `Mod+Shift+C` | Copy last response | In chat sidebar |

### Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Move focus forward | Anywhere |
| `Shift+Tab` | Move focus backward | Anywhere |
| `Arrow keys` | Navigate within list/grid | In focused list |
| `Enter` | Activate focused item | On focused element |

### Workflows

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod+Shift+1` - `Mod+Shift+9` | Launch workflow by position | Anywhere |

---

## Visual Design Tokens

### Colors (Dark Theme)

| Token | Value | Use |
|-------|-------|-----|
| `--bg-primary` | `#0f0f0f` | Main background |
| `--bg-secondary` | `#1a1a1a` | Cards, sidebars |
| `--bg-elevated` | `#252525` | Modals, dropdowns |
| `--text-primary` | `#ffffff` | Main text |
| `--text-secondary` | `#a0a0a0` | Secondary text |
| `--text-muted` | `#666666` | Disabled, hints |
| `--accent` | `#3b82f6` | Primary actions |
| `--accent-hover` | `#2563eb` | Hover state |
| `--success` | `#22c55e` | Online, success |
| `--warning` | `#eab308` | Warning states |
| `--danger` | `#ef4444` | Offline, errors |
| `--border` | `#2a2a2a` | Borders, dividers |

### Colors (Light Theme)

| Token | Value | Use |
|-------|-------|-----|
| `--bg-primary` | `#ffffff` | Main background |
| `--bg-secondary` | `#f5f5f5` | Cards, sidebars |
| `--bg-elevated` | `#ffffff` | Modals, dropdowns |
| `--text-primary` | `#0f0f0f` | Main text |
| `--text-secondary` | `#666666` | Secondary text |
| `--accent` | `#2563eb` | Primary actions |
| `--success` | `#16a34a` | Online, success |
| `--warning` | `#ca8a04` | Warning states |
| `--danger` | `#dc2626` | Offline, errors |
| `--border` | `#e5e5e5` | Borders, dividers |

### Typography

| Token | Value | Use |
|-------|-------|-----|
| `--font-sans` | `Inter, system-ui, sans-serif` | UI text |
| `--font-mono` | `JetBrains Mono, monospace` | Code, terminal |
| `--text-xs` | `0.75rem` | Captions |
| `--text-sm` | `0.875rem` | Secondary text |
| `--text-base` | `1rem` | Body text |
| `--text-lg` | `1.125rem` | Subheadings |
| `--text-xl` | `1.25rem` | Headings |
| `--text-2xl` | `1.5rem` | Page titles |

### Spacing

| Token | Value |
|-------|-------|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-12` | `3rem` (48px) |

### Elevation (Dark Theme)

| Level | Use | Shadow |
|-------|-----|--------|
| 0 | Flat elements | None |
| 1 | Cards | `0 1px 3px rgba(0,0,0,0.3)` |
| 2 | Sidebars, dropdowns | `0 4px 12px rgba(0,0,0,0.4)` |
| 3 | Modals | `0 8px 24px rgba(0,0,0,0.5)` |

---

## Attention & Animation

### Async Completion Cues

When a background task completes (e.g., AI response ready) while user focus is elsewhere:

1. **Initial:** 2-3 second subtle shimmer/glow on panel edge
2. **Settle:** Soft persistent glow until panel is viewed
3. **Clear:** Glow fades when user interacts with panel

**CSS approach:**
```css
@keyframes attention-shimmer {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent); }
  50% { box-shadow: 0 0 8px 2px var(--accent); }
}

.needs-attention {
  animation: attention-shimmer 2s ease-in-out 2;
  box-shadow: 0 0 4px 1px var(--accent);
}
```

### Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Sidebar open/close | transform | 200ms | ease-out |
| Panel resize | height | 100ms | ease-out |
| Button hover | background | 150ms | ease |
| Modal appear | opacity, scale | 200ms | ease-out |
| Theme switch | background, color | 300ms | ease |

---

## Empty States

### No Workflows

```
┌─────────────────────────────────────────────┐
│                                             │
│           📦                                │
│                                             │
│     No workflows yet                        │
│                                             │
│     Create your first workflow to launch    │
│     multiple sites with one click.          │
│                                             │
│     [+ Create Workflow]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### No Quick Links

```
┌─────────────────────────────────────────────┐
│                                             │
│           🔗                                │
│                                             │
│     No quick links yet                      │
│                                             │
│     Add your frequently visited sites       │
│     for one-click access.                   │
│                                             │
│     [+ Add Link]                            │
│                                             │
└─────────────────────────────────────────────┘
```

### Server Status Unavailable

```
┌─────────────────────────────────────────────┐
│                                             │
│           ⚠️                                │
│                                             │
│     Unable to fetch server status           │
│                                             │
│     Check your Termix connection in         │
│     Settings.                               │
│                                             │
│     [Open Settings]    [Retry]              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Accessibility

### Keyboard Navigation
- All interactive elements focusable via Tab
- Focus visible indicator (outline)
- Logical tab order
- Escape closes overlays

### Screen Reader
- Semantic HTML (nav, main, aside, button)
- ARIA labels on icon-only buttons
- Live regions for status updates
- Proper heading hierarchy

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Status colors tested for colorblind accessibility

### Motion
- `prefers-reduced-motion` media query respected
- Essential animations only in reduced motion mode

---

*This document defines the visual and interaction patterns for Mashb0ard. See FEATURES.md for detailed acceptance criteria and ARCHITECTURE.md for technical implementation.*
