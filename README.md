# Mashb0ard

> **Version:** 0.10.0
> **Last Updated:** 2025-01-12
> A personal browser dashboard and command center for self-hosted environments

## Overview

Mashb0ard is a keyboard-driven new tab replacement that consolidates daily tools into one workspace. It's a desktop-first React SPA with embedded service integrations, designed for power users who self-host their services.

**Key Highlights:**
- Split-pane layout with tabbed content area
- AI chat with streaming support (OpenRouter)
- Full task management (Vikunja) with resource attachments
- Pomodoro timer with task claiming
- Habits tracking with streaks
- Embedded services: SSH terminal, code snippets, search, notes, container logs

---

## Features

### Layout & Navigation
- **Split Layout**: Draggable 40/60 split with left panel (tools, links, dashboard) and right content area
- **Resizable Sidebars**: Drag-to-resize AI chat and notes sidebars with auto-hide
- **Content Tabs**: Tabbed interface for Termix, ByteStash, SearXNG, and dynamic viewer apps
- **Command Palette**: Keyboard-driven actions (`Cmd+K`)
- **Dark/Light Theme**: System-aware theming with manual toggle

### AI Chat
- **OpenRouter Integration**: Access 100+ AI models through single API
- **Streaming Responses**: Real-time token streaming with batched updates
- **Reasoning Models**: Support for models with thinking tokens (o1, DeepSeek, GLM-4)
- **Model Selector**: Quick model switching with favorites and metadata
- **Conversation Management**: Multiple conversations with history

### Task Management
- **Vikunja Integration**: Full task CRUD with priorities, due dates, and projects
- **Task Resources**: Attach resources that auto-open when task is claimed:
  - Web links (iframe embeds)
  - YouTube videos
  - Files (images, PDFs, code, audio, spreadsheets)
  - NoteMark notes
  - SSH connections (Termix)
- **Pomodoro Timer**: Built-in timer in header with task claiming workflow

### Productivity Tools
- **Notes**: Dumbpad for quick notes + NoteMark for full markdown notebooks
- **Code Snippets**: ByteStash integration for storing and organizing code
- **Search**: SearXNG privacy-respecting metasearch
- **Container Logs**: Dozzle integration for Docker log viewing
- **Habits Tracker**: Daily habits with streaks and statistics
- **Workflows**: Quick-launch URL groups (macros)
- **Quick Links**: Organized link groups with collapsible sections

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite |
| **Styling** | Tailwind CSS |
| **Components** | shadcn/ui (Radix primitives) |
| **State** | Zustand (with persist middleware) |
| **Icons** | Lucide React |
| **Backend** | Node.js/Express + PostgreSQL |
| **Deployment** | Docker + nginx reverse proxy |

---

## Quick Start

### Docker Deployment (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/youruser/mashboard.git
cd mashboard

# 2. Copy and configure environment variables
cp docker/.env.example docker/.env
# Edit docker/.env with your settings

# 3. Build and start all services
cd docker
docker compose -f docker-compose.proxy.yml up -d --build

# 4. Access Mashb0ard
open http://localhost:3000
```

### Services Included

| Service | URL | Description |
|---------|-----|-------------|
| **Mashb0ard** | http://localhost:3000 | Main dashboard |
| **Mashboard API** | /api/mashboard/ | Backend (habits, settings, task resources) |
| **Vikunja** | /api/vikunja/ | Task management API |
| **NoteMark** | /api/notemark/ | Markdown notebooks API |
| **Dumbpad** | /dumbpad/ | Quick notes (iframe) |
| **Termix** | /termix/ | SSH terminal (iframe) |
| **ByteStash** | /bytestash/ | Code snippets (iframe) |
| **SearXNG** | /searxng/ | Privacy search (iframe) |
| **Dozzle** | /dozzle/ | Docker container logs |

### Initial Configuration

After deployment, open Settings (`Cmd+,`) and configure:

1. **OpenRouter API Key** - Get from [openrouter.ai/keys](https://openrouter.ai/keys)
2. **Vikunja Token** - Generate in Vikunja Settings → API Tokens
3. **Termix JWT** - Copy from Termix cookies after login
4. **NoteMark Token** - Get from NoteMark settings

Service URLs are pre-configured for the Docker proxy setup.

---

## Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Local Development

```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev
# Opens at http://localhost:5173

# Start API server (separate terminal)
cd api && npm install && npm start
# API at http://localhost:3001

# Build for production
npm run build

# Type checking
npm run typecheck
```

### Project Structure

```
mashboard/
├── api/                 # Backend API (Express + PostgreSQL)
│   └── src/index.js     # API routes
├── docker/              # Docker configs and nginx proxy
│   ├── docker-compose.proxy.yml
│   ├── Dockerfile.proxy
│   └── nginx.proxy.template.conf
├── src/
│   ├── components/
│   │   ├── features/    # Feature modules
│   │   │   ├── ai-chat/
│   │   │   ├── tasks/
│   │   │   ├── habits/
│   │   │   ├── notes/
│   │   │   ├── pomodoro/
│   │   │   └── ...
│   │   ├── layout/      # Layout components
│   │   ├── shared/      # Shared components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   ├── services/        # API clients
│   ├── types/           # TypeScript definitions
│   └── lib/             # Utilities
└── docs/                # Documentation
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+/` | Toggle AI chat sidebar |
| `Cmd+Shift+N` | Toggle notes sidebar |
| `Cmd+\`` | Open Termix tab |
| `Cmd+Shift+B` | Open ByteStash tab |
| `Cmd+E` | Focus search bar |
| `Cmd+,` | Open settings |

---

## Architecture

### Data Storage

| Data | Storage | Location |
|------|---------|----------|
| Settings | PostgreSQL | `mashboard-api` |
| Habits | PostgreSQL | `mashboard-api` |
| Task Resources | PostgreSQL | `mashboard-api` |
| AI Models | PostgreSQL | `mashboard-api` |
| Chat History | localStorage | Browser |
| UI State | localStorage | Browser |

### Services Integration

All services run behind nginx reverse proxy on same origin:
- Solves third-party cookie issues for iframe embedding
- Provides unified access through single port
- Handles WebSocket upgrades for real-time features

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture details
- [CLAUDE.md](CLAUDE.md) - AI assistant instructions
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

## Troubleshooting

### Services not loading in tabs
1. Check service URLs in Settings match proxy paths
2. Verify services are running: `docker compose ps`
3. Check nginx logs: `docker logs mashb0ard`

### Settings not persisting
1. Ensure mashboard-api container is running and healthy
2. Check API health: `curl http://localhost:3000/api/mashboard/health`
3. Verify PostgreSQL is up: `docker logs mashb0ard-postgres`

### AI streaming freezing browser
This was fixed in v0.10.0 with batched state updates. Ensure you're running the latest version.

---

## License

MIT
