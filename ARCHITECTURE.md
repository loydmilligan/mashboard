# Architecture Document: Mashb0ard

> **Status:** Draft  
> **Last Updated:** 2025-01-06  
> **Companion Docs:** DESIGN.md, FEATURES.md, UI_UX.md

---

## Executive Summary

Mashb0ard is a self-hosted browser new tab replacement built as a single-page application with embedded service integrations. This document outlines the technical architecture, stack decisions, and implementation patterns.

**Key Architectural Decisions:**
- **Frontend Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand (lightweight, no boilerplate)
- **Build Tool:** Vite
- **Deployment:** Docker container serving static files + optional browser extension

---

## Stack Decision

### Framework Comparison

| Criteria | React | Svelte | Vue |
|----------|-------|--------|-----|
| **Ecosystem** | ⭐⭐⭐ Massive | ⭐⭐ Growing | ⭐⭐⭐ Large |
| **Component Libraries** | ⭐⭐⭐ shadcn/ui, Radix | ⭐⭐ Skeleton, Melt | ⭐⭐ Vuetify, Naive |
| **Bundle Size** | ⭐⭐ ~45kb | ⭐⭐⭐ ~2kb | ⭐⭐ ~35kb |
| **Learning Curve** | ⭐⭐ Moderate | ⭐⭐⭐ Easy | ⭐⭐⭐ Easy |
| **TypeScript Support** | ⭐⭐⭐ Excellent | ⭐⭐⭐ Excellent | ⭐⭐⭐ Excellent |
| **Streaming/SSE** | ⭐⭐⭐ Well-supported | ⭐⭐⭐ Well-supported | ⭐⭐⭐ Well-supported |
| **AI Coding Support** | ⭐⭐⭐ Best trained | ⭐⭐ Good | ⭐⭐⭐ Good |

### Recommendation: React + TypeScript

**Why React:**
1. **shadcn/ui** — High-quality, accessible, customizable components that match our design needs (dialogs, popovers, sidebars, command palette)
2. **AI Coding** — Claude, GPT-4, and other models are best trained on React patterns
3. **Ecosystem** — Solutions exist for every problem (keyboard shortcuts, streaming, etc.)
4. **Hiring/Handoff** — If you ever want contributors, React is most accessible

**Why NOT Svelte (despite being simpler):**
- Fewer ready-made accessible components matching our UI needs
- Less AI coding model familiarity (more hallucinations)
- Would need to build more from scratch

### Selected Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18 | Ecosystem, AI support, shadcn/ui |
| **Language** | TypeScript | Type safety, better DX |
| **Build** | Vite | Fast HMR, ESM-native, simple config |
| **Styling** | Tailwind CSS | Utility-first, consistent with shadcn |
| **Components** | shadcn/ui | Accessible, customizable, modern |
| **State** | Zustand | Simple, lightweight, no boilerplate |
| **HTTP** | Native fetch | No axios needed, streaming support |
| **Icons** | Lucide React | Consistent with shadcn, comprehensive |
| **Syntax Highlighting** | highlight.js | Same as Dumbpad, wide language support |

---

## Project Structure

```
mashb0ard/
├── public/
│   ├── favicon.ico
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── command.tsx    # Command palette (cmdk)
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainContent.tsx
│   │   │   └── TerminalPanel.tsx
│   │   ├── features/
│   │   │   ├── ai-chat/
│   │   │   │   ├── AIChatSidebar.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ProviderSelector.tsx
│   │   │   │   └── SessionTransferModal.tsx
│   │   │   ├── notes/
│   │   │   │   └── NotesSidebar.tsx
│   │   │   ├── terminal/
│   │   │   │   └── TerminalPanel.tsx
│   │   │   ├── workflows/
│   │   │   │   ├── WorkflowGrid.tsx
│   │   │   │   ├── WorkflowCard.tsx
│   │   │   │   └── WorkflowEditor.tsx
│   │   │   ├── quick-links/
│   │   │   │   ├── QuickLinksPanel.tsx
│   │   │   │   └── LinkGroup.tsx
│   │   │   ├── pinned-notes/
│   │   │   │   ├── PinnedNotesGrid.tsx
│   │   │   │   └── PinnedNoteCard.tsx
│   │   │   ├── snippets/
│   │   │   │   ├── SnippetsPopover.tsx
│   │   │   │   ├── SnippetList.tsx
│   │   │   │   ├── SnippetView.tsx
│   │   │   │   └── SnippetForm.tsx
│   │   │   ├── server-status/
│   │   │   │   ├── ServerStatusGrid.tsx
│   │   │   │   └── ServerStatusCard.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingsDialog.tsx
│   │   │   │   ├── ApiKeysSection.tsx
│   │   │   │   ├── AiPrefsSection.tsx
│   │   │   │   ├── PinnedNotesSection.tsx
│   │   │   │   └── AppearanceSection.tsx
│   │   │   └── command-palette/
│   │   │       └── CommandPalette.tsx
│   │   └── shared/
│   │       ├── CodeBlock.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── KeyboardShortcut.tsx
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useStreamingResponse.ts
│   │   └── useTermixApi.ts
│   ├── stores/
│   │   ├── settingsStore.ts
│   │   ├── chatStore.ts
│   │   ├── workflowStore.ts
│   │   ├── pinnedNotesStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── openrouter.ts      # OpenRouter API client
│   │   ├── termix.ts          # Termix API client
│   │   ├── bytestash.ts       # ByteStash API client
│   │   └── storage.ts         # localStorage wrapper
│   ├── types/
│   │   ├── chat.ts
│   │   ├── settings.ts
│   │   ├── workflow.ts
│   │   ├── snippet.ts
│   │   └── termix.ts
│   ├── lib/
│   │   ├── utils.ts           # shadcn utility (cn function)
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Tailwind imports + custom CSS
├── extension/                  # Browser extension files
│   ├── manifest.json          # Extension manifest v3
│   ├── newtab.html
│   └── background.js
├── docker/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── components.json            # shadcn/ui config
└── README.md
```

---

## Component Architecture

### Layout Hierarchy

```
<App>
  <ThemeProvider>
    <KeyboardShortcutProvider>
      <div className="app-layout">
        
        <Header />
        
        <div className="main-area">
          <AIChatSidebar />      {/* Left, conditional */}
          
          <MainContent>
            <WorkflowGrid />
            <PinnedNotesGrid />
            <div className="two-column">
              <ServerStatusGrid />
              <QuickLinksPanel />
            </div>
          </MainContent>
          
          <NotesSidebar />       {/* Right, conditional */}
        </div>
        
        <TerminalPanel />        {/* Bottom, collapsible */}
        
        <CommandPalette />       {/* Modal overlay */}
        <SnippetsPopover />      {/* Popover, anchored to header */}
        <SettingsDialog />       {/* Modal overlay */}
        
      </div>
    </KeyboardShortcutProvider>
  </ThemeProvider>
</App>
```

### Component Responsibilities

| Component | Responsibility | State Source |
|-----------|---------------|--------------|
| `Header` | Logo, command bar, action icons | `uiStore` |
| `AIChatSidebar` | AI chat interface | `chatStore` |
| `NotesSidebar` | Dumbpad iframe wrapper | `settingsStore` (URL) |
| `TerminalPanel` | Termix iframe wrapper | `settingsStore` (URL) |
| `WorkflowGrid` | Workflow cards, launch | `workflowStore` |
| `PinnedNotesGrid` | Pinned note cards | `pinnedNotesStore` |
| `QuickLinksPanel` | Link groups | `workflowStore` |
| `ServerStatusGrid` | Host status widgets | Termix API (polling) |
| `SnippetsPopover` | Snippet search/view | ByteStash API |
| `CommandPalette` | Quick actions | Combined stores |
| `SettingsDialog` | Configuration UI | `settingsStore` |

---

## State Management

### Store Design (Zustand)

```typescript
// stores/settingsStore.ts
interface SettingsState {
  // API Keys & URLs
  openRouterKey: string;
  termix: { baseUrl: string; token: string };
  dumbpad: { baseUrl: string };
  bytestash: { baseUrl: string; apiKey: string };
  
  // AI Preferences
  ai: {
    defaultModel: string;
    favoriteModels: string[];
    summaryModel: string;
    deepReasoningDefault: boolean;
  };
  
  // Appearance
  appearance: {
    theme: 'light' | 'dark' | 'system';
    sidebarBehavior: 'push' | 'overlay';
  };
  
  // Actions
  setOpenRouterKey: (key: string) => void;
  setTermixConfig: (config: Partial<TermixConfig>) => void;
  // ... etc
}

// stores/chatStore.ts
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  editMessage: (id: string, content: string) => void;
  createConversation: (model: string) => void;
  clearConversation: () => void;
}

// stores/uiStore.ts
interface UIState {
  aiSidebarOpen: boolean;
  notesSidebarOpen: boolean;
  terminalPanelOpen: boolean;
  terminalPanelHeight: number;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  snippetsPopoverOpen: boolean;
  
  // Actions
  toggleAiSidebar: () => void;
  toggleNotesSidebar: () => void;
  toggleTerminalPanel: () => void;
  setTerminalPanelHeight: (height: number) => void;
  // ... etc
}

// stores/workflowStore.ts
interface WorkflowState {
  workflows: Workflow[];
  quickLinks: LinkGroup[];
  
  // Actions
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  launchWorkflow: (id: string) => void;
  reorderWorkflows: (ids: string[]) => void;
}

// stores/pinnedNotesStore.ts
interface PinnedNotesState {
  pinnedNotes: PinnedNote[];
  
  // Actions
  addPinnedNote: (note: PinnedNote) => void;
  updatePinnedNote: (id: string, updates: Partial<PinnedNote>) => void;
  deletePinnedNote: (id: string) => void;
  reorderPinnedNotes: (ids: string[]) => void;
  resetToDefaults: () => void;
}
```

### Persistence Strategy

```typescript
// Zustand persist middleware
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'mashb0ard-settings',
      version: 1,
      migrate: (persisted, version) => {
        // Handle schema migrations
      },
    }
  )
);
```

**What's Persisted:**
| Store | Persisted | Storage Key |
|-------|-----------|-------------|
| `settingsStore` | ✅ Yes | `mashb0ard-settings` |
| `chatStore` | ✅ Yes | `mashb0ard-chat` |
| `workflowStore` | ✅ Yes | `mashb0ard-workflows` |
| `pinnedNotesStore` | ✅ Yes | `mashb0ard-pinned-notes` |
| `uiStore` | ⚠️ Partial | `mashb0ard-ui` (only heights, not open states) |

---

## Data Flow

### AI Chat Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ChatInput  │────▶│  chatStore  │────▶│ openrouter  │────▶│  OpenRouter │
│  Component  │     │  addMessage │     │  service    │     │     API     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               │ SSE Stream
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ MessageList │◀────│  chatStore  │◀────│  streaming  │
│  Component  │     │updateMessage│     │   handler   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Server Status Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ StatusGrid  │────▶│   termix    │────▶│   Termix    │
│  useEffect  │     │   service   │     │    API      │
│  (polling)  │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       └───────────────────────────────────────┘
              setInterval (60s refresh)
```

### Settings → Service Config Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Settings   │────▶│ settings    │────▶│  Services   │
│   Dialog    │     │   Store     │     │ (read URL,  │
└─────────────┘     └─────────────┘     │  API keys)  │
                           │            └─────────────┘
                           │
                           ▼
                    localStorage
```

---

## API Integration Patterns

### OpenRouter (AI Chat)

```typescript
// services/openrouter.ts
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string; // Default: https://openrouter.ai/api/v1
}

export class OpenRouterService {
  constructor(private config: OpenRouterConfig) {}

  async *streamChat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        ...options,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    }
  }

  async getModels(): Promise<Model[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
    });
    return response.json();
  }
}
```

### Termix (Server Status)

```typescript
// services/termix.ts
interface TermixConfig {
  baseUrl: string;
  token: string;
}

export class TermixService {
  constructor(private config: TermixConfig) {}

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getHosts(): Promise<Host[]> {
    const response = await fetch(`${this.config.baseUrl}/ssh/db/host`, {
      headers: this.headers,
    });
    return response.json();
  }

  async getStatus(): Promise<HostStatus[]> {
    const response = await fetch(`${this.config.baseUrl}/status`, {
      headers: this.headers,
    });
    return response.json();
  }

  async getMetrics(hostId: string): Promise<HostMetrics> {
    const response = await fetch(`${this.config.baseUrl}/metrics/${hostId}`, {
      headers: this.headers,
    });
    return response.json();
  }
}
```

### ByteStash (Snippets)

```typescript
// services/bytestash.ts
interface ByteStashConfig {
  baseUrl: string;
  apiKey: string;
}

export class ByteStashService {
  constructor(private config: ByteStashConfig) {}

  private get headers() {
    return {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async searchSnippets(query: string): Promise<Snippet[]> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/snippets/search?q=${encodeURIComponent(query)}`,
      { headers: this.headers }
    );
    return response.json();
  }

  async getSnippet(id: number): Promise<Snippet> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/snippets/${id}`,
      { headers: this.headers }
    );
    return response.json();
  }

  async createSnippet(snippet: CreateSnippetInput): Promise<Snippet> {
    const formData = new FormData();
    formData.append('title', snippet.title);
    formData.append('description', snippet.description || '');
    formData.append('categories', snippet.categories?.join(',') || '');
    formData.append('fragments', JSON.stringify(snippet.fragments));

    const response = await fetch(
      `${this.config.baseUrl}/api/v1/snippets/push`,
      {
        method: 'POST',
        headers: { 'x-api-key': this.config.apiKey },
        body: formData,
      }
    );
    return response.json();
  }
}
```

---

## iframe Integration Strategy

### Security Considerations

| Service | Same Origin? | iframe Restrictions |
|---------|--------------|---------------------|
| Dumbpad | No (subdomain) | Requires `X-Frame-Options: SAMEORIGIN` or CSP update |
| Termix | No (subdomain) | Requires `X-Frame-Options: SAMEORIGIN` or CSP update |

**Requirement:** Both Dumbpad and Termix need to be configured to allow embedding from Mashb0ard's origin.

**Dumbpad config:** Set `X-Frame-Options: ALLOW-FROM https://mashb0ard.mattmariani.com` or use CSP `frame-ancestors`.

**Termix config:** Same approach.

### iframe Component Pattern

```typescript
// components/shared/ServiceIframe.tsx
interface ServiceIframeProps {
  src: string;
  title: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export function ServiceIframe({ src, title, onLoad, onError, className }: ServiceIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <LoadingSpinner />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <ErrorState message="Failed to load service" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
```

### Notes Sidebar with Dynamic URL

```typescript
// components/features/notes/NotesSidebar.tsx
export function NotesSidebar() {
  const { notesSidebarOpen, toggleNotesSidebar } = useUIStore();
  const { dumbpad } = useSettingsStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const iframeSrc = useMemo(() => {
    const base = dumbpad.baseUrl;
    return activeNoteId ? `${base}/?id=${activeNoteId}` : base;
  }, [dumbpad.baseUrl, activeNoteId]);

  // Expose method for pinned notes to call
  useEffect(() => {
    window.mashb0ard = {
      ...window.mashb0ard,
      openNote: (notepadId: string) => {
        setActiveNoteId(notepadId);
        if (!notesSidebarOpen) toggleNotesSidebar();
      },
    };
  }, [notesSidebarOpen, toggleNotesSidebar]);

  return (
    <Sidebar open={notesSidebarOpen} onClose={toggleNotesSidebar} side="right">
      <ServiceIframe
        src={iframeSrc}
        title="Notes"
        className="h-full"
      />
    </Sidebar>
  );
}
```

---

## Keyboard Shortcuts Implementation

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface Shortcut {
  key: string;
  mod?: boolean;      // Ctrl/Cmd
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  when?: () => boolean; // Condition for activation
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow specific shortcuts even in inputs (like Escape)
        if (e.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        const modKey = isMac ? e.metaKey : e.ctrlKey;
        const modMatch = shortcut.mod ? modKey : !modKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.when && !shortcut.when()) continue;
          
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Usage in App.tsx
function App() {
  const { toggleAiSidebar, toggleNotesSidebar, toggleTerminalPanel } = useUIStore();
  const { setCommandPaletteOpen, setSnippetsPopoverOpen, setSettingsOpen } = useUIStore();

  useKeyboardShortcuts([
    { key: 'k', mod: true, action: () => setCommandPaletteOpen(true) },
    { key: '/', mod: true, action: toggleAiSidebar },
    { key: 'n', mod: true, action: toggleNotesSidebar },
    { key: 't', mod: true, shift: true, action: toggleTerminalPanel },
    { key: 's', mod: true, shift: true, action: () => setSnippetsPopoverOpen(true) },
    { key: ',', mod: true, action: () => setSettingsOpen(true) },
    { key: 'Escape', action: closeAllOverlays },
  ]);

  // ...
}
```

---

## Security Considerations

### API Key Storage

| Approach | Security Level | MVP? | Notes |
|----------|---------------|------|-------|
| **localStorage (plaintext)** | ⚠️ Low | ✅ Yes | Accessible via devtools |
| **localStorage (encrypted)** | ⚠️ Medium | ❌ No | Key still in JS, security theater |
| **Backend proxy** | ✅ High | ❌ No | Requires server component |
| **Browser extension storage** | ⚠️ Medium | ⚠️ Maybe | Better than localStorage |

**MVP Decision:** Use localStorage with clear documentation of risks. Acceptable for self-hosted, single-user deployment.

**Future Enhancement:** Add optional backend proxy for API key storage and request forwarding.

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' 
    https://openrouter.ai 
    https://termix.mattmariani.com 
    https://bytestash.mattmariani.com;
  frame-src 
    https://dumbpad.mattmariani.com 
    https://termix.mattmariani.com;
">
```

### iframe Sandbox

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  ...
/>
```

**Sandbox permissions:**
- `allow-scripts` — Required for Dumbpad/Termix functionality
- `allow-same-origin` — Required for their localStorage/auth
- `allow-forms` — Required for Termix login forms
- `allow-popups` — Required if they open external links

---

## Deployment Architecture

### Option A: Docker (Recommended)

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# docker/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  mashb0ard:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: mashb0ard
    restart: unless-stopped
    ports:
      - "3000:80"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mashb0ard.rule=Host(`mashb0ard.mattmariani.com`)"
      - "traefik.http.routers.mashb0ard.tls=true"
      - "traefik.http.routers.mashb0ard.tls.certresolver=letsencrypt"
```

### Option B: Browser Extension (New Tab Override)

```json
// extension/manifest.json (Manifest V3)
{
  "manifest_version": 3,
  "name": "Mashb0ard",
  "version": "1.0.0",
  "description": "Personal browser dashboard",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Extension Build Process:**
1. Build React app with Vite
2. Copy `dist/` contents to `extension/`
3. Update paths in `index.html` if needed
4. Package as `.crx` (Chrome) or `.xpi` (Firefox)

### Hybrid Approach (Recommended)

1. **Primary:** Self-hosted Docker deployment at `https://mashb0ard.yourdomain.com`
2. **Extension:** Browser extension that redirects new tab to the hosted URL

```javascript
// extension/background.js
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl === 'chrome://newtab/') {
    chrome.tabs.update(tab.id, { url: 'https://mashb0ard.yourdomain.com' });
  }
});
```

This approach:
- ✅ Updates automatically (no extension republish needed)
- ✅ Works across browsers with minimal extension code
- ✅ Extension only needs minimal permissions
- ⚠️ Requires network connection for new tab

---

## Build & Development

### Scripts

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "docker:build": "docker build -f docker/Dockerfile -t mashb0ard .",
    "docker:run": "docker run -p 3000:80 mashb0ard",
    "extension:build": "npm run build && cp -r dist/* extension/"
  }
}
```

### Environment Variables

```bash
# .env.example (for development only, not used in production)
VITE_DEFAULT_OPENROUTER_URL=https://openrouter.ai/api/v1
VITE_DEFAULT_TERMIX_URL=https://termix.mattmariani.com
VITE_DEFAULT_DUMBPAD_URL=https://dumbpad.mattmariani.com
VITE_DEFAULT_BYTESTASH_URL=https://bytestash.mattmariani.com
```

**Note:** API keys are never in env vars — always user-configured in Settings.

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// src/services/__tests__/openrouter.test.ts
describe('OpenRouterService', () => {
  it('should stream chat responses', async () => {
    // Mock fetch with SSE response
  });

  it('should handle errors gracefully', async () => {
    // Test error states
  });
});
```

### Component Tests (Testing Library)

```typescript
// src/components/features/ai-chat/__tests__/ChatInput.test.tsx
describe('ChatInput', () => {
  it('should submit on Mod+Enter', () => {});
  it('should disable while streaming', () => {});
});
```

### E2E Tests (Playwright) — Future

```typescript
// e2e/workflows.spec.ts
test('should launch workflow and open tabs', async ({ page }) => {
  // Test workflow functionality
});
```

---

## Performance Considerations

### Bundle Optimization

- **Code Splitting:** Lazy load sidebars and modals
- **Tree Shaking:** Vite handles automatically
- **Compression:** nginx gzip/brotli

```typescript
// Lazy loading example
const SettingsDialog = lazy(() => import('./features/settings/SettingsDialog'));
const AIChatSidebar = lazy(() => import('./features/ai-chat/AIChatSidebar'));
```

### Runtime Performance

- **Memoization:** Use `useMemo`/`useCallback` for expensive computations
- **Virtualization:** If snippet list grows large, use `react-window`
- **Polling:** Server status polling every 60s (not more frequent)

---

## Migration Path

### Phase 1: MVP
- Static React app
- localStorage for all data
- Direct API calls from client

### Phase 2: Enhanced (Future)
- Optional backend proxy for API keys
- Database for chat history (longer retention)
- WebSocket for real-time status updates

### Phase 3: Full (Future)
- Multi-device sync
- Encrypted settings backup
- Plugin system for custom widgets

---

*This document defines the technical architecture for Mashb0ard. See FEATURES.md for detailed acceptance criteria and UI_UX.md for design specifications.*
