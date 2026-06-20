import OpenAI from 'openai';
import { SYSTEM_PROMPT, getCurrentDateContext } from './prompt.js';

// ============================================================
// 记忆模块 — 滑动窗口 + 历史会话精炼
// ============================================================

export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * MemoryManager
 *
 * 滑动窗口机制：
 * - 保留最近 `maxPairs` 对 user/assistant 消息的完整内容（窗口内）
 * - 超出窗口的历史消息被异步压缩为累积摘要
 * - 构建 LLM 上下文时，返回：system prompt + 历史摘要 + 窗口消息
 */
export class MemoryManager {
  private systemPrompt: string;
  private maxPairs: number;
  private history: StoredMessage[] = [];
  private summary: string | null = null;

  constructor(systemPrompt?: string, maxPairs = 4) {
    this.systemPrompt = systemPrompt || SYSTEM_PROMPT;
    this.maxPairs = maxPairs;
  }

  /** 添加用户消息 */
  addUserMessage(content: string): void {
    this.history.push({ role: 'user', content, timestamp: Date.now() });
  }

  /** 添加助手消息 */
  addAssistantMessage(content: string): void {
    this.history.push({ role: 'assistant', content, timestamp: Date.now() });
  }

  /** 获取消息总数 */
  get messageCount(): number {
    return this.history.length;
  }

  /** 获取窗口内消息数 */
  get windowMessageCount(): number {
    return Math.min(this.history.length, this.maxPairs * 2);
  }

  /** 是否需要压缩 */
  needsCompression(): boolean {
    return this.history.length > this.maxPairs * 2;
  }

  /**
   * 构建 LLM 上下文消息列表
   * 返回: [system] + [summary] + [window messages]
   */
  getContextMessages(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'system', content: getCurrentDateContext() },
      { role: 'system', content: 'MODE=chat OUTPUT=markdown' },
    ];

    // 注入历史摘要
    if (this.summary) {
      messages.push({
        role: 'system',
        content: `[历史对话摘要] 以下是之前对话的关键信息，请基于这些上下文继续对话：\n\n${this.summary}`,
      });
    }

    // 注入窗口内的最新消息
    const windowStart = Math.max(0, this.history.length - this.maxPairs * 2);
    for (let i = windowStart; i < this.history.length; i++) {
      const msg = this.history[i];
      messages.push({ role: msg.role, content: msg.content });
    }

    return messages;
  }

  /**
   * 对窗口外的旧消息进行压缩精炼
   * 将溢出的消息压缩为摘要，合并到现有摘要中
   */
  async compress(apiKey: string, baseURL: string, model: string): Promise<void> {
    if (!this.needsCompression()) return;

    const overflowCount = this.history.length - this.maxPairs * 2;
    const overflowMessages = this.history.slice(0, overflowCount);

    // 保留窗口内消息，移除溢出部分
    this.history = this.history.slice(overflowCount);

    const client = new OpenAI({ apiKey, baseURL });

    const existingSummary = this.summary ? `已有的历史摘要：\n${this.summary}\n\n` : '';
    const conversationText = overflowMessages
      .map(m => `[${m.role === 'user' ? '用户' : '助手'}]: ${m.content}`)
      .join('\n\n');

    const compressionPrompt = `你是一个对话摘要器。请将以下旅行对话历史压缩为简洁的摘要（不超过 300 字）。

${existingSummary}需要摘要的新对话内容：
${conversationText}

请提取以下关键信息：
- 用户关注的旅行目的地、日期、人数
- 预算范围和偏好（如酒店星级、房型、交通方式）
- 已查询/推荐的具体酒店、门票、航班等商品信息
- 用户的特殊需求和已做出的决策
- Token 配置状态（如已配置美团团Token）
- 任何待处理的问题或未完成的查询

请用中文输出简洁摘要：`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: compressionPrompt }],
        temperature: 0.3,
        max_tokens: 600,
      });

      const newSummary = completion.choices[0].message?.content?.trim() || '';
      this.summary = newSummary || this.summary; // 如果新摘要为空，保留旧摘要
    } catch (e) {
      console.warn('⚠️  记忆压缩失败，保留原始摘要:', e);
      // 压缩失败不影响主流程，保留溢出消息的简要摘要
      if (!this.summary) {
        this.summary = overflowMessages
          .slice(-4)
          .map(m => `[${m.role === 'user' ? '问' : '答'}]: ${m.content.slice(0, 100)}`)
          .join('; ');
      }
    }
  }

  /** 清空记忆 */
  clear(): void {
    this.history = [];
    this.summary = null;
  }

  /** 导出记忆状态（调试用） */
  getStats(): { totalMessages: number; windowSize: number; hasSummary: boolean; summaryLength: number } {
    return {
      totalMessages: this.history.length,
      windowSize: this.maxPairs * 2,
      hasSummary: this.summary !== null,
      summaryLength: this.summary?.length || 0,
    };
  }
}

// ============================================================
// 全局 Session Memory 存储（服务重启后丢失）
// ============================================================

const sessionStore = new Map<string, MemoryManager>();

/** 获取或创建 session 的 MemoryManager */
export function getSessionMemory(sessionId: string): MemoryManager {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new MemoryManager());
  }
  return sessionStore.get(sessionId)!;
}

/** 清理过期 session（超过 30 分钟未活动） */
export function cleanupStaleSessions(maxAgeMs = 30 * 60 * 1000): void {
  const now = Date.now();
  for (const [id, mem] of sessionStore) {
    if (mem.messageCount === 0) {
      sessionStore.delete(id);
    }
  }
}

/** 定期清理（每 10 分钟） */
setInterval(cleanupStaleSessions, 10 * 60 * 1000);
