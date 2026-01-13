import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Zap } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { openRouterService } from '@/services/openrouter'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ModelSelector } from './ModelSelector'
import { cn } from '@/lib/utils'

export function AIChatSidebar() {
  const { aiSidebarOpen, toggleAiSidebar, aiSidebarWidth, setAiSidebarWidth } = useUIStore()
  const {
    activeConversation,
    isStreaming,
    streamingContent,
    reasoningContent,
    error,
    createConversation,
    addMessage,
    setStreaming,
    appendStreamingContent,
    appendReasoningContent,
    commitStreamingContent,
    setError,
    clearConversations,
    updateLastMessage,
  } = useChatStore()

  // Streaming setting from settings store (default) with local override
  const defaultStreamingEnabled = useSettingsStore((s) => s.ai.streamingEnabled)
  const setAIPreferences = useSettingsStore((s) => s.setAIPreferences)
  const [localStreamingEnabled, setLocalStreamingEnabled] = useState<boolean | null>(null)

  // Use local override if set, otherwise use default from settings
  const streamingEnabled = localStreamingEnabled ?? defaultStreamingEnabled

  const abortControllerRef = useRef<AbortController | null>(null)

  // Batched streaming update refs - accumulate chunks and flush periodically
  // This prevents excessive re-renders that can freeze the browser
  const streamingBufferRef = useRef<string>('')
  const reasoningBufferRef = useRef<string>('')
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const FLUSH_INTERVAL_MS = 50 // Update UI at most 20 times per second

  // Flush buffers to state
  const flushBuffers = useCallback(() => {
    if (streamingBufferRef.current) {
      appendStreamingContent(streamingBufferRef.current)
      streamingBufferRef.current = ''
    }
    if (reasoningBufferRef.current) {
      appendReasoningContent(reasoningBufferRef.current)
      reasoningBufferRef.current = ''
    }
  }, [appendStreamingContent, appendReasoningContent])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current)
      }
    }
  }, [])

  const conversation = activeConversation()

  const handleSend = useCallback(
    async (content: string) => {
      // Create conversation if none exists
      let convId = conversation?.id
      if (!convId) {
        convId = createConversation()
      }

      const conv = useChatStore.getState().activeConversation()
      if (!conv) return

      // Add user message
      addMessage({ role: 'user', content })

      // Add empty assistant message
      addMessage({ role: 'assistant', content: '', model: conv.model })

      // Start loading/streaming state
      setStreaming(true)
      setError(null)

      // Create abort controller
      abortControllerRef.current = new AbortController()

      try {
        const messages = [
          ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content },
        ]

        if (streamingEnabled) {
          // Streaming mode - handles both regular and reasoning models
          // Use batched updates to prevent browser freeze from excessive re-renders

          // Start flush interval for batched UI updates
          flushIntervalRef.current = setInterval(flushBuffers, FLUSH_INTERVAL_MS)

          try {
            for await (const chunk of openRouterService.streamChat(messages, conv.model)) {
              if (abortControllerRef.current?.signal.aborted) {
                break
              }

              if (chunk.type === 'reasoning') {
                // Model is thinking - buffer reasoning content
                reasoningBufferRef.current += chunk.text
              } else if (chunk.type === 'content') {
                // Model is outputting actual response - buffer content
                streamingBufferRef.current += chunk.text
              }
            }

            // Final flush to ensure all buffered content is displayed
            flushBuffers()
          } finally {
            // Stop the flush interval
            if (flushIntervalRef.current) {
              clearInterval(flushIntervalRef.current)
              flushIntervalRef.current = null
            }
          }

          // Commit the streaming content to the message
          commitStreamingContent()
        } else {
          // Non-streaming mode
          const response = await openRouterService.chat(messages, conv.model)
          updateLastMessage(response)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        // Update the last message with the error
        useChatStore.getState().updateLastMessage(`Error: ${errorMessage}`)
      } finally {
        setStreaming(false)
        abortControllerRef.current = null
      }
    },
    [
      conversation,
      createConversation,
      addMessage,
      setStreaming,
      commitStreamingContent,
      setError,
      streamingEnabled,
      updateLastMessage,
      flushBuffers,
    ]
  )

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort()
    // Stop the flush interval
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current)
      flushIntervalRef.current = null
    }
    // Flush any remaining buffered content
    flushBuffers()
    // Clear buffers
    streamingBufferRef.current = ''
    reasoningBufferRef.current = ''
    commitStreamingContent()
    setStreaming(false)
  }, [commitStreamingContent, setStreaming, flushBuffers])

  const handleModelChange = useCallback(
    (model: string) => {
      if (conversation) {
        // Update the conversation model
        const conversations = useChatStore.getState().conversations.map((c) =>
          c.id === conversation.id ? { ...c, model } : c
        )
        useChatStore.setState({ conversations })
      }
    },
    [conversation]
  )

  const handleNewChat = useCallback(() => {
    createConversation()
  }, [createConversation])

  const handleStreamingToggle = useCallback(
    (checked: boolean) => {
      setLocalStreamingEnabled(checked)
      // Also update the default setting
      setAIPreferences({ streamingEnabled: checked })
    },
    [setAIPreferences]
  )

  return (
    <Sidebar
      side="left"
      open={aiSidebarOpen}
      onClose={toggleAiSidebar}
      title="AI Chat"
      width={aiSidebarWidth}
      onWidthChange={setAiSidebarWidth}
    >
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <div className="flex-1">
            <ModelSelector
              value={conversation?.model || 'anthropic/claude-3.5-sonnet'}
              onChange={handleModelChange}
              disabled={isStreaming}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            disabled={isStreaming}
            className="h-8 w-8"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearConversations}
            disabled={isStreaming || !conversation}
            className="h-8 w-8"
            title="Clear all chats"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Streaming toggle */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 bg-muted/30">
          <label
            htmlFor="streaming-toggle"
            className={cn(
              'flex items-center gap-1.5 text-xs cursor-pointer select-none flex-1',
              isStreaming && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Zap className={cn('h-3 w-3', streamingEnabled && 'text-yellow-500')} />
            Stream responses
          </label>
          <Switch
            id="streaming-toggle"
            checked={streamingEnabled}
            onCheckedChange={handleStreamingToggle}
            disabled={isStreaming}
            className="scale-75"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="border-b border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={conversation?.messages || []}
          streamingContent={streamingContent}
          reasoningContent={reasoningContent}
          isStreaming={isStreaming}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          placeholder="Ask anything..."
        />
      </div>
    </Sidebar>
  )
}
