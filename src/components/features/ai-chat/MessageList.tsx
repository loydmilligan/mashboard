import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextSelectionContextMenu } from '@/components/shared/TextSelectionContextMenu'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/chat'

interface MessageListProps {
  messages: Message[]
  streamingContent?: string
  isStreaming?: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')

          if (match) {
            return (
              <div className="group relative my-2">
                <div className="absolute right-2 top-2 z-10">
                  <CopyButton text={codeString} />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            )
          }

          return (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-2 list-disc pl-4">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-2 list-decimal pl-4">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-3',
        isUser ? 'bg-muted/50' : 'bg-transparent'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && <CopyButton text={message.content} />}
        </div>
        <div className="text-sm">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MessageContent content={message.content} />
          )}
        </div>
      </div>
    </div>
  )
}

export function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages, streamingContent, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <Bot className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="font-medium">Start a conversation</h3>
          <p className="text-sm text-muted-foreground">
            Send a message to begin chatting with AI
          </p>
        </div>
      </div>
    )
  }

  // Filter out the empty assistant message placeholder when streaming
  // (the streaming content will be shown in the streaming bubble instead)
  const displayMessages = isStreaming
    ? messages.filter((m, i) => !(i === messages.length - 1 && m.role === 'assistant' && m.content === ''))
    : messages

  return (
    <TextSelectionContextMenu>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {displayMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming/Thinking indicator - shown while waiting for or receiving response */}
        {isStreaming && (
          <div className="group flex gap-3 px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium">Assistant</span>
                {streamingContent && (
                  <span className="text-xs text-muted-foreground">typing...</span>
                )}
              </div>
              <div className="text-sm">
                {streamingContent ? (
                  /* Show streaming content as it arrives */
                  <MessageContent content={streamingContent} />
                ) : (
                  /* Thinking animation while waiting for first token */
                  <ThinkingAnimation />
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </TextSelectionContextMenu>
  )
}

/**
 * Animated thinking indicator with shifting dots
 */
function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-1 text-muted-foreground py-1">
      <span className="text-sm font-medium animate-pulse">Thinking</span>
      <span className="inline-flex w-6">
        <span className="animate-[thinking_1.4s_ease-in-out_infinite]">.</span>
        <span className="animate-[thinking_1.4s_ease-in-out_0.2s_infinite]">.</span>
        <span className="animate-[thinking_1.4s_ease-in-out_0.4s_infinite]">.</span>
      </span>
      <style>{`
        @keyframes thinking {
          0%, 20% { opacity: 0; }
          40% { opacity: 1; }
          60% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
