import { Router, type Request, type Response } from 'express';
import { runAgent, runChatAgent } from '../agent/index.js';

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

/** POST /api/plan/chat — 自由对话（支持美团 Token 流程等多轮交互） */
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: '缺少必要参数：message（用户消息）' });
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
    await runChatAgent(message, sendSSE);
  } catch (error: any) {
    sendSSE({ type: 'error', message: error.message || '未知错误' });
  } finally {
    res.end();
  }
});

export default router;
