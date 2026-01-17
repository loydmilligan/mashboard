import { useEffect, useState } from 'react'
import { useBetterBrainStore } from '@/stores/betterBrainStore'
import { ItemCard } from './ItemCard'
import { ItemDetailModal } from './ItemDetailModal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Database,
  AlertCircle,
  RefreshCw,
  Box,
  Github,
  Youtube,
  Newspaper,
  Loader2,
  LayoutGrid,
} from 'lucide-react'
import type { ContentType } from '@/types/betterBrain'
import { cn } from '@/lib/utils'

const contentTypeTabs: { value: ContentType | 'all'; label: string; icon: typeof Box }[] = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'model', label: 'Models', icon: Box },
  { value: 'repo', label: 'Repos', icon: Github },
  { value: 'video', label: 'Videos', icon: Youtube },
  { value: 'news', label: 'News', icon: Newspaper },
]

export function BetterBrainLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all')

  const {
    items,
    totalItems,
    isLoadingItems,
    itemsError,
    selectedItem,
    isLoadingDetail,
    stats,
    isHealthy,
    fetchItems,
    fetchItemDetail,
    clearSelectedItem,
    checkHealth,
    fetchStats,
    searchItems,
    setFilters,
    reprocessPending,
  } = useBetterBrainStore()

  // Check health and fetch data on mount
  useEffect(() => {
    checkHealth().then((healthy) => {
      if (healthy) {
        fetchStats()
        fetchItems()
      }
    })
  }, [])

  // Fetch items when tab changes
  useEffect(() => {
    if (isHealthy) {
      setFilters({ contentType: activeTab })
      if (activeTab === 'all') {
        fetchItems()
      } else {
        fetchItems(activeTab)
      }
    }
  }, [activeTab, isHealthy])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchItems(searchQuery.trim())
    } else {
      fetchItems(activeTab === 'all' ? undefined : activeTab)
    }
  }

  // Handle reprocess
  const handleReprocess = async () => {
    await reprocessPending(20)
    fetchItems(activeTab === 'all' ? undefined : activeTab)
  }

  if (!isHealthy) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">Better Brain service unavailable</p>
        <p className="text-sm mt-1">Check that the service is running</p>
        <Button variant="outline" className="mt-4" onClick={() => checkHealth()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" />
          <h2 className="font-semibold">Better Brain Library</h2>
          <Badge variant="secondary" className="text-xs">
            {totalItems} items
          </Badge>
        </div>

        {/* Stats badges */}
        {stats && (
          <div className="hidden md:flex items-center gap-2">
            {stats.by_status.pending > 0 && (
              <Badge variant="outline" className="text-xs">
                {stats.by_status.pending} pending
              </Badge>
            )}
            {stats.by_status.processing > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-500">
                {stats.by_status.processing} processing
              </Badge>
            )}
            {stats.by_status.failed > 0 && (
              <Badge variant="outline" className="text-xs text-red-500">
                {stats.by_status.failed} failed
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {stats && stats.by_status.pending > 0 && (
            <Button variant="outline" size="sm" onClick={handleReprocess}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Process Pending
            </Button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Content Type Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ContentType | 'all')}
        className="px-4 pt-2"
      >
        <TabsList>
          {contentTypeTabs.map((tab) => {
            const TabIcon = tab.icon
            const count =
              tab.value === 'all'
                ? stats?.total_items
                : stats?.by_type[tab.value]
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <TabIcon className="h-4 w-4" />
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className="text-xs text-muted-foreground">({count})</span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-4">
        {itemsError ? (
          <div className="text-center text-destructive py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            {itemsError}
          </div>
        ) : isLoadingItems && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No items found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('')
                  fetchItems(activeTab === 'all' ? undefined : activeTab)
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => fetchItemDetail(item.id)} />
            ))}
          </div>
        )}

        {/* Load more indicator */}
        {isLoadingItems && items.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && !isLoadingDetail && (
        <ItemDetailModal item={selectedItem} onClose={clearSelectedItem} />
      )}
    </div>
  )
}
