# Architecture Document: Mashb0ard

> **Version:** 0.10.0
> **Last Updated:** 2025-01-12
> **Companion Docs:** [README.md](README.md), [CHANGELOG.md](CHANGELOG.md), [CLAUDE.md](CLAUDE.md)

---

## Executive Summary

Mashb0ard is a self-hosted browser dashboard built as a React SPA with a Node.js/Express backend. It integrates multiple self-hosted services through an nginx reverse proxy, providing a unified workspace for productivity tools.

**Key Architectural Decisions:**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js/Express + PostgreSQL
- **State:** Zustand (frontend) + PostgreSQL (persistent settings)
- **Deployment:** Docker Compose with nginx reverse proxy
- **Services:** Iframe embedding with same-origin proxy

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React SPA (Mashb0ard)                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │   │
│  │  │  AI Chat    │ │   Tasks     │ │   Content Tabs          │ │   │
│  │  │  Sidebar    │ │   Widget    │ │ (Termix/ByteStash/etc)  │ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────┘ │   │
│  │                    Zustand Stores                             │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │settings │ │  chat   │ │  tasks  │ │   ui    │  ...       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP/WebSocket
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     nginx Reverse Proxy (:3000)                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  /                  → Static files (React build)                ││
│  │  /api/mashboard/*   → mashboard-api:3001                        ││
│  │  /api/vikunja/*     → vikunja:3456                              ││
│  │  /api/termix/*      → termix:8080                               ││
│  │  /api/notemark/*    → notemark:8080                             ││
│  │  /dumbpad/*         → dumbpad:3000                              ││
│  │  /termix/*          → termix:8080                               ││
│  │  /bytestash/*       → bytestash:5000                            ││
│  │  /searxng/*         → searxng:8080                              ││
│  │  /vikunja/*         → vikunja:3456                              ││
│  │  /notemark/*        → notemark:8080                             ││
│  │  /dozzle/*          → dozzle:8080                               ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Network                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ mashboard-api│  │   postgres   │  │   External Services      │  │
│  │   (Express)  │  │  (Database)  │  │ vikunja, termix, dumbpad │  │
│  │     :3001    │  │     :5432    │  │ bytestash, searxng, etc  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool, HMR |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component primitives |
| **Zustand** | State management |
| **Lucide React** | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | HTTP server |
| **PostgreSQL** | Database |
| **Multer** | File uploads |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Service orchestration |
| **nginx** | Reverse proxy, static serving |

---

## Project Structure

```
mashboard/
├── api/                          # Backend API
│   ├── src/
│   │   └── index.js              # Express server, all routes
│   ├── uploads/                  # File upload storage
│   ├── Dockerfile
│   └── package.json
│
├── docker/                       # Docker configuration
│   ├── docker-compose.proxy.yml  # Full stack compose
│   ├── Dockerfile.proxy          # Frontend build + nginx
│   ├── nginx.proxy.template.conf # nginx config with env vars
│   ├── init-db.sql               # PostgreSQL init
│   └── .env.example              # Environment template
│
├── src/                          # Frontend source
│   ├── components/
│   │   ├── features/             # Feature modules
│   │   │   ├── ai-chat/          # AI chat sidebar
│   │   │   ├── tasks/            # Task widget, resources
│   │   │   ├── habits/           # Habits tracker
│   │   │   ├── notes/            # Notes sidebar
│   │   │   ├── pomodoro/         # Pomodoro timer
│   │   │   ├── quick-links/      # Quick links panel
│   │   │   ├── workflows/        # Workflow macros
│   │   │   ├── settings/         # Settings dialog
│   │   │   ├── command-palette/  # Cmd+K palette
│   │   │   ├── content-apps/     # Tab viewer apps
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   └── ...
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── SplitLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ContentArea.tsx
│   │   │   └── ...
│   │   ├── shared/               # Shared components
│   │   │   └── ServiceIframe.tsx
│   │   └── ui/                   # shadcn/ui components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── usePanelAutoHide.ts
│   │   └── ...
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── settingsStore.ts      # Settings (fetched from API)
│   │   ├── chatStore.ts          # AI conversations
│   │   ├── taskStore.ts          # Vikunja tasks
│   │   ├── habitStore.ts         # Habits data
│   │   ├── contentStore.ts       # Open tabs
│   │   ├── uiStore.ts            # UI state
│   │   ├── pomodoroStore.ts      # Timer state
│   │   ├── modelsStore.ts        # AI models
│   │   └── ...
│   │
│   ├── services/                 # API clients
│   │   ├── openrouter.ts         # OpenRouter AI API
│   │   ├── vikunja.ts            # Vikunja tasks API
│   │   ├── taskResources.ts      # Task resources API
│   │   ├── settings.ts           # Settings API
│   │   ├── habits.ts             # Habits API
│   │   ├── models.ts             # AI models API
│   │   ├── termix.ts             # Termix status
│   │   ├── bytestash.ts          # ByteStash snippets
│   │   └── notemark.ts           # NoteMark API
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── chat.ts
│   │   ├── taskResource.ts
│   │   └── ...
│   │
│   ├── lib/                      # Utilities
│   │   ├── utils.ts              # cn() helper
│   │   ├── constants.ts          # Storage keys, etc.
│   │   └── openResourceAsTab.ts  # Resource → tab mapping
│   │
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind + custom CSS
│
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── components.json               # shadcn/ui config
```

---

## Data Flow

### Settings Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Settings   │────▶│  settings    │────▶│  settings    │────▶│  PostgreSQL  │
│   Dialog     │     │   Store      │     │   Service    │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │ Services read config
       │                    ▼
       │             ┌──────────────┐
       └────────────▶│ openrouter   │
                     │ vikunja      │
                     │ termix, etc  │
                     └──────────────┘
```

### AI Chat Streaming Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  ChatInput   │────▶│  chatStore   │────▶│ openrouter   │────▶│  OpenRouter  │
│  Component   │     │  addMessage  │     │  streamChat  │     │     API      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                │ SSE chunks
                                                ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ MessageList  │◀────│  chatStore   │◀────│   Buffer +   │
│  Component   │     │ appendContent│     │ 50ms Flush   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Task Resources Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  TaskWidget  │────▶│  Claim Task  │────▶│ taskResources│────▶│  PostgreSQL  │
│  (Pomodoro)  │     │  + Timer     │     │   Service    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                │ Load resources
                                                ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ContentArea  │◀────│ contentStore │◀────│ openResource │
│    Tabs      │     │   openTab    │     │    AsTab     │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## State Management

### Store Design

| Store | Persistence | Source | Purpose |
|-------|-------------|--------|---------|
| `settingsStore` | PostgreSQL | API fetch | App configuration |
| `chatStore` | localStorage | Zustand persist | AI conversations |
| `taskStore` | None (live fetch) | Vikunja API | Current tasks |
| `habitStore` | PostgreSQL | API fetch | Habit data |
| `contentStore` | localStorage | Zustand persist | Open tabs |
| `uiStore` | Partial localStorage | Zustand persist | UI state |
| `pomodoroStore` | localStorage | Zustand persist | Timer state |
| `modelsStore` | PostgreSQL | API fetch | AI model configs |

### Storage Keys

```typescript
const STORAGE_KEYS = {
  SETTINGS: 'mashb0ard-settings',     // Legacy, migrated to DB
  CHAT: 'mashb0ard-chat',
  WORKFLOWS: 'mashb0ard-workflows',
  UI: 'mashb0ard-ui',
  LAYOUT: 'mashb0ard-layout',
  CONTENT_TABS: 'mashb0ard-content-tabs',
  POMODORO: 'mashb0ard-pomodoro',
  HABITS: 'mashb0ard-habits',         // Legacy, migrated to DB
}
```

---

## API Endpoints

### Mashboard API (`/api/mashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/settings` | Get user settings |
| PUT | `/settings` | Update settings |
| PATCH | `/settings` | Partial update |
| GET | `/habits` | List habits |
| POST | `/habits` | Create habit |
| PUT | `/habits/:id` | Update habit |
| DELETE | `/habits/:id` | Delete habit |
| GET | `/task-resources/:taskId` | List task resources |
| POST | `/task-resources/:taskId` | Create resource |
| PUT | `/task-resources/:taskId/:id` | Update resource |
| DELETE | `/task-resources/:taskId/:id` | Delete resource |
| POST | `/files/upload` | Upload file |
| GET | `/files/:key` | Download file |
| DELETE | `/files/:key` | Delete file |
| GET | `/models` | List AI models |
| POST | `/models` | Create model |
| PUT | `/models/:id` | Update model |
| DELETE | `/models/:id` | Delete model |

### Database Schema

```sql
-- Settings (JSONB for flexibility)
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits
CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT 'default',
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  target_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  streak INTEGER DEFAULT 0,
  completions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Resources
CREATE TABLE task_resources (
  id SERIAL PRIMARY KEY,
  vikunja_task_id VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded Files
CREATE TABLE uploaded_files (
  id SERIAL PRIMARY KEY,
  storage_key VARCHAR(255) UNIQUE NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Models
CREATE TABLE ai_models (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  provider VARCHAR(100),
  description TEXT,
  pricing JSONB DEFAULT '{}',
  context_length INTEGER,
  supports_streaming BOOLEAN DEFAULT true,
  supports_vision BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Considerations

### Current Approach (MVP)

| Concern | Solution | Risk Level |
|---------|----------|------------|
| API Keys | Stored in PostgreSQL, served via API | Medium |
| Auth | None (single-user assumption) | High |
| CORS | Same-origin via nginx proxy | Low |
| XSS | React escaping + CSP headers | Low |

### Future Improvements

- [ ] Add user authentication (OAuth/OIDC)
- [ ] Encrypt sensitive settings at rest
- [ ] Add rate limiting
- [ ] Implement RBAC for multi-user

---

## Performance Optimizations

### Implemented

| Optimization | Location | Impact |
|--------------|----------|--------|
| **Batched streaming updates** | `AIChatSidebar.tsx` | Prevents browser freeze during AI streaming |
| **Lazy component loading** | Content apps | Faster initial load |
| **Zustand subscriptions** | All stores | Minimal re-renders |
| **nginx gzip** | `nginx.proxy.template.conf` | Reduced transfer size |

### Bundle Analysis

```
dist/index.html                     0.87 kB
dist/assets/index-*.css            66.72 kB  (gzip: 10.88 kB)
dist/assets/index-*.js          1,354.08 kB  (gzip: 436.51 kB)
```

### Future Improvements

- [ ] Code split by route/feature
- [ ] Service worker for offline support
- [ ] Virtualized lists for large data

---

## Deployment

### Docker Compose Services

```yaml
services:
  postgres:        # PostgreSQL 16
  mashboard-api:   # Express API (:3001)
  mashb0ard:       # Frontend + nginx (:80)
  vikunja:         # Task management
  dumbpad:         # Quick notes
  termix:          # SSH terminal
  bytestash:       # Code snippets
  searxng:         # Search
  notemark:        # Markdown notebooks
  dozzle:          # Container logs
```

### Environment Variables

See `docker/.env.example` for full list. Key variables:

```bash
PORT=3000                              # External port
EXTERNAL_URL=http://localhost:3000     # Public URL
POSTGRES_PASSWORD=...                  # Database password
VIKUNJA_SERVICE_JWTSECRET=...         # Vikunja JWT secret
TERMIX_SALT=...                       # Termix encryption
BYTESTASH_JWT_SECRET=...              # ByteStash JWT
```

---

## Testing

### Current Coverage

| Type | Tool | Status |
|------|------|--------|
| Unit | Vitest | Partial |
| Component | Testing Library | Minimal |
| E2E | Playwright | Not implemented |
| API | Manual | Manual testing |

### Run Tests

```bash
npm test              # Run Vitest
npm run typecheck     # TypeScript check
```

---

*This document describes the technical architecture of Mashb0ard v0.10.0. For feature details see [README.md](README.md), for version history see [CHANGELOG.md](CHANGELOG.md).*
