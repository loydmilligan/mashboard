# **CLAUDE.md — AI Agent Instructions for Mashb0ard**

This file provides context and instructions for AI coding assistants (Claude, GPT, Cursor, etc.) working on the Mashb0ard project.

## **🚀 Part I: Process, Workflow & Tooling**

*Guidelines on how to perform tasks, use tools, and verify work.*

### **Project Overview**

Mashb0ard is a personal browser new tab replacement that consolidates daily tools into one keyboard-driven workspace. It's a self-hosted React SPA with embedded service integrations.  
Target User: Solo developer/power user who self-hosts services.

### **Workflow**

1. **Task Assignment:** Check TASKS.md for current task assignment.  
2. **Multi-Agent Context:** Review AGENTS.md for role expectations.  
3. **Commit Format:**  
   type(scope): description  
   \- detail 1  
   Task: \[TASK-ID\]

   Types: feat, fix, docs, style, refactor, test, chore

### **🛠 MCP Tooling & Workflows**

**Core Philosophy:** **Do not hallucinate APIs or Documentation.** If you are unsure of a library's specific syntax, the current state of a ticket, or the output of a running server, **use a tool to verify it first.**

#### **1\. UI/UX Implementation (Tailwind \+ Context7)**

* **Trigger:** "Check the docs for \[Component\] via Context7 and validate these styles with the Tailwind tool."  
* **Workflow:**  
  1. **Consult:** Use context7 to fetch the *current* docs for the component library (e.g., shadcn/ui, Radix).  
  2. **Validate:** Use tailwindcss to check if your class utility strings are valid before writing to file.

#### **2\. Browser Automation (Puppeteer)**

* **Trigger:** "Visit \[URL\] and scrape the usage examples for \[Feature\]."  
* **Workflow:**  
  * **Docs:** If a library is obscure, use Puppeteer to scrape its documentation site.  
  * **Debugging:** If debugging a web app, use Puppeteer to take a screenshot or dump console logs.  
* **Constraint:** The browser is headless (Dockerized). You cannot "see" it. Rely on screenshots or console dumps.

#### **3\. Orchestration (Tmux)**

* **Trigger:** "Split the pane, start the dev server, and wait 5 seconds to read the output."  
* **Constraint:** You must be running inside a tmux session. If tmux ls fails, you are blind.  
* **Common Patterns:**  
  * **Non-Blocking Start:** Create a new pane (split-window), run a long process (e.g., npm run dev), wait briefly, then capture-pane to verify it started. **Do not blocking-wait on the main channel.**  
  * **Error Watcher:** If a background service crashes, find its pane index and read the last 50 lines to diagnose.  
  * **Test Runner:** Open a temporary side pane, run tests, report results, and close the pane to keep the workspace clean.

#### **4\. Project Management (Linear)**

* **Trigger:** "Get the details for issue \[LIN-123\] and summarize the acceptance criteria."  
* **Workflow:**  
  * **Start:** Read the active issue to get the *full* description and comments using mcp\_\_linear-server.  
  * **Update:** When finished, post a comment with a link to the PR or a summary of changes.

### **Agent Action Verification**

**IMPORTANT:** At the end of each action, use Chrome browser MCP tools to verify completion.

* **UI Changes:** Take a screenshot of the running app (mcp\_\_chromium-arm64\_\_screenshot) to confirm visual changes.  
* **Deployment:** Navigate to the deployment URL (mcp\_\_chromium-arm64\_\_navigate) and verify load.  
* **Do NOT claim success until you have verified via browser that the action completed correctly.**

## **💻 Part II: Coding Standards & Architecture**

*Snippets, patterns, and technical rules for writing code.*

### **Tech Stack**

| Layer | Technology |
| :---- | :---- |
| Framework | React 18 \+ TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix primitives) |
| State | Zustand (with persist middleware) |
| Icons | Lucide React |
| Backend | Node.js/Express + PostgreSQL |
| Deployment | Docker + nginx reverse proxy |

### **Coding Conventions**

#### **TypeScript**

* **Strict mode enabled** — no any types.  
* **Interfaces over types** for object shapes.  
* **Explicit return types** on functions.

// ✅ Good  
interface Message { id: string; role: 'user'; content: string; }  
function getMessage(id: string): Message | undefined { /\* ... \*/ }

#### **React Components**

* **Functional components only.**  
* **Named exports.**  
* **Props interface** defined above component.

// ✅ Good  
interface ButtonProps { onClick: () \=\> void; children: React.ReactNode; }  
export function Button({ onClick, children }: ButtonProps) { /\* ... \*/ }

#### **Imports & File Naming**

* **Components:** PascalCase (MessageList.tsx)  
* **Hooks/Stores/Services:** camelCase (useChatStore.ts)  
* **Imports:** Absolute imports from src/ (e.g., import { cn } from '@/lib/utils').

#### **Styling**

* **Tailwind utility classes** only.  
* **Use cn()** for conditional classes.

\<div className={cn('p-4 border', isActive && 'bg-accent')}\>

#### **State Management**

* **Zustand** for global state; **React state** for local UI.  
* **No prop drilling.**

// src/stores/uiStore.ts  
export const useUIStore \= create\<UIState\>()(  
  persist(  
    (set) \=\> ({ toggleSidebar: () \=\> set((s) \=\> ({ open: \!s.open })) }),  
    { name: 'mashb0ard-ui' }  
  )  
);

### **Key Patterns**

#### **Keyboard Shortcuts**

Use the useKeyboardShortcuts hook. Always detect OS for modifier keys (mod: true).

useKeyboardShortcuts(\[{ key: '/', mod: true, action: toggleSidebar }\]);

#### **API Services**

Services read credentials from the settings store.

// services/openrouter.ts  
private get apiKey() { return useSettingsStore.getState().openRouterKey; }

#### **Iframe Embedding**

Use ServiceIframe for external tools (Dumbpad, Termix).

\<ServiceIframe src={src} title="Notes" className="h-full" /\>

#### **Streaming Responses**

Handle streaming data (AI Chat) by updating the message chunk-by-chunk in the store.

## **📚 Part III: Operational Reference**

*Commands, URLs, and setup details.*

### **Development Commands**

npm install          \# Install dependencies  
npm run dev          \# Start dev server  
npm run build        \# Production build  
docker-compose up \-d \# Run with Docker  
npx shadcn@latest add \<component\> \# Add UI component

### **Project Structure**

```
mashboard/
├── api/                 # Backend API (Express + PostgreSQL)
│   └── src/index.js     # API routes (habits, task-resources, files)
├── docker/              # Docker configs and nginx proxy
├── src/
│   ├── components/
│   │   ├── features/    # Feature components (ai-chat, tasks, notes, etc.)
│   │   ├── layout/      # Layout components (Header, SplitLayout, ContentArea)
│   │   ├── shared/      # Shared components (ServiceIframe)
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores (settings, ui, content, tasks, etc.)
│   ├── services/        # API clients (vikunja, openrouter, taskResources)
│   ├── types/           # TypeScript definitions
│   └── lib/             # Utilities (cn, constants, openResourceAsTab)
└── public/              # Static assets
```

### **External Service URLs (Defaults)**

| Service | Default URL | Auth |
| :---- | :---- | :---- |
| Mashboard API | /api/mashboard | None (internal) |
| OpenRouter | https://openrouter.ai/api/v1 | Bearer token |
| Vikunja | /api/vikunja | Bearer token |
| NoteMark | /api/notemark | Bearer token |
| Termix | /termix (iframe), /api/termix (API) | JWT Bearer |
| Dumbpad | /dumbpad | None (or PIN) |
| ByteStash | /bytestash | JWT |
| SearXNG | /searxng | None |
| Dozzle | /dozzle | None |

### **Important Notes**

* **Iframe Embedding:** Services must allow embedding (X-Frame-Options or CSP frame-ancestors).
* **API Keys:** Stored in localStorage for MVP. Not secure against physical access.
* **Backend API:** Mashboard has a Node.js/Express backend for habits and task resources.
* **Task Resources:** Files, links, notes can be attached to Vikunja tasks and auto-open on claim.
* **Nginx Proxy:** All services run behind nginx on same origin to avoid CORS/cookie issues.

### **Reference Documents**

* DESIGN.md (Vision), FEATURES.md (Specs), UI\_UX.md (Design), TASKS.md (Checklist)

### **Current Status**

* Phase: 10 Complete (Task Resources feature implemented)

### **Key Features**

* **Split Layout:** 40/60 draggable split with left panel (tools, links, dashboard) and right content area
* **Content Tabs:** Tabbed apps including Termix, ByteStash, SearXNG, and dynamic viewer tabs
* **AI Chat:** OpenRouter-powered chat sidebar with model selection and streaming toggle
* **Notes:** Dumbpad quick notes + NoteMark full markdown notebooks
* **Tasks:** Vikunja integration with priorities, due dates, and task resources
* **Pomodoro:** Timer with task claiming - auto-opens attached resources
* **Task Resources:** Attach web links, YouTube, files, notes, SSH connections to tasks
* **Habits:** Daily habit tracking with streaks (stored in PostgreSQL)
* **Workflows:** Quick-launch URL groups (macros)
* **Quick Links:** Organized link groups with collapsible sections