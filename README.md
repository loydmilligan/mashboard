# Mashb0ard

> A personal browser dashboard and command center for self-hosted environments

## Overview

Mashb0ard is a keyboard-driven new tab replacement that consolidates daily tools into one workspace. It provides quick access to link groups, AI chat, persistent notes, integrated search, server monitoring, and Home Assistant integration.

## Features

- 🔗 Workflow launcher for grouped URLs
- 🤖 AI chat with multiple providers (OpenRouter, streaming)
- 📝 Persistent notes and pinned notes
- 🔍 Integrated search
- 📊 Server monitoring (Uptime Kuma / Termix)
- 🧩 Snippets via ByteStash
- 🏠 Home Assistant integration
- 🧭 Command palette for quick actions

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Zustand
- Docker for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for deployment)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Deployment

```bash
# Build and run with Docker
docker-compose up -d
```

## Documentation

- [Design Document](DESIGN.md)
- [Feature Spec](FEATURES.md)
- [UI/UX Spec](UI_UX.md)
- [Architecture](ARCHITECTURE.md)
- [Implementation Plan](PLAN.md)
- [Tasks](TASKS.md)
- [AI Assistant Instructions](CLAUDE.md)
- [Agent Workflow](AGENTS.md)

## Quick Start (Docs + Scaffold)

```bash
# Optional scaffold
chmod +x scaffold-dashboard.sh
./scaffold-dashboard.sh

# Or initialize with Vite
npm create vite@latest . -- --template react-ts
npm install
```

## Contributing

See `CLAUDE.md` for AI assistant instructions and `AGENTS.md` for workflow.

## License

TBD
