import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useRef } from 'react'
import './MessageList.css'

/**
 * 打字机光标组件（AI 正在回复时显示）
 */
function TypingCursor() {
  return <span className="typing-cursor">▋</span>
}

/**
 * 加载指示器
 */
function LoadingDots() {
  return (
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

/**
 * 单条消息组件
 */
function MessageItem({ message, isStreaming }) {
  const isUser = message.role === 'user'

  return (
    <div className={`message-item ${isUser ? 'message-user' : 'message-bot'}`}>
      {/* 头像 */}
      <div className="message-avatar">
        {isUser ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        )}
      </div>

      {/* 消息内容 */}
      <div className="message-content">
        <div className="message-role">{isUser ? '我' : 'AI 助手'}</div>
        <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          {isUser ? (
            <div className="message-text">{message.content}</div>
          ) : (
            <div className="markdown-body">
              {message.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              ) : isStreaming ? (
                <LoadingDots />
              ) : (
                <span className="message-empty">（空消息）</span>
              )}
              {isStreaming && message.content && <TypingCursor />}
            </div>
          )}
        </div>
        {message.created_at && !isStreaming && (
          <div className="message-time">
            {new Date(message.created_at * 1000).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 消息列表组件
 * 显示所有对话消息，支持自动滚动到底部
 */
function MessageList({ messages, isStreaming }) {
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)

  // 消息更新时自动滚动到底部
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isStreaming])

  return (
    <div className="message-list" ref={scrollRef}>
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>开始一段新的对话</h3>
          <p>在下方输入框中输入消息，与 AI 助手开始聊天吧！</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            message={msg}
            isStreaming={
              isStreaming &&
              index === messages.length - 1 &&
              msg.role === 'assistant'
            }
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
