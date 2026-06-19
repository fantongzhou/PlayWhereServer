import OpenAI from 'openai';
import { tools } from './tools.js';
import { SYSTEM_PROMPT } from './prompt.js';
import type { TripRequest, SSEEvent, TripPlan } from '../types.js';

// ---- SSE 回调类型 ----
export type SSECallback = (event: SSEEvent) => void;

// ---- LLM 模式 ----
async function runWithLLM(request: TripRequest, emit: SSECallback): Promise<TripPlan> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('请设置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量');
  }

  const client = new OpenAI({ apiKey, baseURL });

  emit({ type: 'start', message: `开始规划 ${request.city} ${request.days}日游...`, step: 0 });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请帮我规划一次${request.city}${request.days}日游。${
        request.preferences.length > 0 ? `偏好：${request.preferences.join('、')}。` : ''
      }预算等级：${request.budget}。请先查询相关信息，然后给出完整的行程计划。`,
    },
  ];

  let step = 0;
  const maxSteps = 15;

  while (step < maxSteps) {
    step++;

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'deepseek-chat',
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
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.content) {
      emit({ type: 'thought', content: responseMessage.content, step });
    }

    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      // Agent 认为可以给出最终答案了——尝试解析 JSON
      const finalContent = responseMessage.content || '';
      const tripPlan = parsePlanFromText(finalContent, request);
      emit({ type: 'plan_complete', plan: tripPlan, step });
      return tripPlan;
    }

    // 处理 tool calls
    messages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

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
async function runSimulated(request: TripRequest, emit: SSECallback): Promise<TripPlan> {
  emit({ type: 'start', message: `(模拟模式) 开始规划 ${request.city} ${request.days}日游...`, step: 0 });

  // Step 1: 获取景点
  emit({ type: 'thought', content: `正在查询${request.city}的旅游景点...`, step: 1 });
  emit({ type: 'action', tool: 'search_attractions', args: { city: request.city, preferences: request.preferences }, step: 1 });

  const attractions = await tools[0].execute({ city: request.city, preferences: request.preferences });
  emit({ type: 'observation', data: attractions.slice(0, 5), step: 1 });

  // Step 2: 获取酒店
  emit({ type: 'thought', content: '正在查询酒店信息...', step: 2 });
  emit({ type: 'action', tool: 'search_hotels', args: { city: request.city, budget: request.budget }, step: 2 });

  const hotels = await tools[1].execute({ city: request.city, budget: request.budget });
  emit({ type: 'observation', data: hotels, step: 2 });

  // Step 3: 获取餐厅
  emit({ type: 'thought', content: '正在搜索当地美食...', step: 3 });
  emit({ type: 'action', tool: 'search_restaurants', args: { city: request.city, preferences: request.preferences }, step: 3 });

  const restaurants = await tools[5].execute({ city: request.city, preferences: request.preferences });
  emit({ type: 'observation', data: restaurants.slice(0, 4), step: 3 });

  // Step 4: 逐天生成天气 + 构建行程
  emit({ type: 'thought', content: '正在根据距离优化景点顺序，查询每日天气...', step: 4 });

  const today = new Date();
  const days: TripPlan['days'] = [];

  for (let d = 0; d < request.days; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d + 1);
    const dateStr = date.toISOString().split('T')[0];

    emit({ type: 'action', tool: 'get_weather', args: { city: request.city, date: dateStr }, step: 4 });

    const weather = await tools[3].execute({ city: request.city, date: dateStr });
    emit({ type: 'observation', data: weather, step: 4 });

    // 分配景点（每天 3-4 个，轮询分配）
    const dayAttractions = attractions.slice(d * 3, d * 3 + 3);
    const dayRestaurant = restaurants[d % restaurants.length];

    const activities: TripPlan['days'][0]['activities'] = [];

    // 上午第一个景点
    if (dayAttractions[0]) {
      activities.push({
        time: '09:00',
        name: dayAttractions[0].name,
        lat: dayAttractions[0].lat,
        lng: dayAttractions[0].lng,
        type: 'attraction',
        duration: `${dayAttractions[0].duration}小时`,
        note: dayAttractions[0].description.slice(0, 20),
      });
    }

    // 上午第二个景点
    if (dayAttractions[1]) {
      activities.push({
        time: '11:00',
        name: dayAttractions[1].name,
        lat: dayAttractions[1].lat,
        lng: dayAttractions[1].lng,
        type: 'attraction',
        duration: `${dayAttractions[1].duration}小时`,
        note: dayAttractions[1].description.slice(0, 20),
      });
    }

    // 午餐
    if (dayRestaurant) {
      activities.push({
        time: '12:30',
        name: dayRestaurant.name,
        lat: dayRestaurant.lat,
        lng: dayRestaurant.lng,
        type: 'restaurant',
        duration: '1小时',
        note: `${dayRestaurant.cuisine} · 人均¥${dayRestaurant.avgPrice}`,
      });
    }

    // 下午景点
    if (dayAttractions[2]) {
      activities.push({
        time: '14:00',
        name: dayAttractions[2].name,
        lat: dayAttractions[2].lat,
        lng: dayAttractions[2].lng,
        type: 'attraction',
        duration: `${dayAttractions[2].duration}小时`,
        note: dayAttractions[2].description.slice(0, 20),
      });
    }

    // 晚餐
    const dinnerRestaurant = restaurants[(d + 1) % restaurants.length];
    if (dinnerRestaurant) {
      activities.push({
        time: '18:00',
        name: dinnerRestaurant.name,
        lat: dinnerRestaurant.lat,
        lng: dinnerRestaurant.lng,
        type: 'restaurant',
        duration: '1.5小时',
        note: `${dinnerRestaurant.cuisine} · 人均¥${dinnerRestaurant.avgPrice}`,
      });
    }

    days.push({
      day: d + 1,
      date: dateStr,
      weather,
      activities,
      hotel: hotels[d % hotels.length] || hotels[0],
    });

    emit({ type: 'plan_partial', data: { day: d + 1, date: dateStr, count: activities.length }, step: 4 });
  }

  // Step 5: 最终行程
  emit({ type: 'thought', content: '行程规划完成，正在整理输出...', step: 5 });

  const estimatedHotelCost = hotels.length > 0
    ? days.reduce((sum, d) => sum + (d.hotel?.pricePerNight || 0), 0)
    : request.days * 500;

  const tripPlan: TripPlan = {
    city: request.city,
    days,
    totalBudget: `机票约2000-3000元 + 酒店约${estimatedHotelCost}元 + 餐饮及门票约3000元 = 总计约${estimatedHotelCost + 5000}元`,
    tips: [
      `建议购买${request.city}公交一日券，省钱又方便`,
      '大部分寺庙和神社免费参观，部分需要购买门票（约500日元）',
      '日本靠左行驶，注意交通安全',
      '携带现金，有些小店不支持信用卡',
      `根据天气情况：${days[0]?.weather?.suggestion || '注意防晒或保暖'}`,
    ],
  };

  emit({ type: 'plan_complete', plan: tripPlan, step: 5 });
  return tripPlan;
}

// ---- 文本解析（降级使用） ----
function parsePlanFromText(text: string, request: TripRequest): TripPlan {
  // 尝试从文本中提取 JSON
  const jsonMatch = text.match(/\{[\s\S]*"city"[\s\S]*"days"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }
  // 降级：返回基本结构
  return {
    city: request.city,
    days: [],
    totalBudget: '请参考上方详细行程',
    tips: ['建议联系旅行顾问获取更详细的信息'],
  };
}

// ---- 自由对话模式（支持美团 Token 流程等） ----
async function runChatWithLLM(userMessage: string, emit: SSECallback): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('请设置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量');
  }

  const client = new OpenAI({ apiKey, baseURL });

  emit({ type: 'start', message: '正在处理您的问题...', step: 0 });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  let step = 0;
  const maxSteps = 15;

  while (step < maxSteps) {
    step++;

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'deepseek-chat',
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
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.content) {
      emit({ type: 'thought', content: responseMessage.content, step });
    }

    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      // 对话完成
      const finalContent = responseMessage.content || '';
      emit({ type: 'plan_complete', plan: { city: '', days: [], totalBudget: '', tips: [] }, step });
      return finalContent;
    }

    // 处理 tool calls
    messages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

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

// ---- 主入口 ----
export async function runAgent(request: TripRequest, emit: SSECallback): Promise<TripPlan> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    return runWithLLM(request, emit);
  }

  console.log('⚠️  未设置 API Key，使用模拟模式运行');
  return runSimulated(request, emit);
}

/** 自由对话入口（支持美团 Token 流程、旅游问答等） */
export async function runChatAgent(message: string, emit: SSECallback): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    return runChatWithLLM(message, emit);
  }

  // 模拟模式下的对话：简单回显
  emit({ type: 'start', message: '(模拟模式) 处理您的问题...', step: 0 });
  emit({ type: 'thought', content: `收到您的消息：${message}。当前为模拟模式，请配置 LLM API Key 以获得完整功能。`, step: 1 });
  emit({ type: 'plan_complete', plan: { city: '', days: [], totalBudget: '', tips: [] }, step: 1 });
  return '模拟模式回复';
}
