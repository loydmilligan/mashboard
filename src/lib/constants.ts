export const APP_NAME = 'Mashb0ard'
export const APP_VERSION = '0.1.0'

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_AI_SIDEBAR: 'mod+/',
  TOGGLE_NOTES_SIDEBAR: 'mod+shift+n',
  TOGGLE_TERMINAL: 'mod+`',
  TOGGLE_SNIPPETS: 'mod+shift+b',
  OPEN_SETTINGS: 'mod+,',
  OPEN_COMMAND_PALETTE: 'mod+k',
  CLOSE_OVERLAY: 'escape',
} as const

export const LAYOUT = {
  HEADER_HEIGHT: 56,
  SIDEBAR_WIDTH: 320,
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 1200, // Allow sidebars to be very wide
  TERMINAL_MIN_HEIGHT: 100,
  TERMINAL_MAX_HEIGHT_VH: 60,
} as const

export const STORAGE_KEYS = {
  SETTINGS: 'mashb0ard-settings',
  CHAT: 'mashb0ard-chat',
  WORKFLOWS: 'mashb0ard-workflows',
  PINNED_NOTES: 'mashb0ard-pinned-notes',
  MUSIC_LEAGUE: 'mashb0ard-music-league',
  UI: 'mashb0ard-ui',
  LAYOUT: 'mashb0ard-layout',
  CONTENT_TABS: 'mashb0ard-content-tabs',
  POMODORO: 'mashb0ard-pomodoro',
  HABITS: 'mashb0ard-habits',
} as const

export const POMODORO = {
  WORK_DURATION: 25 * 60, // 25 minutes in seconds
  SHORT_BREAK: 5 * 60, // 5 minutes
  LONG_BREAK: 15 * 60, // 15 minutes
  SESSIONS_BEFORE_LONG_BREAK: 4,
} as const
