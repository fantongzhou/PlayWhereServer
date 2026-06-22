import { Router, type Request, type Response } from 'express';
import { runAgent } from '../agent/index.js';

const router = Router();

/** POST /api/plan — 行程规划（自然语言输入，SSE 流，含短期记忆，支持打断） */
router.post('/', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: '缺少必要参数：message（旅行需求描述）' });
    return;
  }

  const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 设置 SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendSSE = (event: any) => {
    if (res.writableEnded || res.destroyed) return;
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // 客户端断开连接时触发 abort（监听 response，不是 request）
  let aborted = false;
  const onClose = () => { aborted = true; };
  res.on('close', onClose);

  // 首次请求时告知客户端 sessionId
  if (!sessionId) {
    sendSSE({ type: 'start', message: '正在为您定制旅行计划...', step: 0, data: { sessionId: sid } });
  }

  try {
    await runAgent(message, sid, sendSSE, () => aborted);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      sendSSE({ type: 'error', message: '用户中断' });
    } else {
      sendSSE({ type: 'error', message: error.message || '未知错误' });
    }
  } finally {
    res.off('close', onClose);
    res.end();
  }
});

export default router;
