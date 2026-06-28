import MessageList from './MessageList'
import ChatInput from './ChatInput'
import './ChatArea.css'

/**
 * 聊天主区域组件
 *
 * @param {Object} props
 * @param {Array} props.messages - 消息列表
 * @param {boolean} props.isStreaming - 是否正在流式生成
 * @param {string} [props.conversationName] - 当前会话名称
 * @param {Function} props.onSend - 发送消息回调
 * @param {Function} [props.onStop] - 停止生成回调
 */
function ChatArea({ messages, isStreaming, conversationName, onSend, onStop }) {
  return (
    <main className="chat-area">
      {/* 顶部标题栏 */}
      <header className="chat-header">
        <div className="chat-title">
          <svg className="chat-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
          </svg>
          <h2>{conversationName || '新对话'}</h2>
        </div>
        <div className="chat-status">
          {isStreaming && (
            <span className="status-badge streaming">
              <span className="status-dot"></span>
              正在回复
            </span>
          )}
        </div>
      </header>

      {/* 消息列表 */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* 输入框 */}
      <ChatInput
        onSend={onSend}
        disabled={isStreaming}
        onStop={onStop}
        isStreaming={isStreaming}
      />
    </main>
  )
}

export default ChatArea
