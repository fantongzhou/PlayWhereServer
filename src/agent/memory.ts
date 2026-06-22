import OpenAI from 'openai';
import { SYSTEM_PROMPT, getCurrentDateContext } from './prompt.js';

/**
 * MemoryManager — 滑动窗口短期记忆
 * - 保留最近 WINDOW_SIZE 轮 user/assistant 对话
 * - 超出窗口的历史通过 LLM 异步压缩为摘要
 * - 每 session 独立存储
 */
const WINDOW_SIZE = 4; // 保留最近 4 轮对话

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export class MemoryManager {
  private turns: Turn[] = [];
  private summary = '';
  private systemPrompt: string;

  constructor(systemPrompt?: string) {
    this.systemPrompt = systemPrompt || SYSTEM_PROMPT;
  }

  addUserMessage(content: string): void {
    this.turns.push({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.turns.push({ role: 'assistant', content });
  }

  needsCompression(): boolean {
    return this.turns.length > WINDOW_SIZE * 2;
  }

  /** 构建发给 LLM 的上下文消息数组 */
  getContextMessages(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'system', content: getCurrentDateContext() },
    ];

    // 如果有历史摘要，先注入
    if (this.summary) {
      messages.push({
        role: 'system',
        content: `## 对话历史摘要\n${this.summary}`,
      });
    }

    // 追加窗口内的最近消息
    const windowTurns = this.turns.slice(-WINDOW_SIZE * 2);
    for (const t of windowTurns) {
      messages.push({ role: t.role, content: t.content });
    }

    return messages;
  }

  /** 异步压缩：将超出窗口的历史精炼为摘要 */
  async compress(apiKey: string, baseURL: string, model: string): Promise<void> {
    const overflow = this.turns.slice(0, -(WINDOW_SIZE * 2));
    if (overflow.length === 0) return;

    const client = new OpenAI({ apiKey, baseURL });

    const existingSummary = this.summary
      ? `之前的摘要：${this.summary}\n\n`
      : '';

    const historyText = overflow
      .map(t => `${t.role === 'user' ? '用户' : '助手'}: ${t.content}`)
      .join('\n');

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: '请将以下对话历史压缩为一段简洁的摘要（中文，200字以内），保留关键信息：目的地城市、天数、偏好、预算、已讨论的行程要点。',
          },
          {
            role: 'user',
            content: `${existingSummary}最近的对话：\n${historyText}`,
          },
        ],
        max_tokens: 400,
        temperature: 0.3,
      });

      this.summary = completion.choices[0].message?.content || this.summary;
    } catch (e) {
      console.warn('⚠️ 记忆压缩失败，将保留原始历史');
    }

    // 截断已压缩的历史
    this.turns = this.turns.slice(-WINDOW_SIZE * 2);
  }

  clear(): void {
    this.turns = [];
    this.summary = '';
  }

  getStats() {
    return {
      turns: this.turns.length,
      windowSize: WINDOW_SIZE,
      hasSummary: !!this.summary,
    };
  }
}

// ---- 全局 session 存储 ----
const sessionStore = new Map<string, MemoryManager>();

export function getSessionMemory(sessionId: string): MemoryManager {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new MemoryManager());
  }
  return sessionStore.get(sessionId)!;
}

export function clearSessionMemory(sessionId: string): void {
  sessionStore.delete(sessionId);
}
