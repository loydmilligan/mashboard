export interface Workflow {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  urls: string[]
  createdAt: number
  updatedAt: number
}

export interface QuickLink {
  id: string
  name: string
  url: string
  icon?: string
}

export interface LinkGroup {
  id: string
  name: string
  links: QuickLink[]
  collapsed?: boolean
}

export const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'work-morning',
    name: 'Morning Routine',
    description: 'Start the day',
    icon: 'coffee',
    color: '#f59e0b',
    urls: [
      'https://mail.google.com',
      'https://calendar.google.com',
      'https://github.com',
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'dev-setup',
    name: 'Dev Setup',
    description: 'Development tools',
    icon: 'code',
    color: '#3b82f6',
    urls: [
      'https://github.com',
      'https://stackoverflow.com',
      'https://chat.openai.com',
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export const DEFAULT_LINK_GROUPS: LinkGroup[] = [
  {
    id: 'productivity',
    name: 'Productivity',
    links: [
      { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com' },
      { id: 'calendar', name: 'Calendar', url: 'https://calendar.google.com' },
      { id: 'drive', name: 'Drive', url: 'https://drive.google.com' },
    ],
  },
  {
    id: 'development',
    name: 'Development',
    links: [
      { id: 'github', name: 'GitHub', url: 'https://github.com' },
      { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com' },
      { id: 'npm', name: 'npm', url: 'https://npmjs.com' },
    ],
  },
]

export const WORKFLOW_ICONS = [
  'briefcase',
  'code',
  'coffee',
  'folder',
  'globe',
  'home',
  'layers',
  'mail',
  'monitor',
  'rocket',
  'settings',
  'star',
  'terminal',
  'zap',
] as const

export const WORKFLOW_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
] as const
