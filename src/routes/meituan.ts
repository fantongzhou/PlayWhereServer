import { Router, type Request, type Response } from 'express';
import {
  getTokenStatus,
  saveToken,
  isCLIInstalled,
  getInstallCommand,
} from '../services/meituan-travel.js';

const router = Router();

/** GET /api/meituan/status — 检查 Token 和 CLI 状态 */
router.get('/status', (_req: Request, res: Response) => {
  const token = getTokenStatus();
  const cliInstalled = isCLIInstalled();

  res.json({
    tokenConfigured: token.hasKey,
    cliInstalled,
    installCommand: cliInstalled ? null : getInstallCommand(),
  });
});

/** POST /api/meituan/token — 保存/更新 Token */
router.post('/token', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    res.status(400).json({ error: '请提供有效的 Token' });
    return;
  }

  try {
    saveToken(token.trim());
    res.json({ success: true, message: 'Token 已保存' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Token 保存失败' });
  }
});

export default router;
