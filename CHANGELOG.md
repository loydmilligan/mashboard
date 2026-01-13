# Changelog

All notable changes to Mashb0ard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2025-01-12

### Added
- **AI Chat Streaming**: Real-time token streaming with batched UI updates for smooth performance
- **Reasoning Models**: Support for models with thinking tokens (o1, DeepSeek, GLM-4)
- **Model Database**: AI models stored in PostgreSQL with nicknames and provider metadata
- **Provider Icons**: Visual indicators for model providers in selector
- **Cost Tier Selector**: Filter models by cost tier in settings
- **Sidebar Width Controls**: Configurable sidebar widths with presets
- **Task Resources**: Attach web links, YouTube, files, notes, SSH connections to tasks
- **Auto-Open Resources**: Resources automatically open when task is claimed via Pomodoro
- **Notes Split View**: Editor/preview split mode with syntax highlighting
- **Context Menus**: Native right-click menus for quick links, tabs, and tools
- **Dozzle Integration**: Docker container log viewing

### Fixed
- AI streaming no longer freezes browser (batched state updates)
- `isStreaming` state now correctly reflects streaming status
- Sidebar resize handles more visible and responsive
- Context menu copy functionality works correctly
- Menu closes properly after selection
- Select.Item empty value error resolved
- Vikunja CORS configuration for proxy setup
- SearXNG settings updated for latest version

### Changed
- Settings now stored in PostgreSQL instead of localStorage
- Improved message layout in AI chat
- Enhanced thinking animation during AI reasoning

## [0.9.0] - 2025-01-10

### Added
- **NoteMark Integration**: Full markdown notebooks with folder organization
- **Habits Tracking**: Daily habits with streaks stored in PostgreSQL
- **Pomodoro Timer**: Built-in timer in header with task claiming workflow
- **Workflows**: Quick-launch URL groups (macros)
- **Quick Links**: Organized link groups with collapsible sections

### Changed
- Backend API moved to Node.js/Express with PostgreSQL
- Improved Docker deployment with nginx reverse proxy

## [0.8.0] - 2025-01-08

### Added
- **Vikunja Integration**: Full task CRUD with priorities, due dates, and projects
- **Task Panel**: Left sidebar showing today's tasks and overdue items
- **Project Filtering**: Filter tasks by Vikunja project

## [0.7.0] - 2025-01-06

### Added
- **AI Chat Sidebar**: OpenRouter-powered chat with model selection
- **Model Favorites**: Pin frequently used models
- **Conversation History**: Multiple conversations with persistence
- **Deep Reasoning Toggle**: Enable/disable reasoning for supported models

## [0.6.0] - 2025-01-04

### Added
- **Content Tabs**: Tabbed interface for embedded services
- **ByteStash Integration**: Code snippets manager
- **SearXNG Integration**: Privacy-respecting metasearch

## [0.5.0] - 2025-01-02

### Added
- **Split Layout**: Draggable 40/60 split pane design
- **Termix Integration**: SSH terminal in content area
- **Dumbpad Integration**: Quick notes sidebar

## [0.4.0] - 2024-12-30

### Added
- **Settings Dialog**: Configure API keys and service URLs
- **Theme Support**: Dark/light mode with system detection
- **Keyboard Shortcuts**: Cmd+K palette, Cmd+/ chat, Cmd+Shift+N notes

## [0.3.0] - 2024-12-28

### Added
- **Command Palette**: Keyboard-driven action launcher
- **shadcn/ui Components**: Consistent UI component library

## [0.2.0] - 2024-12-26

### Added
- **Zustand State Management**: Persistent stores for UI state
- **Service Iframe Component**: Reusable iframe embedding

## [0.1.0] - 2024-12-24

### Added
- Initial project setup
- React 18 + TypeScript + Vite
- Tailwind CSS styling
- Basic layout structure

---

[0.10.0]: https://github.com/youruser/mashboard/releases/tag/v0.10.0
[0.9.0]: https://github.com/youruser/mashboard/releases/tag/v0.9.0
[0.8.0]: https://github.com/youruser/mashboard/releases/tag/v0.8.0
[0.7.0]: https://github.com/youruser/mashboard/releases/tag/v0.7.0
[0.6.0]: https://github.com/youruser/mashboard/releases/tag/v0.6.0
[0.5.0]: https://github.com/youruser/mashboard/releases/tag/v0.5.0
[0.4.0]: https://github.com/youruser/mashboard/releases/tag/v0.4.0
[0.3.0]: https://github.com/youruser/mashboard/releases/tag/v0.3.0
[0.2.0]: https://github.com/youruser/mashboard/releases/tag/v0.2.0
[0.1.0]: https://github.com/youruser/mashboard/releases/tag/v0.1.0
