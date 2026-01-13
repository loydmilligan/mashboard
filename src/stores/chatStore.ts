import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, Conversation } from '@/types/chat'
import { STORAGE_KEYS } from '@/lib/constants'
import { useSettingsStore } from './settingsStore'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isStreaming: boolean
  streamingContent: string
  reasoningContent: string  // For reasoning models that stream their thinking
  error: string | null

  // Getters
  activeConversation: () => Conversation | undefined

  // Actions
  createConversation: (model?: string) => string
  setActiveConversation: (id: string | null) => void
  deleteConversation: (id: string) => void
  clearConversations: () => void

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  appendToLastMessage: (content: string) => void

  setStreaming: (streaming: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (content: string) => void
  appendReasoningContent: (content: string) => void
  commitStreamingContent: () => void

  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      streamingContent: '',
      reasoningContent: '',
      error: null,

      activeConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.activeConversationId)
      },

      createConversation: (model) => {
        const defaultModel = model || useSettingsStore.getState().ai.defaultModel
        const id = generateId()
        const conversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          model: defaultModel,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
          error: null,
        }))

        return id
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id, error: null })
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id)
          const newActiveId =
            state.activeConversationId === id
              ? newConversations[0]?.id || null
              : state.activeConversationId

          return {
            conversations: newConversations,
            activeConversationId: newActiveId,
          }
        })
      },

      clearConversations: () => {
        set({
          conversations: [],
          activeConversationId: null,
          error: null,
        })
      },

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        }

        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === state.activeConversationId) {
              // Update title from first user message
              const title =
                c.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                  : c.title

              return {
                ...c,
                title,
                messages: [...c.messages, newMessage],
                updatedAt: Date.now(),
              }
            }
            return c
          })

          return { conversations }
        })
      },

      updateLastMessage: (content) => {
        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === state.activeConversationId && c.messages.length > 0) {
              const messages = [...c.messages]
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content,
              }
              return { ...c, messages, updatedAt: Date.now() }
            }
            return c
          })

          return { conversations }
        })
      },

      appendToLastMessage: (content) => {
        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === state.activeConversationId && c.messages.length > 0) {
              const messages = [...c.messages]
              const lastMessage = messages[messages.length - 1]
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content,
              }
              return { ...c, messages, updatedAt: Date.now() }
            }
            return c
          })

          return { conversations }
        })
      },

      setStreaming: (streaming) => {
        set({ isStreaming: streaming })
        if (!streaming) {
          set({ streamingContent: '', reasoningContent: '' })
        }
      },

      setStreamingContent: (content) => {
        set({ streamingContent: content })
      },

      appendStreamingContent: (content) => {
        set((state) => ({
          streamingContent: state.streamingContent + content,
        }))
      },

      appendReasoningContent: (content) => {
        set((state) => ({
          reasoningContent: state.reasoningContent + content,
        }))
      },

      commitStreamingContent: () => {
        const state = get()
        if (state.streamingContent) {
          state.appendToLastMessage(state.streamingContent)
          set({ streamingContent: '' })
        }
      },

      setError: (error) => {
        // Only stop streaming if there's actually an error
        if (error) {
          set({ error, isStreaming: false })
        } else {
          set({ error })
        }
      },
    }),
    {
      name: STORAGE_KEYS.CHAT,
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)
