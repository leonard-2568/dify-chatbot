import './Sidebar.css'

/**
 * 侧边栏组件 - 会话列表管理
 *
 * @param {Object} props
 * @param {Array} props.conversations - 会话列表
 * @param {string} props.activeId - 当前选中的会话 ID
 * @param {Function} props.onSelect - 选择会话回调
 * @param {Function} props.onNew - 新建会话回调
 * @param {Function} props.onDelete - 删除会话回调
 * @param {boolean} props.loading - 是否正在加载
 */
function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  return (
    <aside className="sidebar">
      {/* 新建会话按钮 */}
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>新建对话</span>
        </button>
      </div>

      {/* 会话列表 */}
      <div className="conversation-list">
        {loading ? (
          <div className="sidebar-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>加载中...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">
            <p>暂无历史对话</p>
            <span>点击上方按钮开始新对话</span>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                activeId === conv.id ? 'active' : ''
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="conversation-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="conversation-info">
                <div className="conversation-name" title={conv.name}>
                  {conv.name || '未命名对话'}
                </div>
                {conv.updated_at && (
                  <div className="conversation-time">
                    {formatTime(conv.updated_at)}
                  </div>
                )}
              </div>
              <button
                className="conversation-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('确定要删除这个对话吗？')) {
                    onDelete(conv.id)
                  }
                }}
                title="删除对话"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* 底部信息 */}
      <div className="sidebar-footer">
        <div className="footer-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
          </svg>
          <span>Dify Chatbot</span>
        </div>
      </div>
    </aside>
  )
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })
}

export default Sidebar
