# Mashb0ard Documentation Package

This archive contains all planning and documentation for the Mashb0ard project.

## Contents

| File | Description |
|------|-------------|
| `DESIGN.md` | Project vision, principles, elevator pitch, success criteria |
| `FEATURES.md` | Detailed feature specifications with acceptance criteria |
| `UI_UX.md` | Wireframes, user flows, components, design tokens |
| `ARCHITECTURE.md` | Tech stack, project structure, data flow, deployment |
| `PLAN.md` | Phased implementation roadmap (10 phases) |
| `TASKS.md` | Atomic task checklist (~150 tasks) |
| `CLAUDE.md` | Instructions for AI coding assistants |
| `scaffold-dashboard.sh` | Shell script to create initial project structure |

## Quick Start

1. **Create project folder:**
   ```bash
   mkdir mashb0ard && cd mashb0ard
   ```

2. **Copy docs into a `docs/` folder:**
   ```bash
   mkdir docs
   # Copy all .md files into docs/
   ```

3. **Run the scaffold script (optional):**
   ```bash
   chmod +x scaffold-dashboard.sh
   ./scaffold-dashboard.sh
   ```

4. **Or manually init with Vite:**
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```

5. **Follow TASKS.md Phase 0** to complete setup.

## Using with AI Coding Assistants

When using Claude Code, Cursor, or similar tools:

1. Place `CLAUDE.md` in the project root
2. Reference the other docs as needed
3. Work through `TASKS.md` systematically

## Project Summary

**Mashb0ard** is a personal browser new tab replacement featuring:
- AI Chat (OpenRouter, multi-provider, streaming)
- Workflow Launcher (grouped URL opening)
- Pinned Notes (Dumbpad integration)
- Server Status (Termix API)
- Snippets (ByteStash integration)
- Embedded Terminal (Termix iframe)
- Command Palette (quick actions)

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand

**Deployment:** Docker container + optional browser extension

---

*Generated: 2025-01-06*
