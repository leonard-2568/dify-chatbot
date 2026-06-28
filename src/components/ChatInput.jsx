import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

/**
 * 聊天输入框组件
 *
 * @param {Object} props
 * @param {Function} props.onSend - 发送消息回调，接收消息文本
 * @param {boolean} props.disabled - 是否禁用输入（AI 回复中）
 * @param {Function} [props.onStop] - 停止生成回调
 * @param {boolean} [props.isStreaming] - 是否正在流式生成
 */
function ChatInput({ onSend, disabled, onStop, isStreaming }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // 自动调整输入框高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 150) // 最大高度 150px
    textarea.style.height = `${newHeight}px`
  }, [input])

  // 发送消息
  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setInput('')
  }

  // 键盘事件处理
  const handleKeyDown = (e) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'AI 正在回复中...' : '输入消息，按 Enter 发送，Shift + Enter 换行'}
          disabled={disabled}
          rows={1}
        />

        {/* 停止按钮 - 流式生成时显示 */}
        {isStreaming ? (
          <button
            className="chat-input-btn btn-stop"
            onClick={onStop}
            title="停止生成"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          /* 发送按钮 */
          <button
            className="chat-input-btn btn-send"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            title="发送消息"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
      <div className="chat-input-hint">
        <span>AI 由 Dify 提供支持</span>
      </div>
    </div>
  )
}

export default ChatInput
