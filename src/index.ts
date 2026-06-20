import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import planRouter from './routes/plan.js';
import routesRouter from './routes/travel-routes.js';
import meituanRouter from './routes/meituan.js';
import { syncTokenToCLIConfig } from './services/meituan-travel.js';

// 启动时同步美团 Token 到 CLI 配置
syncTokenToCLIConfig();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY });
});

app.use('/api/plan', planRouter);
app.use('/api/routes', routesRouter);
app.use('/api/meituan', meituanRouter);

app.listen(PORT, () => {
  console.log(`🚀 Travel Agent Server running on http://localhost:${PORT}`);
  const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);
  console.log(`🤖 LLM Mode: ${hasApiKey ? 'Real LLM' : 'Simulated (no API key set)'}`);
});
