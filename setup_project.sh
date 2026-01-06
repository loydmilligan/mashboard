#!/bin/bash

# ============================================
# Project Scaffold: Personal Browser Dashboard
# ============================================
# Run: chmod +x scaffold-dashboard.sh && ./scaffold-dashboard.sh [project-name]
# Default name: "launchpad" (change later if needed)

PROJECT_NAME="${1:-launchpad}"

echo "🚀 Scaffolding project: $PROJECT_NAME"

# Create root directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME" || exit 1

# ============================================
# Documentation Structure
# ============================================
mkdir -p docs/{design,specs,architecture}

# Design Doc (elevator pitch)
cat > docs/design/DESIGN.md << 'EOF'
# Design Document: [Project Name]

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## Overview

[One paragraph elevator pitch]

## Problem Statement

[What pain point does this solve?]

## Target User

[Who is this for?]

## Core Value Proposition

[Why would someone use this over alternatives?]

## High-Level Solution

[Brief description of the approach]

## Success Criteria

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Out of Scope (MVP)

- [Feature explicitly not included]

## Open Questions

- [ ] [Unresolved decision]
EOF

# Feature Spec
cat > docs/specs/FEATURES.md << 'EOF'
# Feature Specification

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## Feature Overview

| Feature | Priority | Status |
|---------|----------|--------|
| Central Dashboard | P0 | Planned |
| AI Chat Sidebar | P0 | Planned |
| Notes Sidebar | P1 | Planned |
| Integrated Search | P1 | Planned |
| Server Monitoring | P2 | Planned |
| Home Assistant Integration | P2 | Planned |

---

## Feature: Central Dashboard

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]
- [ ] [Specific testable requirement]

### Technical Notes
[Implementation considerations]

---

## Feature: AI Chat Sidebar

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]

### Technical Notes
[Implementation considerations]

---

## Feature: Notes Sidebar

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]

---

## Feature: Integrated Search

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]

---

## Feature: Server Monitoring (Uptime Kuma)

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]

---

## Feature: Home Assistant Integration

### Description
[What it does]

### User Stories
- As a user, I want to [action] so that [benefit]

### Acceptance Criteria
- [ ] [Specific testable requirement]
EOF

# UI/UX Spec
cat > docs/specs/UI_UX.md << 'EOF'
# UI/UX Specification

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## Design Principles

### Ambient Guidance Philosophy
[Summary of guiding UX philosophy]

### Visual Hierarchy
[Elevation, color, attention system]

### Keyboard-First Interaction
[Shortcut philosophy and core patterns]

---

## Screen Inventory

### 1. Main Dashboard (Default View)
**Purpose:** [What the user sees/does here]

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Header / Search Bar]                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Main Content Area]                                │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Status Bar / Footer]                              │
└─────────────────────────────────────────────────────┘
```

**Key Elements:**
- Element 1: [Description]
- Element 2: [Description]

**Interactions:**
- [Action]: [Result]

---

### 2. AI Chat Sidebar (Slide-out)
**Purpose:** [What the user sees/does here]

**Layout:**
```
[ASCII wireframe]
```

**Key Elements:**
- [Element descriptions]

**Interactions:**
- [Action]: [Result]

---

### 3. Notes Sidebar (Slide-out)
**Purpose:** [What the user sees/does here]

**Layout:**
```
[ASCII wireframe]
```

---

## User Flows

### Flow 1: Quick AI Query
1. User opens new tab
2. [Step]
3. [Step]
4. [Result]

### Flow 2: Launch Self-Hosted Service
1. [Step]
2. [Step]

### Flow 3: Quick Note Capture
1. [Step]
2. [Step]

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mod + K` | Open command palette | Global |
| `Mod + /` | Focus AI chat | Global |
| `Mod + N` | New note | Global |
| `Escape` | Close sidebar / dismiss | Global |
| `Mod + Enter` | Submit | In input fields |
| `Mod + [1-9]` | Jump to link group | Dashboard |

---

## Component Library

### Buttons
[Variants, states, usage guidelines]

### Cards
[Link cards, status cards, widget cards]

### Sidebars
[Slide-out behavior, push vs overlay]

### Inputs
[Search bar, chat input, note editor]

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1200px) | Full layout, sidebars push |
| Tablet (768-1200px) | [Behavior] |
| Mobile (<768px) | [Behavior - if supported] |

---

## Theming

### Color Tokens
| Token | Light | Dark |
|-------|-------|------|
| `--bg-primary` | | |
| `--text-primary` | | |
| `--accent` | | |

### Dark Mode
[Implementation approach]
EOF

# Architecture Doc
cat > docs/architecture/ARCHITECTURE.md << 'EOF'
# Architecture Overview

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## System Overview

```
[High-level architecture diagram - ASCII or describe]
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | TBD | |
| Styling | TBD | |
| State Management | TBD | |
| Backend (if needed) | TBD | |
| Database | TBD | |
| Deployment | Docker | Self-hosted requirement |

## Component Architecture

```
[Component tree or module diagram]
```

## Data Flow

### Local Storage
[What's stored client-side]

### API Integrations
| Service | Protocol | Auth Method |
|---------|----------|-------------|
| Home Assistant | WebSocket/REST | Long-lived token |
| Uptime Kuma | REST | API key |
| AI Providers | REST | API keys |
| Search Backend | REST | Varies |

## Security Considerations

### API Key Storage
[Approach for handling sensitive credentials]

### CORS / Proxy Requirements
[Any backend proxy needs]

## Deployment Architecture

```
[Docker Compose structure]
```

## Browser Extension vs Web App

[Decision and rationale]
EOF

# ============================================
# Planning & Task Files
# ============================================
mkdir -p docs/planning

# Plan.md
cat > docs/planning/PLAN.md << 'EOF'
# Implementation Plan

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## Overview

This plan breaks implementation into phases, with integration checkpoints after each phase to ensure components work together.

---

## Phase 0: Project Setup
**Goal:** Development environment, tooling, basic structure

### Deliverables
- [ ] Repository initialized
- [ ] Framework scaffolded
- [ ] Dev server running
- [ ] Linting/formatting configured
- [ ] Docker dev environment (optional)

### Integration Checkpoint
- [ ] `npm run dev` works
- [ ] Empty app renders

---

## Phase 1: Core Shell
**Goal:** Basic layout, navigation, theming foundation

### Deliverables
- [ ] Main layout component (header, content, footer zones)
- [ ] Sidebar slide-out mechanism (empty)
- [ ] Dark/light theme toggle
- [ ] Basic keyboard navigation scaffold

### Integration Checkpoint
- [ ] Sidebars open/close
- [ ] Theme persists across reload
- [ ] No layout shift on sidebar toggle

---

## Phase 2: Dashboard Core
**Goal:** Link groups, static card layout

### Deliverables
- [ ] Link card component
- [ ] Link group component
- [ ] Configuration structure for links
- [ ] Basic responsive grid

### Integration Checkpoint
- [ ] Links clickable, open in new tab
- [ ] Groups render from config
- [ ] Keyboard navigation between cards

---

## Phase 3: Notes Sidebar
**Goal:** Functional note-taking with persistence

### Deliverables
- [ ] Notes sidebar UI
- [ ] Note editor (basic markdown)
- [ ] Local storage persistence
- [ ] Note list/selection

### Integration Checkpoint
- [ ] Notes persist across sessions
- [ ] Sidebar integrates with shell
- [ ] Keyboard shortcuts work

---

## Phase 4: AI Chat Sidebar
**Goal:** Single provider chat working

### Deliverables
- [ ] Chat sidebar UI
- [ ] Message list component
- [ ] Input with submit
- [ ] Single AI provider integration (e.g., Anthropic)
- [ ] Conversation persistence

### Integration Checkpoint
- [ ] Can send message and receive response
- [ ] History persists
- [ ] Sidebar integrates cleanly

---

## Phase 5: Multi-Provider AI
**Goal:** Provider switching, configuration

### Deliverables
- [ ] Provider selector UI
- [ ] Provider abstraction layer
- [ ] Additional providers (OpenAI, Ollama)
- [ ] API key configuration UI

### Integration Checkpoint
- [ ] Can switch providers mid-session
- [ ] Each provider works independently
- [ ] Keys stored securely

---

## Phase 6: Integrated Search
**Goal:** Search bar with backend integration

### Deliverables
- [ ] Search bar component
- [ ] Search results display
- [ ] Backend integration (SearXNG or similar)
- [ ] Search history (optional)

### Integration Checkpoint
- [ ] Search returns results
- [ ] Results clickable
- [ ] Keyboard accessible

---

## Phase 7: Status Integrations
**Goal:** Uptime Kuma and Home Assistant

### Deliverables
- [ ] Status widget component
- [ ] Uptime Kuma API integration
- [ ] Home Assistant API integration
- [ ] Status card variants

### Integration Checkpoint
- [ ] Live status displays
- [ ] Graceful offline handling
- [ ] Refresh mechanism works

---

## Phase 8: Polish & Browser Extension
**Goal:** Production-ready, extension packaged

### Deliverables
- [ ] Browser extension manifest
- [ ] New tab override
- [ ] Performance optimization
- [ ] Error boundaries
- [ ] Empty states
- [ ] Onboarding/setup flow

### Integration Checkpoint
- [ ] Extension installs cleanly
- [ ] All features work in extension context
- [ ] Docker deployment works

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| | | |
EOF

# Tasks.md
cat > docs/planning/TASKS.md << 'EOF'
# Implementation Tasks

> **Status:** Draft
> **Generated from:** PLAN.md
> **Last Updated:** $(date +%Y-%m-%d)

## Task Format

Each task should be atomic and specific enough that different AI agents would implement it similarly.

```
- [ ] **[TASK-ID]** [Description]
  - File(s): [specific files to create/modify]
  - Acceptance: [how to verify completion]
  - Dependencies: [TASK-IDs this depends on]
```

---

## Phase 0: Project Setup

- [ ] **P0-001** Initialize git repository
  - File(s): `.git/`, `.gitignore`
  - Acceptance: `git status` works
  - Dependencies: None

- [ ] **P0-002** Create package.json with project metadata
  - File(s): `package.json`
  - Acceptance: File exists with name, version, scripts
  - Dependencies: P0-001

- [ ] **P0-003** [Additional setup tasks...]
  - File(s): 
  - Acceptance: 
  - Dependencies: 

---

## Phase 1: Core Shell

- [ ] **P1-001** [Task description]
  - File(s): 
  - Acceptance: 
  - Dependencies: 

---

## Phase 2: Dashboard Core

- [ ] **P2-001** [Task description]
  - File(s): 
  - Acceptance: 
  - Dependencies: 

---

[Continue for each phase...]
EOF

# ============================================
# AI Agent Files
# ============================================

# CLAUDE.md
cat > CLAUDE.md << 'EOF'
# CLAUDE.md - AI Agent Instructions

> This file provides context and instructions for AI coding assistants working on this project.

## Project Overview

[Brief description - fill from design doc]

## Repository Structure

```
/
├── docs/
│   ├── design/          # Design documents
│   ├── specs/           # Feature and UI specs
│   ├── architecture/    # Technical architecture
│   └── planning/        # Plan and tasks
├── src/                 # Source code (TBD structure)
├── scripts/             # Utility scripts
├── CLAUDE.md            # This file
└── AGENTS.md            # Multi-agent workflow
```

## Development Workflow

### Before Starting Work
1. Read relevant docs in `/docs/` for context
2. Check `TASKS.md` for current task assignment
3. Review `AGENTS.md` for workflow expectations

### Implementation Process
1. **Implement** the assigned task
2. **Self-review** against acceptance criteria
3. **Request review** from reviewer agent (see AGENTS.md)
4. **Address feedback** if any
5. **Commit** with conventional commit message
6. **Deploy** to dev environment
7. **Test** basic functionality
8. **Report** completion for manual acceptance

### Commit Message Format
```
type(scope): description

- detail 1
- detail 2

Task: [TASK-ID]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code Style Guidelines

[To be filled based on stack decision]

### General Principles
- Prioritize readability over cleverness
- Include error handling and loading states
- Add comments explaining "why" not just "what"
- Self-contained components that can be tested in isolation

## Key Files to Know

| File | Purpose |
|------|---------|
| `[TBD]` | Main entry point |
| `[TBD]` | Configuration |
| `[TBD]` | Theme/styling |

## Common Tasks

### Running Development Server
```bash
# TBD
```

### Running Tests
```bash
# TBD
```

### Building for Production
```bash
# TBD
```

## Current Focus

[Updated as project progresses]

- Current Phase: 0 - Setup
- Active Tasks: None yet
- Blockers: Stack decision pending

## Questions to Ask Human

If unclear about:
- Feature scope or requirements → Check FEATURES.md, ask if still unclear
- UI/UX decisions → Check UI_UX.md, ask if still unclear  
- Architecture decisions → Check ARCHITECTURE.md, ask if still unclear
- Task interpretation → Ask for clarification before implementing
EOF

# AGENTS.md
cat > AGENTS.md << 'EOF'
# AGENTS.md - Multi-Agent Workflow

> Defines the workflow for AI agents collaborating on this project.

## Agent Roles

### Implementer Agent
**Purpose:** Execute tasks from TASKS.md

**Responsibilities:**
- Read and understand task requirements
- Implement code changes
- Write/update tests if applicable
- Self-review against acceptance criteria
- Prepare changes for review

**Constraints:**
- Only work on one task at a time
- Do not merge without reviewer approval
- Ask for clarification rather than assume

---

### Reviewer Agent
**Purpose:** Quality assurance and integration checking

**Responsibilities:**
- Verify implementation matches task requirements
- Check code fits with existing project structure
- Verify acceptance criteria are met
- Check for regressions or conflicts
- Approve or request changes

**Review Checklist:**
- [ ] Code matches task description
- [ ] Acceptance criteria satisfied
- [ ] No obvious bugs or errors
- [ ] Consistent with project code style
- [ ] No conflicts with existing code
- [ ] Error handling present where needed
- [ ] Loading states handled (if UI)

**Feedback Format:**
```
## Review: [TASK-ID]

### Status: [APPROVED / CHANGES REQUESTED]

### Summary
[Brief assessment]

### Issues (if any)
1. [Issue]: [Suggested fix]

### Suggestions (optional, non-blocking)
- [Improvement idea]
```

---

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  1. PICK TASK                                               │
│     Implementer selects next task from TASKS.md             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. IMPLEMENT                                               │
│     Implementer writes code, tests                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SELF-REVIEW                                             │
│     Implementer checks own work against acceptance criteria │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. REQUEST REVIEW                                          │
│     Implementer calls Reviewer agent                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. REVIEW                                                  │
│     Reviewer evaluates changes                              │
│     → If CHANGES REQUESTED: Return to step 2                │
│     → If APPROVED: Continue                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. COMMIT                                                  │
│     Implementer commits with conventional message           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. DEPLOY                                                  │
│     Push to dev environment                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  8. TEST                                                    │
│     Automated tests + basic smoke test                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  9. REPORT                                                  │
│     Notify human for manual acceptance                      │
│     Wait for approval before next task                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Checkpoints

At the end of each phase (see PLAN.md), perform full integration check:

1. **All phase tasks completed** and individually approved
2. **Run full test suite** (when available)
3. **Manual smoke test** of affected features
4. **Check for regressions** in previously completed features
5. **Update documentation** if needed
6. **Human sign-off** before proceeding to next phase

---

## Communication Protocols

### Implementer → Reviewer
```
## Review Request: [TASK-ID]

### Task
[Copy task description]

### Changes Made
- [File]: [What changed]

### Self-Review
- [x] Acceptance criteria 1
- [x] Acceptance criteria 2

### Notes
[Any context for reviewer]
```

### Reviewer → Implementer
[Use Review Feedback Format above]

### Agent → Human
```
## Status Update: [TASK-ID]

### Status: [COMPLETED / BLOCKED / NEEDS INPUT]

### Summary
[What was done]

### Ready for Manual Test
- [ ] [Feature/behavior to verify]

### Questions (if any)
- [Question]
```

---

## Error Handling

### If Task is Unclear
1. Check FEATURES.md and UI_UX.md for context
2. Check ARCHITECTURE.md for technical constraints
3. If still unclear: **STOP and ask human** before implementing

### If Implementation Hits Blocker
1. Document the blocker clearly
2. Propose potential solutions if possible
3. Report to human with `BLOCKED` status
4. Do not proceed with workarounds without approval

### If Review Fails Multiple Times
1. After 2 review cycles, escalate to human
2. May indicate task needs clarification or splitting
EOF

# ============================================
# Source Code Structure (Empty Placeholders)
# ============================================
mkdir -p src/{components,hooks,utils,styles,config,types}
mkdir -p src/features/{dashboard,chat,notes,search,status}

# Placeholder README in src
cat > src/README.md << 'EOF'
# Source Code

Structure will be populated once framework is decided.

## Proposed Structure

```
src/
├── components/       # Shared UI components
├── features/         # Feature-specific modules
│   ├── dashboard/    # Link groups, main grid
│   ├── chat/         # AI chat sidebar
│   ├── notes/        # Notes sidebar
│   ├── search/       # Search integration
│   └── status/       # Uptime Kuma, Home Assistant
├── hooks/            # Custom React/Vue hooks
├── utils/            # Utility functions
├── styles/           # Global styles, theme
├── config/           # App configuration
└── types/            # TypeScript types (if using TS)
```
EOF

# ============================================
# Config & Misc Files
# ============================================
mkdir -p scripts
mkdir -p .vscode

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
.next/
.nuxt/
.output/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test coverage
coverage/

# Misc
.cache/
*.tgz
EOF

# VS Code settings
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.exclude": {
    "node_modules": true
  }
}
EOF

# Root README
cat > README.md << 'EOF'
# [Project Name]

> A personal browser dashboard and command center

## Overview

[Brief description - from design doc]

## Features

- 🔗 Quick access link groups
- 🤖 AI chat with multiple providers
- 📝 Persistent notes
- 🔍 Integrated search
- 📊 Server monitoring (Uptime Kuma)
- 🏠 Home Assistant integration

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

- [Design Document](docs/design/DESIGN.md)
- [Feature Spec](docs/specs/FEATURES.md)
- [UI/UX Spec](docs/specs/UI_UX.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Implementation Plan](docs/planning/PLAN.md)
- [Tasks](docs/planning/TASKS.md)

## Contributing

See [CLAUDE.md](CLAUDE.md) for AI assistant instructions and [AGENTS.md](AGENTS.md) for workflow.

## License

[TBD]
EOF

# ============================================
# Done
# ============================================
echo ""
echo "✅ Project scaffolded successfully!"
echo ""
echo "📁 Structure created:"
echo "   $PROJECT_NAME/"
echo "   ├── docs/"
echo "   │   ├── design/DESIGN.md"
echo "   │   ├── specs/FEATURES.md"
echo "   │   ├── specs/UI_UX.md"
echo "   │   ├── architecture/ARCHITECTURE.md"
echo "   │   └── planning/PLAN.md, TASKS.md"
echo "   ├── src/ (empty, awaiting framework)"
echo "   ├── CLAUDE.md"
echo "   ├── AGENTS.md"
echo "   └── README.md"
echo ""
echo "📝 Next steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. git init"
echo "   3. Decide on framework and update docs"
echo "   4. Fill in DESIGN.md content"
echo ""
