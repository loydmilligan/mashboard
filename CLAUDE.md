# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mashboard is a personal browser dashboard and command center for self-hosted environments. It provides quick access to link groups, AI chat with multiple providers, persistent notes, integrated search, server monitoring via Uptime Kuma, and Home Assistant integration.

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

## Architecture

### Source Structure

The project follows a feature-based architecture:

- `src/features/` - Feature modules (dashboard, chat, notes, search, status)
- `src/components/` - Shared UI components
- `src/hooks/` - Custom hooks
- `src/utils/` - Utility functions
- `src/config/` - App configuration
- `src/types/` - TypeScript type definitions
- `src/styles/` - Global styles and theming

### External Integrations

| Service | Protocol | Auth |
|---------|----------|------|
| Home Assistant | WebSocket/REST | Long-lived token |
| Uptime Kuma | REST | API key |
| AI Providers | REST | API keys |

## Workflow

### Before Starting Work
1. Check `docs/planning/TASKS.md` for current task assignment
2. Review `AGENTS.md` for multi-agent workflow expectations

### Commit Format
```
type(scope): description

- detail 1
- detail 2

Task: [TASK-ID]
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Key Documentation
- `docs/specs/FEATURES.md` - Feature requirements
- `docs/specs/UI_UX.md` - UI/UX specifications
- `docs/architecture/ARCHITECTURE.md` - Technical decisions

## Current Status

- Phase: 0 - Setup
- Stack: TBD (Node.js 18+, Docker deployment)
