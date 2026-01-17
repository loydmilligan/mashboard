// Better Brain Types

export type ContentType = 'model' | 'repo' | 'video' | 'news'

export type ItemStatus = 'pending' | 'processing' | 'processed' | 'failed'

export interface BBItem {
  id: number
  url: string
  title: string
  content_type: ContentType
  source: string | null
  thumbnail_url: string | null
  summary: string | null
  status: ItemStatus
  ingested_at: string // ISO datetime
  metadata: Record<string, unknown>
}

export interface BBItemDetail extends BBItem {
  raw_content: string | null
  published_at: string | null
  processed_at: string | null
  error_message: string | null
  tags: string[]
  entities: BBEntity[]
}

export interface BBEntity {
  id: number
  name: string
  entity_type: 'person' | 'organization' | 'country' | 'topic'
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface BBBriefing {
  id: number
  briefing_type: 'daily' | 'weekly'
  content_markdown: string
  content_json: BriefingContent | null
  period_start: string
  period_end: string
  generated_at: string
}

export interface BriefingContent {
  by_type: Record<ContentType, number>
  item_count: number
}

export interface ItemListResponse {
  items: BBItem[]
  total: number
  limit: number
  offset: number
}

export interface SearchResult {
  id: number
  url: string
  title: string
  content_type: ContentType
  summary: string | null
  score: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}

export interface BBStats {
  total_items: number
  by_type: Record<string, number>
  by_status: Record<string, number>
  total_briefings: number
  last_briefing_at: string | null
  chroma_stats: {
    total_items: number
    persist_dir: string
  } | null
}

export interface LibraryFilters {
  contentType: ContentType | 'all'
  search: string
  source: string | null
  status: ItemStatus | 'all'
}
