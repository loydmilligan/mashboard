# Better Brain: mashb0ard Feature Spec

> **Version:** 0.1.0
> **Last Updated:** 2025-01-12
> **Type:** Tool (Content Tab + Widget)
> **Backend:** Better Brain API (`/api/betterbrain/`)

---

## Overview

Better Brain is a **tool** that adds two components to mashb0ard:

1. **Library Tab** — A content browser for saved 3D models, GitHub repos, YouTube videos, and news articles
2. **Briefing Widget** — A dashboard widget showing the latest daily briefing

The tool consumes the Better Brain API, which processes bookmarks from Karakeep and enriches them with LLM-extracted metadata.

---

## Architecture Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              mashb0ard                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Content Tabs                                 │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────────┐   │   │
│  │  │ Termix  │ │ByteStash│ │ SearXNG │ │  Better Brain Library   │   │   │
│  │  │         │ │         │ │         │ │  (NEW)                  │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Dashboard Widgets                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────────────────────────┐   │   │
│  │  │ Tasks   │ │ Habits  │ │  Daily Briefing (NEW)               │   │   │
│  │  └─────────┘ └─────────┘ └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐   │
│  │  betterBrainStore │  │ betterBrainService│  │  types/betterBrain.ts │   │
│  │  (Zustand)        │  │ (API client)      │  │  (TypeScript types)   │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP JSON
                                      ▼
                    ┌─────────────────────────────────────┐
                    │  /api/betterbrain/* (nginx proxy)   │
                    │         ↓                           │
                    │  Better Brain FastAPI Service       │
                    └─────────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── features/
│       └── better-brain/
│           ├── index.ts                    # Barrel export
│           ├── BetterBrainLibrary.tsx      # Main library tab component
│           ├── BetterBrainBriefing.tsx     # Dashboard widget
│           ├── LibraryGrid.tsx             # Grid view for items
│           ├── LibraryFilters.tsx          # Filter controls
│           ├── ItemCard.tsx                # Individual item card
│           ├── ItemDetailModal.tsx         # Item detail view
│           └── BriefingContent.tsx         # Briefing markdown renderer
├── services/
│   └── betterBrain.ts                      # API client
├── stores/
│   └── betterBrainStore.ts                 # Zustand store
└── types/
    └── betterBrain.ts                      # TypeScript definitions
```

---

## TypeScript Types

```typescript
// src/types/betterBrain.ts

export type ContentType = 'model' | 'repo' | 'video' | 'news';

export type ItemStatus = 'pending' | 'processing' | 'processed' | 'failed';

export interface BBItem {
  id: number;
  url: string;
  title: string;
  content_type: ContentType;
  source: string | null;
  thumbnail_url: string | null;
  summary: string | null;
  status: ItemStatus;
  ingested_at: string;  // ISO datetime
  metadata: Record<string, unknown>;
}

export interface BBItemDetail extends BBItem {
  raw_content: string | null;
  published_at: string | null;
  processed_at: string | null;
  error_message: string | null;
  tags: string[];
  entities: BBEntity[];
}

export interface BBEntity {
  id: number;
  name: string;
  entity_type: 'person' | 'organization' | 'country' | 'topic';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface BBBriefing {
  id: number;
  briefing_type: 'daily' | 'weekly';
  content_markdown: string;
  content_json: BriefingSection[] | null;
  period_start: string;
  period_end: string;
  generated_at: string;
}

export interface BriefingSection {
  title: string;
  content_type: ContentType;
  items: BBItem[];
  summary: string;
}

export interface ItemListResponse {
  items: BBItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchResult {
  id: number;
  url: string;
  title: string;
  content_type: ContentType;
  summary: string | null;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface BBStats {
  total_items: number;
  by_type: Record<ContentType, number>;
  by_status: Record<ItemStatus, number>;
  total_briefings: number;
  last_briefing_at: string | null;
}

// Filter state
export interface LibraryFilters {
  contentType: ContentType | 'all';
  search: string;
  source: string | null;
  sortBy: 'ingested_at' | 'title';
  sortOrder: 'asc' | 'desc';
}
```

---

## API Service

```typescript
// src/services/betterBrain.ts

import { settingsStore } from '@/stores/settingsStore';
import type {
  BBItem,
  BBItemDetail,
  BBBriefing,
  ItemListResponse,
  SearchResponse,
  BBStats,
  ContentType,
} from '@/types/betterBrain';

const getBaseUrl = () => {
  const settings = settingsStore.getState().settings;
  return settings?.betterBrainUrl || '/api/betterbrain';
};

// --- Library ---

export async function getItems(
  contentType: ContentType,
  params: {
    search?: string;
    source?: string;
    since?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ItemListResponse> {
  const baseUrl = getBaseUrl();
  const endpoint = contentType === 'model' ? 'models' :
                   contentType === 'repo' ? 'repos' :
                   contentType === 'video' ? 'videos' : 'news';
  
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.source) searchParams.set('source', params.source);
  if (params.since) searchParams.set('since', params.since);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  
  const response = await fetch(
    `${baseUrl}/library/${endpoint}?${searchParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${contentType}s: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getItem(id: number): Promise<BBItemDetail> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/library/item/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch item: ${response.statusText}`);
  }
  
  return response.json();
}

// --- Search ---

export async function searchItems(
  query: string,
  contentTypes?: ContentType[],
  limit = 20
): Promise<SearchResponse> {
  const baseUrl = getBaseUrl();
  
  const response = await fetch(`${baseUrl}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      content_types: contentTypes,
      limit,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
}

// --- Briefings ---

export async function getLatestBriefing(): Promise<BBBriefing> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/briefing/latest`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No briefings available');
    }
    throw new Error(`Failed to fetch briefing: ${response.statusText}`);
  }
  
  return response.json();
}

export async function generateBriefing(): Promise<BBBriefing> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/briefing/generate`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate briefing: ${response.statusText}`);
  }
  
  // Fetch the generated briefing
  const result = await response.json();
  return getLatestBriefing();
}

// --- Stats ---

export async function getStats(): Promise<BBStats> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  
  return response.json();
}

// --- Health ---

export async function checkHealth(): Promise<boolean> {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## Zustand Store

```typescript
// src/stores/betterBrainStore.ts

import { create } from 'zustand';
import type {
  BBItem,
  BBItemDetail,
  BBBriefing,
  BBStats,
  ContentType,
  LibraryFilters,
} from '@/types/betterBrain';
import * as betterBrainService from '@/services/betterBrain';

interface BetterBrainState {
  // Library state
  items: BBItem[];
  totalItems: number;
  isLoadingItems: boolean;
  itemsError: string | null;
  
  // Selected item
  selectedItem: BBItemDetail | null;
  isLoadingDetail: boolean;
  
  // Filters
  filters: LibraryFilters;
  
  // Briefing state
  latestBriefing: BBBriefing | null;
  isLoadingBriefing: boolean;
  briefingError: string | null;
  
  // Stats
  stats: BBStats | null;
  
  // Service health
  isHealthy: boolean;
  
  // Actions
  fetchItems: (contentType: ContentType, offset?: number) => Promise<void>;
  fetchItemDetail: (id: number) => Promise<void>;
  clearSelectedItem: () => void;
  setFilters: (filters: Partial<LibraryFilters>) => void;
  resetFilters: () => void;
  fetchLatestBriefing: () => Promise<void>;
  generateBriefing: () => Promise<void>;
  fetchStats: () => Promise<void>;
  checkHealth: () => Promise<void>;
  searchItems: (query: string) => Promise<void>;
}

const DEFAULT_FILTERS: LibraryFilters = {
  contentType: 'all',
  search: '',
  source: null,
  sortBy: 'ingested_at',
  sortOrder: 'desc',
};

export const useBetterBrainStore = create<BetterBrainState>((set, get) => ({
  // Initial state
  items: [],
  totalItems: 0,
  isLoadingItems: false,
  itemsError: null,
  
  selectedItem: null,
  isLoadingDetail: false,
  
  filters: DEFAULT_FILTERS,
  
  latestBriefing: null,
  isLoadingBriefing: false,
  briefingError: null,
  
  stats: null,
  isHealthy: false,
  
  // Actions
  fetchItems: async (contentType, offset = 0) => {
    set({ isLoadingItems: true, itemsError: null });
    
    try {
      const { filters } = get();
      const response = await betterBrainService.getItems(contentType, {
        search: filters.search || undefined,
        source: filters.source || undefined,
        limit: 50,
        offset,
      });
      
      set({
        items: offset === 0 ? response.items : [...get().items, ...response.items],
        totalItems: response.total,
        isLoadingItems: false,
      });
    } catch (error) {
      set({
        isLoadingItems: false,
        itemsError: error instanceof Error ? error.message : 'Failed to load items',
      });
    }
  },
  
  fetchItemDetail: async (id) => {
    set({ isLoadingDetail: true });
    
    try {
      const item = await betterBrainService.getItem(id);
      set({ selectedItem: item, isLoadingDetail: false });
    } catch (error) {
      set({ isLoadingDetail: false });
      console.error('Failed to fetch item detail:', error);
    }
  },
  
  clearSelectedItem: () => set({ selectedItem: null }),
  
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  
  fetchLatestBriefing: async () => {
    set({ isLoadingBriefing: true, briefingError: null });
    
    try {
      const briefing = await betterBrainService.getLatestBriefing();
      set({ latestBriefing: briefing, isLoadingBriefing: false });
    } catch (error) {
      set({
        isLoadingBriefing: false,
        briefingError: error instanceof Error ? error.message : 'Failed to load briefing',
      });
    }
  },
  
  generateBriefing: async () => {
    set({ isLoadingBriefing: true, briefingError: null });
    
    try {
      await betterBrainService.generateBriefing();
      await get().fetchLatestBriefing();
    } catch (error) {
      set({
        isLoadingBriefing: false,
        briefingError: error instanceof Error ? error.message : 'Failed to generate briefing',
      });
    }
  },
  
  fetchStats: async () => {
    try {
      const stats = await betterBrainService.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },
  
  checkHealth: async () => {
    const isHealthy = await betterBrainService.checkHealth();
    set({ isHealthy });
  },
  
  searchItems: async (query) => {
    set({ isLoadingItems: true, itemsError: null });
    
    try {
      const response = await betterBrainService.searchItems(query);
      // Convert search results to items format
      set({
        items: response.results.map(r => ({
          id: r.id,
          url: r.url,
          title: r.title,
          content_type: r.content_type,
          summary: r.summary,
          source: null,
          thumbnail_url: null,
          status: 'processed' as const,
          ingested_at: '',
          metadata: { score: r.score },
        })),
        totalItems: response.total,
        isLoadingItems: false,
      });
    } catch (error) {
      set({
        isLoadingItems: false,
        itemsError: error instanceof Error ? error.message : 'Search failed',
      });
    }
  },
}));
```

---

## UI Components

### Library Tab Component

```typescript
// src/components/features/better-brain/BetterBrainLibrary.tsx

import React, { useEffect, useState } from 'react';
import { useBetterBrainStore } from '@/stores/betterBrainStore';
import { LibraryGrid } from './LibraryGrid';
import { LibraryFilters } from './LibraryFilters';
import { ItemDetailModal } from './ItemDetailModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Database, AlertCircle } from 'lucide-react';
import type { ContentType } from '@/types/betterBrain';

export function BetterBrainLibrary() {
  const [activeTab, setActiveTab] = useState<ContentType>('model');
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    items,
    totalItems,
    isLoadingItems,
    itemsError,
    selectedItem,
    isHealthy,
    fetchItems,
    fetchItemDetail,
    clearSelectedItem,
    checkHealth,
    searchItems,
  } = useBetterBrainStore();
  
  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, []);
  
  // Fetch items when tab changes
  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchItems(searchQuery.trim());
    } else {
      fetchItems(activeTab);
    }
  };
  
  if (!isHealthy) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Better Brain service is not available</p>
        <p className="text-sm">Check that the service is running</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <h2 className="font-semibold">Better Brain Library</h2>
          <span className="text-sm text-muted-foreground">
            {totalItems} items
          </span>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <button type="submit" className="p-2 hover:bg-accent rounded">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      {/* Content Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
        <TabsList className="px-4 pt-2">
          <TabsTrigger value="model">3D Models</TabsTrigger>
          <TabsTrigger value="repo">Repos</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>
        
        {/* Grid Content */}
        <div className="flex-1 overflow-auto p-4">
          {itemsError ? (
            <div className="text-center text-destructive py-8">
              {itemsError}
            </div>
          ) : (
            <LibraryGrid
              items={items}
              isLoading={isLoadingItems}
              onItemClick={(id) => fetchItemDetail(id)}
            />
          )}
        </div>
      </Tabs>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={clearSelectedItem}
        />
      )}
    </div>
  );
}
```

### Briefing Widget Component

```typescript
// src/components/features/better-brain/BetterBrainBriefing.tsx

import React, { useEffect } from 'react';
import { useBetterBrainStore } from '@/stores/betterBrainStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, RefreshCw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export function BetterBrainBriefing() {
  const {
    latestBriefing,
    isLoadingBriefing,
    briefingError,
    fetchLatestBriefing,
    generateBriefing,
  } = useBetterBrainStore();
  
  useEffect(() => {
    fetchLatestBriefing();
  }, []);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="w-4 h-4" />
          Daily Briefing
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateBriefing}
          disabled={isLoadingBriefing}
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingBriefing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        {briefingError ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            {briefingError}
          </div>
        ) : latestBriefing ? (
          <div className="space-y-3">
            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(latestBriefing.generated_at), { addSuffix: true })}
            </div>
            
            {/* Markdown Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {latestBriefing.content_markdown}
              </ReactMarkdown>
            </div>
          </div>
        ) : isLoadingBriefing ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading briefing...
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No briefing available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Settings Integration

Add to `settingsStore.ts` (or settings schema):

```typescript
// Add to settings interface
interface Settings {
  // ... existing settings
  betterBrainUrl: string;  // Default: '/api/betterbrain'
  betterBrainEnabled: boolean;
}
```

Add to Settings UI:

```typescript
// In Settings dialog, add a section:
<SettingsSection title="Better Brain">
  <SettingsField
    label="API URL"
    description="Better Brain service URL"
  >
    <Input
      value={settings.betterBrainUrl}
      onChange={(e) => updateSetting('betterBrainUrl', e.target.value)}
      placeholder="/api/betterbrain"
    />
  </SettingsField>
  <SettingsField
    label="Enable Better Brain"
    description="Show Better Brain in content tabs"
  >
    <Switch
      checked={settings.betterBrainEnabled}
      onCheckedChange={(v) => updateSetting('betterBrainEnabled', v)}
    />
  </SettingsField>
</SettingsSection>
```

---

## Content Tab Registration

Add Better Brain to the content tabs system:

```typescript
// In ContentArea.tsx or content tab config

const CONTENT_APPS = [
  { id: 'termix', label: 'Termix', icon: Terminal, component: TermixTab },
  { id: 'bytestash', label: 'ByteStash', icon: Code, component: ByteStashTab },
  { id: 'searxng', label: 'Search', icon: Search, component: SearxngTab },
  // Add Better Brain
  { id: 'betterbrain', label: 'Library', icon: Database, component: BetterBrainLibrary },
];
```

---

## Dashboard Widget Registration

Add briefing widget to dashboard:

```typescript
// In Dashboard.tsx or widget config

const DASHBOARD_WIDGETS = [
  { id: 'tasks', component: TasksWidget },
  { id: 'habits', component: HabitsWidget },
  // Add Better Brain Briefing
  { id: 'briefing', component: BetterBrainBriefing },
];
```

---

## Keyboard Shortcuts

Consider adding:

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Open Better Brain Library tab |
| `Cmd+Shift+D` | Generate new briefing |

---

## nginx Configuration

Add to `nginx.proxy.template.conf`:

```nginx
location /api/betterbrain/ {
    proxy_pass http://better-brain:8000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "date-fns": "^3.0.0"
  }
}
```

(These may already be present in mashb0ard)

---

## Acceptance Criteria

- [ ] Library tab shows in content area when enabled
- [ ] Can switch between 4 content type tabs (Models, Repos, Videos, News)
- [ ] Grid displays items with thumbnails (where available)
- [ ] Clicking item opens detail modal
- [ ] Search filters items across all types
- [ ] Briefing widget shows on dashboard
- [ ] Can manually trigger briefing generation
- [ ] Settings allow enabling/disabling the tool
- [ ] Graceful handling when Better Brain service is unavailable
