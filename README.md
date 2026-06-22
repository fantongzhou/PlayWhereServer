# travel-agent-server

AI 旅行规划后端服务。基于 LLM function-calling + SSE 实时流，整合高德天气、美团旅行数据，提供结构化行程规划和自由对话两种模式。

## 技术栈

- **Runtime**: Node.js (ESM) + TypeScript
- **Framework**: Express 4
- **LLM**: OpenAI SDK（兼容 DeepSeek / OpenAI 等任意兼容 API）
- **校验**: Zod

## 快速开始

```bash
cp .env.example .env   # 编辑环境变量
npm install
npm run dev            # tsx watch，默认 :3333
```

## 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | ✅ | LLM API Key（推荐 DeepSeek） |
| `DEEPSEEK_BASE_URL` | - | LLM 地址，默认 `https://api.deepseek.com` |
| `OPENAI_API_KEY` | - | 也可用 OpenAI |
| `LLM_MODEL` | - | 模型名，默认 `deepseek-chat` |
| `AMAP_API_KEY` | ✅ | 高德天气 API Key |
| `MEITUAN_API_TOKEN` | - | 美团旅行 API Token |
| `PORT` | - | 服务端口，默认 `3333` |

无 LLM API Key 时自动降级为模拟模式（可从消息中提取城市/天数，生成基础行程）。

## API 端点

### `POST /api/plan`
行程规划（SSE 流 + 短期记忆）。接受自然语言消息，返回流式事件。

**请求**: `{ "message": "北京3日游...", "sessionId?": "session_xxx" }`  
**记忆**: 滑动窗口保留最近 4 轮对话，超出部分 LLM 异步压缩为摘要  
**打断**: 客户端断开连接时自动停止 LLM 生成，前端支持主动打断按钮

**SSE 事件**: `start` → `thought` → `action` → `observation` → `plan_partial` → `plan_complete` → `error`

### `POST /api/routes`
获取地点间交通路线。

**请求**: `{ "waypoints": [{ "name": "故宫", "lat": 39.916, "lng": 116.397 }, ...] }`

### `GET /health`
健康检查。

## Agent 工具

| 工具 | 说明 |
|------|------|
| `get_weather` | 高德天气 API，支持批量日期查询，含温度/天气/出行建议 |
| `get_route` | 两点间路线规划（步行/公交/出租车），含距离/耗时/费用 |
| `search_meituan_travel` | 美团旅行搜索（酒店/门票/机票/火车票/度假） |
| `check_meituan_token` | 检查美团 Token 配置状态 |
| `save_meituan_token` | 保存/同步美团 Token 到 CLI 配置 |

## Agent 执行流程

- 纯 JSON 输出（TripPlan 结构）
- **短期记忆**：每 session 保留最近 4 轮对话，跨请求记住上下文（城市/偏好/已讨论内容）
- Step 0 分析需求 → Step 1 查天气 → Step 2 调美团 → Step 3 生成行程
- 信息不足时输出追问，下一条消息继续对话（上下文保持）
- 禁止预判具体景点/酒店/餐厅名称（让美团推荐）

## 项目结构

```
src/
  index.ts              # Express 入口
  types.ts              # 共享类型定义
  agent/
    index.ts            # Agent 核心：runWithLLM / runChatWithMemory / runSimulated
    tools.ts            # ToolDefinition 注册
    prompt.ts           # 系统提示词
    memory.ts           # 滑动窗口短期记忆
  routes/
    plan.ts             # /api/plan + /api/plan/chat
    travel-routes.ts    # /api/routes
    meituan.ts          # /api/meituan/*
  services/
    weather.ts          # 高德天气（城市名或 adcode，含 fallback）
    routes.ts           # 路线计算
    meituan-travel.ts   # 美团 CLI 封装
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（tsx watch） |
| `npm run build` | 编译 TypeScript → dist/ |
| `npm start` | 生产启动 |

---

> 📝 本文档随功能变更同步维护。最后更新：2026-06-21
