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
