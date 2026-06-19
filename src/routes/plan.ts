import { Router, type Request, type Response } from 'express';
import { runAgent, runChatAgent, clearSessionMemory } from '../agent/index.js';
import { getSessionMemory } from '../agent/memory.js';

const router = Router();

/** POST /api/plan — 结构化行程规划 */
router.post('/', async (req: Request, res: Response) => {
  const { city, days, preferences, budget } = req.body;

  if (!city || !days) {
    res.status(400).json({ error: '缺少必要参数：city, days' });
    return;
  }

  // 设置 SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendSSE = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await runAgent(
      { city, days, preferences: preferences || [], budget: budget || 'moderate' },
      sendSSE,
    );
  } catch (error: any) {
    sendSSE({ type: 'error', message: error.message || '未知错误' });
  } finally {
    res.end();
  }
});

/** POST /api/plan/chat — 自由对话（带记忆：滑动窗口 + 历史精炼） */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: '缺少必要参数：message（用户消息）' });
    return;
  }

  // sessionId 可选：不传则自动生成
  const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 设置 SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendSSE = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    // 发送 sessionId 给客户端（用于后续请求维持记忆）
    sendSSE({ type: 'start', message: '正在处理您的问题...', step: 0, data: { sessionId: sid } });
    await runChatAgent(message, sid, sendSSE);
  } catch (error: any) {
    sendSSE({ type: 'error', message: error.message || '未知错误' });
  } finally {
    res.end();
  }
});

/** DELETE /api/plan/chat/memory?sessionId=xxx — 清除会话记忆 */
router.delete('/chat/memory', (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: '缺少必要参数：sessionId' });
    return;
  }

  clearSessionMemory(sessionId);
  res.json({ success: true, message: `会话 ${sessionId} 记忆已清除` });
});

/** GET /api/plan/chat/memory?sessionId=xxx — 查看会话记忆状态 */
router.get('/chat/memory', (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: '缺少必要参数：sessionId' });
    return;
  }

  const memory = getSessionMemory(sessionId);
  res.json(memory.getStats());
});

export default router;
