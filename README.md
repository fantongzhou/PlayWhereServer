# travel-agent-server

AI 旅行规划后端服务。基于 DeepSeek LLM function-calling + SSE 实时流，整合高德天气、美团旅行数据，提供结构化行程规划。

## 技术栈

- **Runtime**: Node.js 20+ (ESM) + TypeScript
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
|------|:--:|------|
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek API Key（推荐，便宜且中文能力强） |
| `DEEPSEEK_BASE_URL` | - | API 地址，默认 `https://api.deepseek.com` |
| `OPENAI_API_KEY` | - | 也可用 OpenAI 兼容接口 |
| `LLM_MODEL` | - | 模型名，默认 `deepseek-chat` |
| `AMAP_API_KEY` | ✅ | 高德 Web 服务 API Key（天气查询） |
| `MEITUAN_API_TOKEN` | - | 美团酒旅 API Token |
| `PORT` | - | 服务端口，默认 `3333` |

> 无 LLM API Key 时自动降级为模拟模式，可从消息中提取城市/天数，生成基础行程用于前端调试。

## API 端点

### `POST /api/plan`
行程规划（SSE 流 + 短期记忆）

```
请求:  { "message": "北京3日游...", "sessionId?": "session_xxx" }
响应:  SSE 事件流
记忆:  滑动窗口保留 4 轮对话，超出自动压缩为摘要
打断:  客户端断开连接时自动停止 LLM
```

**SSE 事件**: `start` → `thought` → `action` → `observation` → `plan_partial` → `plan_complete` → `error`

### `POST /api/routes`
获取地点间交通路线。

```
请求:  { "waypoints": [{ "name": "故宫", "lat": 39.916, "lng": 116.397 }, ...] }
```

### `GET /health`
健康检查 → `{ "status": "ok", "timestamp": "..." }`

## Agent 工具

| 工具 | 说明 |
|------|------|
| `get_weather` | 高德天气 API，批量日期查询，含温度/天气/出行建议 |
| `search_meituan_travel` | 美团旅行搜索（酒店/门票/机票/火车票/度假） |
| `get_route` | 两点间路线规划 |
| `check_meituan_token` | 检查美团 Token 配置状态 |
| `save_meituan_token` | 保存/同步美团 Token |

## Agent 执行流程

- **纯 JSON 输出**（TripPlan 结构），自然语言总结 + JSON 代码块
- **Step 0** 分析需求 → **Step 1** 查天气 → **Step 2** 调美团 → **Step 3** 生成行程
- 信息不足时输出追问，下一条消息继续对话（短期记忆保持上下文）
- 禁止预判具体景点/酒店/餐厅名称，让美团推荐
- "从X出发"模式直接选最优目的地规划，不列举对比选项

## 项目结构

```
src/
  index.ts              # Express 入口
  types.ts              # 共享类型定义
  agent/
    index.ts            # Agent 核心：runWithLLM / runChatWithMemory / runSimulated
    tools.ts            # ToolDefinition 注册
    prompt.ts           # 系统提示词（ReAct + 结构化输出）
    memory.ts           # 滑动窗口短期记忆
  routes/
    plan.ts             # /api/plan (SSE)
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
| `npm run dev` | 开发模式（tsx watch，热重载） |
| `npm run build` | 编译 TypeScript → `dist/` |
| `npm start` | 生产启动 |

---

> 📝 本文档随功能变更同步维护。最后更新：2026-06-22
