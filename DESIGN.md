# Design Document: Mashb0ard

> **Status:** Draft  
> **Last Updated:** 2025-01-05  
> **Author:** Matt + Claude

---

## Elevator Pitch

**Mashb0ard** is a browser new tab replacement that consolidates your daily tools into one keyboard-driven workspace. Instead of juggling tabs for AI chat, notes, terminals, and bookmarks, everything lives in a single unified interface — your personal command center.

---

## Problem Statement

Power users and self-hosters face a daily friction: the tools they use constantly are scattered across browser tabs.

**The typical morning:**
- Open a tab for Claude
- Open a tab for ChatGPT (for comparison)
- Open a tab for quick notes
- Open a tab for SSH/terminal access
- Open a tab for Uptime Kuma to check services
- Open 4 more tabs for whatever project you're working on

That's 9+ tabs before you've done anything — and constant context-switching between them throughout the day.

**The pain points:**
1. **Context-switching fatigue** — Alt-tabbing between AI chat, notes, and work disrupts flow
2. **No unified AI access** — Using multiple AI providers means multiple tabs, multiple logins, multiple interfaces
3. **Workflow friction** — Starting a task (3D printing, home lab work, news reading) means manually opening several related sites
4. **Generic new tab pages** — Default browser pages are useless; alternatives are cluttered with content you don't want

---

## Target User

**Solo developer / power user who self-hosts services.**

Characteristics:
- Runs a home lab (Proxmox, Docker, various services)
- Uses multiple AI assistants (Claude, ChatGPT, Gemini, Perplexity)
- Values keyboard-driven interfaces
- Wants control over their tools, not vendor lock-in
- Comfortable with self-hosting and light configuration

This is a personal productivity tool, not a team/enterprise product.

---

## Core Value Proposition

> **One tab that replaces ten.**

Mashb0ard consolidates the tools you reach for constantly:
- **AI Chat** — Multiple providers in one interface, no tab juggling
- **Notes** — Quick capture always accessible, no app switching  
- **Terminal** — SSH access embedded, not buried in another app
- **Workflow Launcher** — One click opens your entire project context
- **Status at a glance** — See if your services are healthy without hunting for a tab

All of it keyboard-navigable. All of it in your new tab page.

---

## Solution Overview

### Architecture: Workspace, Not Launcher

Mashb0ard is designed as a **workspace hub** — you do work *here*, not just launch to other places.

| Component | Behavior |
|-----------|----------|
| AI Chat | Embedded sidebar, chat happens in Mashb0ard via OpenRouter |
| Notes | Embedded sidebar via iframe to self-hosted Dumbpad |
| SSH Terminal | Embedded iframe to Termix with API-driven host selector |
| Links/Workflows | These do open external tabs (the exception) |
| Status Widgets | Embedded, live updates from Termix API |

### External Service Integrations

| Service | URL | Purpose |
|---------|-----|---------|
| **Dumbpad** | dumbpad.mattmariani.com | Notes/scratchpad (iframe embed) |
| **Termix** | termix.mattmariani.com | SSH terminal + server monitoring |

### Key Features (MVP)

**1. AI Chat Sidebar**
- Multi-provider support via OpenRouter (Claude, GPT-4, Gemini, Llama, etc.)
- Streaming responses
- Conversation history (persisted locally)
- Edit and resubmit messages
- Image attachment for vision models
- Extended thinking (Claude) with chain-of-thought fallback
- Copy buttons on responses
- "Continue in New Session" — transfer context to new model via summary or full copy

**2. Workflow Launcher**
- Grouped links that open together (e.g., "3D Printing" opens Printables + OctoPrint + Slicer)
- One-click or keyboard shortcut to launch entire workflow context
- Configurable groups with icons/colors

**3. Quick Links**
- Individual frequently-used links
- Organized in customizable groups
- Keyboard accessible

**4. Notes Sidebar**
- Embedded iframe to Dumbpad (dumbpad.mattmariani.com)
- Slide-out panel, always one shortcut away
- Markdown support provided by Dumbpad

**5. Embedded SSH Terminal**
- Host selector dropdown populated via Termix API (`GET /ssh/db/host`)
- Embedded iframe to Termix terminal for selected host
- Supports: dietpi, piUSBcam, ubuntu (proxmox TBD)

**6. Server Status Widgets**
- Powered by Termix API (replaces Uptime Kuma)
- `GET /status` — online/offline status per host
- `GET /metrics/{id}` — CPU, memory, disk usage
- `GET /ssh/tunnel/status` — tunnel connection states
- At-a-glance health with drill-down capability

**7. Keyboard-First Navigation**
- All major actions have shortcuts
- Command palette for discoverability
- Consistent patterns (Escape closes, Mod+Enter submits)

### Post-MVP Features (Planned)
- Cross-session chat memory (summarization or semantic retrieval)
- Document attachment in AI chat (PDF, code files, etc.)
- Home Assistant integration (entity cards, controls) — MVP is link-only
- Widget system for extensibility
- Calendar integration
- RSS feed panel
- Proxmox host in Termix

---

## Design Principles

### Ambient Guidance
The UI guides without interrupting. Visual hierarchy, color, and subtle animation surface what matters *right now* without tooltips or instructions.

### Keyboard-First
Ten useful shortcuts with muscle memory beat 100 documented but forgotten. Every shortcut earns its place through daily use.

### Consolidation Over Launching
The goal is to reduce tabs, not add a fancy bookmark page. Features that can live *inside* Mashb0ard should; external links are the exception.

### Personal, Not Social
This is your space. No sharing features, no accounts, no syncing to cloud services (unless you want it). Self-hosted, self-controlled.

---

## Technical Approach (High Level)

| Aspect | Approach |
|--------|----------|
| Deployment | Self-hosted Docker container |
| Browser Integration | Extension for new tab override |
| AI Integration | OpenRouter API (client-side calls with user's API key) |
| Notes | iframe embed to Dumbpad instance |
| Terminal | iframe embed to Termix + Termix API for host list |
| Status/Monitoring | Termix API for server status and metrics |
| Persistence | Local storage for MVP; optional backend later |
| Framework | TBD (React, Svelte, or Vue) |

### Termix API Integration

Mashb0ard will authenticate with Termix and use:
- `GET /ssh/db/host` — populate host selector
- `GET /status` — server online/offline status
- `GET /metrics/{id}` — CPU, memory, disk per host
- `GET /ssh/tunnel/status` — tunnel connection states

Auth: JWT bearer token (stored securely, same as OpenRouter key)

---

## Success Criteria

**Launch-ready when:**
- [ ] Replaces my browser new tab without friction
- [ ] AI chat works reliably with at least 3 providers
- [ ] Workflow launcher opens grouped links correctly
- [ ] Notes sidebar loads Dumbpad reliably
- [ ] SSH terminal connects to hosts via Termix
- [ ] Server status widgets display live data from Termix
- [ ] Keyboard shortcuts feel natural for daily tasks

**Long-term success:**
- This becomes the default starting point for my computing day
- I stop opening separate tabs for AI chat, notes, and terminal
- Launching workflows feels faster than my current tab group approach

---

## Open Questions

- [ ] Final stack decision (React vs Svelte vs Vue)
- [ ] Backend requirements — can we stay fully client-side for MVP?
- [ ] API key storage — local storage vs encrypted backend
- [ ] Browser extension architecture — pure extension vs. hosted app with extension wrapper

---

## Appendix: Name

**Mashb0ard** (stylized with zero)
- Personal: "Mash" from Matt
- Functional: "Dashboard" conveys purpose
- Memorable: The zero adds character

---

*This document will evolve as decisions are made. See FEATURES.md for detailed feature specs and UI_UX.md for interface design.*
