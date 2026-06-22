import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import planRouter from './routes/plan.js';
import routesRouter from './routes/travel-routes.js';
import fliggyRouter from './routes/fliggy.js';
import { syncApiKeyToCLI } from './services/fliggy-travel.js';

// 启动时同步飞猪 API Key 到 flyai CLI 配置
syncApiKeyToCLI();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY, test: '23' });
});

app.use('/api/plan', planRouter);
app.use('/api/routes', routesRouter);
app.use('/api/fliggy', fliggyRouter);

app.listen(PORT, () => {
  console.log(`🚀 Travel Agent Server running on http://localhost:${PORT}`);
  const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);
  console.log(`🤖 LLM Mode: ${hasApiKey ? 'Real LLM' : 'Simulated (no API key set)'}`);
});
