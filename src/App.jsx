import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import {
  sendChatMessage,
  getChatHistory,
  getConversations,
  deleteConversation,
  getUserId,
} from './services/difyApi'
import './App.css'

function App() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState(null)

  const user = useRef(getUserId())
  const abortControllerRef = useRef(null)

  /**
   * 加载会话列表
   */
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const list = await getConversations({ user: user.current, limit: 30 })
      setConversations(list)
    } catch (err) {
      console.error('加载会话列表失败:', err)
      setError('加载会话列表失败: ' + err.message)
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  /**
   * 加载会话历史消息
   */
  const loadHistory = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([])
      return
    }

    setLoadingHistory(true)
    try {
      const history = await getChatHistory({
        conversation_id: conversationId,
        user: user.current,
        limit: 50,
      })

      // 将历史消息转换为组件格式
      const formattedMessages = []
      // 历史消息是倒序的，需要反转
      const sorted = [...history].reverse()
      for (const msg of sorted) {
        formattedMessages.push({
          id: `user-${msg.id}`,
          role: 'user',
          content: msg.query,
          created_at: msg.created_at,
        })
        formattedMessages.push({
          id: `bot-${msg.id}`,
          role: 'assistant',
          content: msg.answer,
          created_at: msg.created_at,
        })
      }
      setMessages(formattedMessages)
    } catch (err) {
      console.error('加载历史消息失败:', err)
      setError('加载历史消息失败: ' + err.message)
      setMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // 初始加载会话列表
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  /**
   * 选择会话
   */
  const handleSelectConversation = (conversationId) => {
    if (conversationId === activeConversationId) return
    setActiveConversationId(conversationId)
    loadHistory(conversationId)
  }

  /**
   * 新建对话
   */
  const handleNewChat = () => {
    // 如果正在生成，先停止
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setActiveConversationId('')
    setMessages([])
    setError(null)
  }

  /**
   * 删除会话
   */
  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation({
        conversation_id: conversationId,
        user: user.current,
      })

      // 如果删除的是当前选中的会话，清空消息
      if (conversationId === activeConversationId) {
        setActiveConversationId('')
        setMessages([])
      }

      // 刷新会话列表
      loadConversations()
    } catch (err) {
      console.error('删除会话失败:', err)
      setError('删除会话失败: ' + err.message)
    }
  }

  /**
   * 发送消息
   */
  const handleSendMessage = async (text) => {
    setError(null)

    // 添加用户消息到列表
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: Math.floor(Date.now() / 1000),
    }

    // 添加 AI 占位消息（用于流式显示）
    const botMessageId = `bot-${Date.now()}`
    const botMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setIsStreaming(true)

    // 创建 AbortController 用于取消请求
    abortControllerRef.current = new AbortController()

    try {
      const result = await sendChatMessage(
        {
          query: text,
          user: user.current,
          conversation_id: activeConversationId,
          inputs: {},
        },
        (chunk) => {
          if (chunk.type === 'message') {
            // 流式更新 AI 消息内容
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, content: msg.content + chunk.answer }
                  : msg
              )
            )
          }
          if (chunk.type === 'message_end') {
            // 更新会话 ID（首次对话时）
            if (chunk.conversationId && !activeConversationId) {
              setActiveConversationId(chunk.conversationId)
            }
            // 更新消息时间戳
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, created_at: Math.floor(Date.now() / 1000) }
                  : msg
              )
            )
          }
        },
        abortControllerRef.current.signal
      )

      // 如果是首次对话，刷新会话列表
      if (result?.conversation_id && !activeConversationId) {
        loadConversations()
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('消息发送已取消')
      } else {
        console.error('发送消息失败:', err)
        setError('发送消息失败: ' + err.message)
        // 更新 AI 消息为错误提示
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: `抱歉，发生错误：${err.message}` }
              : msg
          )
        )
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  /**
   * 停止生成
   */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // 获取当前会话名称
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )

  return (
    <div className="app-container">
      {/* 侧边栏 */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        loading={loadingConversations}
      />

      {/* 主聊天区域 */}
      <ChatArea
        messages={messages}
        isStreaming={isStreaming}
        conversationName={activeConversation?.name}
        onSend={handleSendMessage}
        onStop={handleStop}
      />

      {/* 错误提示 */}
      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default App
