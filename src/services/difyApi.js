/**
 * Dify API 服务层
 * 基于 Dify Chat API 文档实现
 * 文档参考: https://docs.dify.ai
 *
 * 主要接口:
 * 1. POST /chat-messages - 发送对话消息（支持流式/阻塞模式）
 * 2. GET /messages - 获取会话历史消息
 * 3. GET /conversations - 获取会话列表
 * 4. DELETE /conversations/{conversation_id} - 删除会话
 */

const API_BASE = import.meta.env.VITE_DIFY_API_BASE || '/dify-api/v1'
const API_KEY = import.meta.env.VITE_DIFY_API_KEY || 'app-MmfblHJpcR8CAad5tdpIYWT6'

/**
 * 获取请求头
 */
function getHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

/**
 * 发送对话消息（流式模式）
 * API: POST /chat-messages
 *
 * @param {Object} params - 请求参数
 * @param {string} params.query - 用户输入的消息内容
 * @param {string} params.user - 用户标识
 * @param {string} [params.conversation_id] - 会话 ID（首次对话为空）
 * @param {Object} [params.inputs] - 变量键值对
 * @param {Function} [onMessage] - 流式消息回调，每收到一个 chunk 调用
 * @param {AbortSignal} [signal] - 取消信号
 * @returns {Promise<Object>} 完整的响应数据
 */
export async function sendChatMessage(
  { query, user, conversation_id = '', inputs = {} },
  onMessage,
  signal
) {
  const response = await fetch(`${API_BASE}/chat-messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      inputs,
      query,
      response_mode: 'streaming',
      conversation_id,
      user,
    }),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`)
  }

  // 解析 SSE 流式响应
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let result = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // 按 \n\n 分割 SSE 事件
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || '' // 保留最后不完整的部分

    for (const line of lines) {
      if (!line.trim()) continue

      // 解析 SSE data 行
      const dataLines = line
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())

      if (dataLines.length === 0) continue

      for (const dataStr of dataLines) {
        try {
          const data = JSON.parse(dataStr)

          switch (data.event) {
            case 'message':
              // 模型返回文本内容
              if (onMessage) {
                onMessage({
                  type: 'message',
                  answer: data.answer,
                  messageId: data.message_id,
                  conversationId: data.conversation_id,
                })
              }
              result = {
                conversation_id: data.conversation_id,
                message_id: data.message_id,
                answer: data.answer,
              }
              break

            case 'message_end':
              // 消息结束
              if (onMessage) {
                onMessage({
                  type: 'message_end',
                  conversationId: data.conversation_id,
                  messageId: data.message_id,
                  metadata: data.metadata,
                })
              }
              result = {
                conversation_id: data.conversation_id,
                message_id: data.message_id,
                answer: result?.answer || '',
                metadata: data.metadata,
              }
              break

            case 'error':
              throw new Error(data.message || 'API 返回错误')

            default:
              // 其他事件类型（agent_thought, message_file 等）
              if (onMessage) {
                onMessage({ type: data.event, data })
              }
              break
          }
        } catch (parseError) {
          if (parseError.message && parseError.message.includes('API')) {
            throw parseError
          }
          // JSON 解析失败时跳过
          console.warn('SSE 数据解析失败:', dataStr)
        }
      }
    }
  }

  return result
}

/**
 * 获取会话历史消息
 * API: GET /messages
 *
 * @param {Object} params
 * @param {string} params.conversation_id - 会话 ID
 * @param {string} params.user - 用户标识
 * @param {number} [params.limit=20] - 返回条数
 * @returns {Promise<Array>} 消息列表
 */
export async function getChatHistory({ conversation_id, user, limit = 20 }) {
  const params = new URLSearchParams({
    conversation_id,
    user,
    limit: String(limit),
  })

  const response = await fetch(
    `${API_BASE}/messages?${params.toString()}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`获取历史消息失败 (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * 获取会话列表
 * API: GET /conversations
 *
 * @param {Object} params
 * @param {string} params.user - 用户标识
 * @param {number} [params.limit=20] - 返回条数
 * @returns {Promise<Array>} 会话列表
 */
export async function getConversations({ user, limit = 20 }) {
  const params = new URLSearchParams({
    user,
    limit: String(limit),
  })

  const response = await fetch(
    `${API_BASE}/conversations?${params.toString()}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`获取会话列表失败 (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * 删除会话
 * API: DELETE /conversations/{conversation_id}
 *
 * @param {Object} params
 * @param {string} params.conversation_id - 会话 ID
 * @param {string} params.user - 用户标识
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteConversation({ conversation_id, user }) {
  const response = await fetch(
    `${API_BASE}/conversations/${conversation_id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ user }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`删除会话失败 (${response.status}): ${errorText}`)
  }

  return true
}

/**
 * 生成唯一用户 ID（基于浏览器本地存储）
 * @returns {string}
 */
export function getUserId() {
  const STORAGE_KEY = 'dify_user_id'
  let userId = localStorage.getItem(STORAGE_KEY)
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(STORAGE_KEY, userId)
  }
  return userId
}
