# Dify Chatbot 聊天机器人

基于 React + Vite 构建的 Dify AI 聊天机器人 Web 应用。

## 功能特性

- **实时流式对话** - 支持 SSE 流式响应，逐字显示 AI 回复
- **Markdown 渲染** - 支持代码块、表格、列表、引用等 Markdown 格式
- **会话管理** - 支持创建、切换、删除历史会话
- **多会话切换** - 侧边栏展示历史会话列表，可随时切换
- **停止生成** - 支持在 AI 回复过程中停止生成
- **响应式设计** - 适配桌面和移动端

## 技术栈

- React 18
- Vite 5
- react-markdown + remark-gfm
- Dify Chat API

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/leonard-2568/dify-chatbot.git
cd dify-chatbot
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填入你的 Dify API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
VITE_DIFY_API_BASE=/dify-api/v1
VITE_DIFY_API_KEY=你的API Key
```

> **安全提示**：`.env` 文件已被 `.gitignore` 忽略，不会上传到仓库。请勿在客户端代码中硬编码 API Key。

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

## 配置说明

Vite 代理配置在 `vite.config.js` 中，将 `/dify-api` 代理到 `https://api.dify.ai`：

```js
proxy: {
  '/dify-api': {
    target: 'https://api.dify.ai',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/dify-api/, '')
  }
}
```

## API 接口

本项目使用以下 Dify API 接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/chat-messages` | POST | 发送对话消息（流式） |
| `/messages` | GET | 获取会话历史消息 |
| `/conversations` | GET | 获取会话列表 |
| `/conversations/{id}` | DELETE | 删除会话 |

## 项目结构

```
dify-chatbot/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # 侧边栏会话列表
│   │   ├── Sidebar.css
│   │   ├── ChatArea.jsx         # 主聊天区域
│   │   ├── ChatArea.css
│   │   ├── MessageList.jsx      # 消息列表
│   │   ├── MessageList.css
│   │   ├── ChatInput.jsx        # 输入框
│   │   └── ChatInput.css
│   ├── services/
│   │   └── difyApi.js           # Dify API 服务层
│   ├── styles/
│   │   └── global.css           # 全局样式
│   ├── App.jsx                  # 主应用组件
│   ├── App.css
│   └── main.jsx                 # 入口文件
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略配置
├── vite.config.js               # Vite 配置
├── index.html
└── package.json
```

## License

MIT
