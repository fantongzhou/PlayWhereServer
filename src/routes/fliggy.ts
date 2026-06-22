import { Router, type Request, type Response } from 'express';
import {
  getTokenStatus,
  saveToken,
  isCLIInstalled,
  getInstallCommand,
} from '../services/fliggy-travel.js';

const router = Router();

/** GET /api/fliggy/status — 检查 API Key 和 CLI 状态 */
router.get('/status', (_req: Request, res: Response) => {
  const token = getTokenStatus();
  const cliInstalled = isCLIInstalled();

  res.json({
    tokenConfigured: token.hasKey,
    cliInstalled,
    installCommand: cliInstalled ? null : getInstallCommand(),
  });
});

/** POST /api/fliggy/token — 保存/更新 API Key */
router.post('/token', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    res.status(400).json({ error: '请提供有效的 API Key' });
    return;
  }

  try {
    saveToken(token.trim());
    res.json({ success: true, message: 'API Key 已保存' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'API Key 保存失败' });
  }
});

export default router;
