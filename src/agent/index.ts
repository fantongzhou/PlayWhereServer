import OpenAI from 'openai';
import { tools } from './tools.js';
import { RETRY_HINT } from './prompt.js';
import { getSessionMemory, type MemoryManager } from './memory.js';
import type { SSEEvent, TripPlan } from '../types.js';

// ---- SSE 回调类型 ----
export type SSECallback = (event: SSEEvent) => void;

// ---- LLM 客户端工厂 ----
function createLLMClient(): { client: OpenAI; model: string } {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('请设置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量');
  }

  return {
    client: new OpenAI({ apiKey, baseURL }),
    model: process.env.LLM_MODEL || 'deepseek-chat',
  };
}

// ---- LLM 模式 ----
async function runWithLLM(message: string, memory: MemoryManager, emit: SSECallback, isAborted: () => boolean): Promise<TripPlan> {
  const { client, model } = createLLMClient();

  if (isAborted()) throw Object.assign(new Error('用户中断'), { name: 'AbortError' });

  emit({ type: 'start', message: '开始分析您的旅行需求...', step: 0 });

  // 将用户消息加入记忆
  memory.addUserMessage(message);

  // 检查是否需要压缩历史
  if (memory.needsCompression()) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '';
    const baseURL = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    memory.compress(apiKey, baseURL, model).catch(e => console.warn('⚠️ 后台记忆压缩失败:', e));
  }

  // 从记忆构建上下文
  const messages = memory.getContextMessages();

  let step = 0;
  const maxSteps = 15;

  while (step < maxSteps) {
    if (isAborted()) throw Object.assign(new Error('用户中断'), { name: 'AbortError' });
    step++;

    // ---- 流式调用 LLM ----
    const stream = await client.chat.completions.create({
      model,
      messages,
      tools: tools.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      tool_choice: 'auto',
      stream: true,
    });

    // 累积流式响应
    let contentAcc = '';
    const toolCallAcc: Map<number, { id: string; name: string; args: string }> = new Map();

    for await (const chunk of stream) {
      if (isAborted()) throw Object.assign(new Error('用户中断'), { name: 'AbortError' });
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      // 流式内容 → 逐 token 推送
      if (delta.content) {
        contentAcc += delta.content;
        emit({ type: 'thought', content: delta.content, step });
      }

      // 流式 tool calls → 累积
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!toolCallAcc.has(idx)) {
            toolCallAcc.set(idx, { id: tc.id || '', name: tc.function?.name || '', args: '' });
          }
          const acc = toolCallAcc.get(idx)!;
          if (tc.id) acc.id = tc.id;
          if (tc.function?.name) acc.name = tc.function.name;
          if (tc.function?.arguments) acc.args += tc.function.arguments;
        }
      }
    }

    // 流结束 — 判断是 tool calls 还是最终答案
    const hasToolCalls = toolCallAcc.size > 0;

    if (!hasToolCalls) {
      // 最终答案 — 解析 JSON
      const finalContent = contentAcc;
      const tripPlan = parsePlanFromText(finalContent);

      // 检测是否是自然语言追问
      const isPlainTextQuestion = !finalContent.trim().startsWith('{')
        && finalContent.length < 500
        && /[？?]|请问|什么|哪个|几天|哪座|何时/.test(finalContent);

      if (isPlainTextQuestion) {
        memory.addAssistantMessage(finalContent);
        emit({ type: 'response', content: finalContent, step });
        const questionPlan: TripPlan = {
          city: '', days: [], totalBudget: '', tips: [finalContent.trim()],
        };
        emit({ type: 'plan_complete', plan: questionPlan, step });
        return questionPlan;
      }

      // 空行程且未重试 → 要求 LLM 重新输出
      if (tripPlan.days.length === 0 && step < maxSteps - 1) {
        emit({ type: 'thought', content: '⚠️ 未检测到有效的行程 JSON，正在重新生成...', step });
        messages.push({ role: 'assistant', content: finalContent });
        messages.push({ role: 'user', content: RETRY_HINT });
        continue;
      }

      memory.addAssistantMessage(finalContent);
      emit({ type: 'response', content: finalContent, step });
      emit({ type: 'plan_complete', plan: tripPlan, step });
      return tripPlan;
    }

    // 处理 tool calls — 构建 assistant message 并执行工具
    const streamedToolCalls = Array.from(toolCallAcc.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, tc]) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.name, arguments: tc.args },
      }));

    messages.push({ role: 'assistant', content: contentAcc || null, tool_calls: streamedToolCalls });

    for (const toolCall of streamedToolCalls) {
      if (isAborted()) throw Object.assign(new Error('用户中断'), { name: 'AbortError' });
      const toolName = toolCall.function.name;
      let toolArgs: any;
      try {
        toolArgs = JSON.parse(toolCall.function.arguments || '{}');
      } catch {
        toolArgs = {};
      }

      emit({ type: 'action', tool: toolName, args: toolArgs, step });

      const tool = tools.find(t => t.name === toolName);
      let result: any;

      if (tool) {
        try {
          result = await tool.execute(toolArgs);
        } catch (e: any) {
          result = { error: e.message };
        }
      } else {
        result = { error: `Unknown tool: ${toolName}` };
      }

      emit({ type: 'observation', data: result, step });

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error('Agent 超过最大步骤数');
}

// ---- 模拟模式（无需 API Key） ----
async function runSimulated(message: string, emit: SSECallback): Promise<TripPlan> {
  emit({ type: 'start', message: '(模拟模式) 开始分析您的旅行需求...', step: 0 });

  // 从消息中简单提取城市名
  const cityMatch = message.match(/北京|上海|三亚|成都|西安|杭州|广州|深圳|重庆|南京|武汉|长沙|厦门|青岛|大连|昆明/);
  const city = cityMatch ? cityMatch[0] : '未知城市';

  // 提取天数
  const daysMatch = message.match(/(\d+)\s*天/);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : 3;

  emit({ type: 'thought', content: `(模拟模式) 识别到目的地: ${city}，${days}天`, step: 1 });

  const today = new Date();
  const dateStrs: string[] = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d + 1);
    dateStrs.push(date.toISOString().split('T')[0]);
  }

  // 尝试获取天气
  let weathers: any[] = [];
  try {
    const weatherTool = tools.find(t => t.name === 'get_weather');
    if (weatherTool) {
      emit({ type: 'action', tool: 'get_weather', args: { city, dates: dateStrs }, step: 2 });
      weathers = await weatherTool.execute({ city, dates: dateStrs });
      emit({ type: 'observation', data: weathers, step: 2 });
    }
  } catch {
    // weather tool failed, continue without it
  }

  const planDays: TripPlan['days'] = [];
  for (let d = 0; d < days; d++) {
    planDays.push({
      day: d + 1,
      date: dateStrs[d],
      weather: weathers[d] || null,
      activities: [
        {
          time: '09:00',
          name: `第${d + 1}天景点`,
          lat: 0, lng: 0,
          type: 'attraction',
          duration: '3小时',
          note: '请配置 LLM API Key 获取真实行程',
        },
      ],
      hotel: null,
    });
    emit({ type: 'plan_partial', data: { day: d + 1, date: dateStrs[d], count: 1 }, step: 3 });
  }

  const tripPlan: TripPlan = {
    city,
    days: planDays,
    totalBudget: '模拟模式 — 请配置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 获取真实行程',
    tips: ['当前为模拟模式，请设置环境变量 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 启用 AI 规划'],
  };

  emit({ type: 'plan_complete', plan: tripPlan, step: 4 });
  return tripPlan;
}

// ---- JSON 提取（括号计数法，支持任意嵌套深度） ----
function extractJSONBlocks(text: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        results.push(text.substring(start, i + 1));
        start = -1;
      }
    }
  }

  return results;
}

// ---- 文本解析（降级使用） ----
function parsePlanFromText(text: string): TripPlan {
  const candidates: string[] = [];

  // 策略1: 提取 ```json ... ``` 代码块中的 JSON
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/g);
  if (codeBlockMatch) {
    for (const block of codeBlockMatch) {
      const inner = block.replace(/```(?:json)?\s*|\s*```/g, '').trim();
      if (inner.startsWith('{')) candidates.push(inner);
    }
  }

  // 策略2: 括号计数法提取所有顶层 JSON 对象（支持任意嵌套深度）
  const allBlocks = extractJSONBlocks(text);
  // 从中筛选包含 "city" 和 "days" 的，优先取最后一个（通常是最终输出）
  const validBlocks = allBlocks.filter(b => b.includes('"city"') && b.includes('"days"'));
  if (validBlocks.length > 0) {
    candidates.push(validBlocks[validBlocks.length - 1]);
  }

  // 策略3: 兜底 — 如果括号计数没找到，尝试正则（简单嵌套场景）
  if (candidates.length === 0) {
    const looseMatch = text.match(/\{[\s\S]*"city"[\s\S]*"days"[\s\S]*\}/);
    if (looseMatch) {
      // 用括号计数法从匹配结果中精确截取
      const blocks = extractJSONBlocks(looseMatch[0]);
      if (blocks.length > 0) candidates.push(blocks[0]);
      else candidates.push(looseMatch[0]);
    }
  }

  // 依次尝试解析每个候选
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed.city && Array.isArray(parsed.days)) {
        // 补全可能缺失的字段
        return {
          city: parsed.city,
          days: (parsed.days || []).map((d: any, i: number) => ({
            day: d.day || i + 1,
            date: d.date || new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
            weather: d.weather || null,
            activities: (d.activities || []).map((a: any) => ({
              time: a.time || '',
              name: a.name || '',
              lat: a.lat || 0,
              lng: a.lng || 0,
              type: a.type || 'attraction',
              duration: a.duration || '1小时',
              note: a.note || '',
              bookingUrl: a.bookingUrl || undefined,
              imageUrls: Array.isArray(a.imageUrls) ? a.imageUrls : undefined,
            })),
            hotel: d.hotel ? { ...d.hotel, bookingUrl: d.hotel.bookingUrl || undefined } : null,
          })),
          totalBudget: parsed.totalBudget || '请参考上方详细行程',
          tips: parsed.tips || [],
        };
      }
    } catch {
      // 继续尝试下一个
    }
  }

  // 最终降级
  return {
    city: '未知城市',
    days: [],
    totalBudget: '请参考上方详细行程',
    tips: ['未能解析出行程数据，请重新描述您的旅行需求'],
  };
}

// ---- 主入口 ----
export async function runAgent(message: string, sessionId: string, emit: SSECallback, isAborted: () => boolean): Promise<TripPlan> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    const memory = getSessionMemory(sessionId);
    return runWithLLM(message, memory, emit, isAborted);
  }

  console.log('⚠️  未设置 API Key，使用模拟模式运行');
  return runSimulated(message, emit);
}

/** 清除指定 session 的记忆 */
export { clearSessionMemory } from './memory.js';
