# CLAUDE.md — AI Agent Instructions for Mashb0ard

> This file provides context and instructions for AI coding assistants (Claude, GPT, Cursor, etc.) working on the Mashb0ard project.

---

## Project Overview

**Mashb0ard** is a personal browser new tab replacement that consolidates daily tools into one keyboard-driven workspace. It's a self-hosted React SPA with embedded service integrations.

**Key Features:**
- AI Chat with OpenRouter (multi-provider, streaming)
- Workflow Launcher (open grouped URLs)
- Quick Links (bookmarks)
- Pinned Notes (quick access to Dumbpad notes)
- Server Status (Termix API integration)
- Snippets (ByteStash code snippets)
- Notes Sidebar (Dumbpad iframe)
- Terminal Panel (Termix iframe)
- Command Palette (unified quick actions)

**Target User:** Solo developer/power user who self-hosts services.

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run with Docker
docker-compose up -d
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix primitives) |
| State | Zustand (with persist middleware) |
| Icons | Lucide React |
| Syntax Highlighting | highlight.js or react-syntax-highlighter |

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components (Button, Dialog, etc.)
│   ├── layout/          # Header, Sidebar, MainContent, TerminalPanel
│   ├── features/        # Feature-specific components
│   │   ├── ai-chat/     # AIChatSidebar, MessageList, ChatInput, etc.
│   │   ├── notes/       # NotesSidebar
│   │   ├── terminal/    # TerminalPanel
│   │   ├── workflows/   # WorkflowGrid, WorkflowCard, WorkflowEditor
│   │   ├── quick-links/ # QuickLinksPanel, LinkGroup
│   │   ├── pinned-notes/# PinnedNotesGrid, PinnedNoteCard
│   │   ├── snippets/    # SnippetsPopover, SnippetList, SnippetView
│   │   ├── server-status/# ServerStatusGrid, ServerStatusCard
│   │   ├── settings/    # SettingsDialog, ApiKeysSection, etc.
│   │   └── command-palette/# CommandPalette
│   └── shared/          # Reusable components (CodeBlock, LoadingSpinner, etc.)
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── services/            # API clients (OpenRouter, Termix, ByteStash)
├── types/               # TypeScript type definitions
├── lib/                 # Utilities (cn function, constants)
├── App.tsx
├── main.tsx
└── index.css
```

---

## Coding Conventions

### TypeScript
- **Strict mode enabled** — no `any` types unless absolutely necessary
- **Interfaces over types** for object shapes
- **Explicit return types** on functions
- **Prefer `const` assertions** for literal types

```typescript
// ✅ Good
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function getMessage(id: string): Message | undefined {
  // ...
}

// ❌ Avoid
const getMessage = (id: any) => {
  // ...
}
```

### React Components
- **Functional components only** — no class components
- **Named exports** for components
- **Props interface** defined above component

```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button
      className={cn('btn', variant === 'primary' && 'btn-primary')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### File Naming
- **Components:** PascalCase (`MessageList.tsx`)
- **Hooks:** camelCase with `use` prefix (`useKeyboardShortcuts.ts`)
- **Stores:** camelCase with `Store` suffix (`chatStore.ts`)
- **Services:** camelCase (`openrouter.ts`)
- **Types:** camelCase (`chat.ts`)

### Imports
- **Absolute imports** from `src/` (configure in tsconfig)
- **Group imports:** React, external libs, internal modules, relative
- **No default exports** except for lazy-loaded components

```typescript
// ✅ Good
import { useState, useEffect } from 'react';
import { useStore } from 'zustand';

import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types/chat';

import { MessageItem } from './MessageItem';
```

### Styling
- **Tailwind utility classes** — avoid custom CSS unless necessary
- **Use `cn()` utility** for conditional classes
- **Component variants** via Tailwind classes, not separate CSS

```typescript
// ✅ Good
<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-accent bg-accent/10',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

### State Management
- **Zustand stores** for global state
- **React state** for local UI state
- **No prop drilling** — use stores for shared state

```typescript
// ✅ Good - Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'mashb0ard-ui' }
  )
);
```

---

## Key Patterns

### Keyboard Shortcuts

Use the `useKeyboardShortcuts` hook for all keyboard handling:

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function App() {
  const { toggleSidebar } = useUIStore();
  
  useKeyboardShortcuts([
    { key: '/', mod: true, action: toggleSidebar },
    { key: 'Escape', action: closeOverlays },
  ]);
}
```

**Modifier Key Convention:**
- `mod: true` = Ctrl on Windows/Linux, Cmd on Mac
- Always detect OS and use appropriate modifier

### API Services

Services read credentials from settings store:

```typescript
// services/openrouter.ts
import { useSettingsStore } from '@/stores/settingsStore';

export class OpenRouterService {
  private get apiKey() {
    return useSettingsStore.getState().openRouterKey;
  }
  
  async *streamChat(messages: Message[], model: string) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });
    
    // Parse SSE stream...
  }
}
```

### iframe Embedding

Use the `ServiceIframe` component for embedded services:

```typescript
import { ServiceIframe } from '@/components/shared/ServiceIframe';

function NotesSidebar() {
  const { dumbpad } = useSettingsStore();
  const [noteId, setNoteId] = useState<string | null>(null);
  
  const src = noteId 
    ? `${dumbpad.baseUrl}/?id=${noteId}` 
    : dumbpad.baseUrl;
  
  return (
    <ServiceIframe
      src={src}
      title="Notes"
      className="h-full"
    />
  );
}
```

### Streaming Responses

For AI chat streaming:

```typescript
async function handleSend(content: string) {
  const userMessage = { id: uuid(), role: 'user', content };
  addMessage(userMessage);
  
  const assistantMessage = { id: uuid(), role: 'assistant', content: '' };
  addMessage(assistantMessage);
  
  setIsStreaming(true);
  
  try {
    for await (const chunk of openrouter.streamChat(messages, model)) {
      updateMessage(assistantMessage.id, (prev) => prev + chunk);
    }
  } catch (error) {
    updateMessage(assistantMessage.id, 'Error: ' + error.message);
  } finally {
    setIsStreaming(false);
  }
}
```

---

## Component Guidelines

### shadcn/ui Components

Always use shadcn/ui components as the base. Install with:
```bash
npx shadcn@latest add <component-name>
```

Common components used:
- `button`, `input`, `textarea` — form elements
- `dialog` — modals
- `popover` — floating panels (snippets)
- `command` — command palette (uses cmdk)
- `select` — dropdowns
- `switch` — toggles
- `tabs` — tabbed interfaces

### Custom Components

When creating custom components:
1. Check if shadcn/ui has something similar first
2. Use Radix primitives for accessibility
3. Support keyboard navigation
4. Include loading and error states

### Sidebar Pattern

```typescript
interface SidebarProps {
  side: 'left' | 'right';
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sidebar({ side, open, onClose, children }: SidebarProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed top-[var(--header-height)] bottom-0 w-80 bg-background border transition-transform duration-200',
        side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
        open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
      )}
    >
      {children}
    </div>
  );
}
```

---

## Testing Approach

### Manual Testing Checklist
For each feature, verify:
- [ ] Works with keyboard only
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Handles empty state
- [ ] Persists correctly on reload

### Key Integration Tests
- AI chat streaming works with real API
- iframes load Dumbpad/Termix correctly
- Termix API returns expected data
- ByteStash search works

---

## Common Tasks

### Adding a New Feature

1. Create types in `src/types/`
2. Create store in `src/stores/` (if needed)
3. Create service in `src/services/` (if API involved)
4. Create components in `src/components/features/<feature>/`
5. Wire to main layout in `App.tsx`
6. Add keyboard shortcuts (if any)
7. Add to command palette actions

### Adding a shadcn Component

```bash
npx shadcn@latest add <component>
```

Component will be added to `src/components/ui/`.

### Adding a Keyboard Shortcut

1. Add to `useKeyboardShortcuts` call in App.tsx
2. Document in command palette
3. Update UI_UX.md shortcuts table

### Creating a New Store

```typescript
// src/stores/exampleStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'mashb0ard-example' }
  )
);
```

---

## External Service URLs

These are configured by the user in Settings, but defaults/examples:

| Service | Default URL | Auth |
|---------|-------------|------|
| OpenRouter | `https://openrouter.ai/api/v1` | Bearer token |
| Termix | `https://termix.yourdomain.com` | JWT Bearer |
| Dumbpad | `https://dumbpad.yourdomain.com` | None (or PIN) |
| ByteStash | `https://bytestash.yourdomain.com` | `x-api-key` header |

---

## Workflow

### Before Starting Work
1. Check `TASKS.md` for current task assignment
2. Review `AGENTS.md` for multi-agent workflow expectations

### Commit Format
```
type(scope): description

- detail 1
- detail 2

Task: [TASK-ID]
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Important Notes

### iframe Embedding
Dumbpad and Termix must be configured to allow embedding:
- Set `X-Frame-Options: ALLOW-FROM <mashb0ard-origin>` or
- Use CSP `frame-ancestors` directive

### API Keys in localStorage
For MVP, API keys are stored in localStorage (not secure against devtools access). This is acceptable for self-hosted, single-user deployment. Document the risk.

### No Backend
MVP is a pure frontend SPA. API calls go directly from browser to external services. Future versions may add a backend proxy.

### Browser Extension
The extension just redirects new tab to the hosted URL. It doesn't embed the app — that causes CSP issues.

---

## Reference Documents

- **DESIGN.md** — Project vision, principles, success criteria
- **FEATURES.md** — Detailed feature specifications with acceptance criteria
- **UI_UX.md** — Wireframes, user flows, component patterns, design tokens
- **ARCHITECTURE.md** — Stack decisions, component structure, data flow
- **PLAN.md** — Phased implementation plan
- **TASKS.md** — Atomic task checklist

---

## Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # Run ESLint

# Docker
docker build -f docker/Dockerfile -t mashb0ard .
docker run -p 3000:80 mashb0ard
docker compose -f docker/docker-compose.yml up

# shadcn
npx shadcn@latest add <component>

# Type checking
npx tsc --noEmit
```

---

## Current Status

- Phase: 0 - Setup
- Stack: Node.js 18+, Docker deployment

---

*When in doubt, refer to the companion docs. When implementing, check TASKS.md for the current phase and mark tasks complete as you go.*
