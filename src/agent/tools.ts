import { getWeatherBatch } from '../services/weather.js';
import { getRoute } from '../services/routes.js';
import {
  searchMeituanTravel,
  saveToken,
  getTokenStatus,
  syncTokenToCLIConfig,
} from '../services/meituan-travel.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, any>) => Promise<any>;
}

export const tools: ToolDefinition[] = [
  {
    name: 'get_weather',
    description: '获取指定城市一个或多个日期的天气（高德 API）。参数: city(中文城市名即可，也支持高德 adcode), dates(日期数组，格式YYYY-MM-DD，如["2026-06-20","2026-06-21"])。返回天气信息数组，含 condition/temperature/suggestion。',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
        dates: {
          type: 'array',
          items: { type: 'string', description: '日期，格式 YYYY-MM-DD' },
          description: '要查询的日期数组，支持一次性查询多天',
        },
      },
      required: ['city', 'dates'],
    },
    execute: async (args) => {
      // 兼容旧的单日期 date 参数
      const dates: string[] = Array.isArray(args.dates)
        ? args.dates
        : args.date
          ? [args.date]
          : [];
      return getWeatherBatch(args.city, dates);
    },
  },
  {
    name: 'get_route',
    description: '获取两个地点之间的交通路线。参数: fromName, fromLat, fromLng, toName, toLat, toLng',
    parameters: {
      type: 'object',
      properties: {
        fromName: { type: 'string' },
        fromLat: { type: 'number' },
        fromLng: { type: 'number' },
        toName: { type: 'string' },
        toLat: { type: 'number' },
        toLng: { type: 'number' },
      },
      required: ['fromName', 'fromLat', 'fromLng', 'toName', 'toLat', 'toLng'],
    },
    execute: async (args) => getRoute(args.fromName, args.fromLat, args.fromLng, args.toName, args.toLat, args.toLng),
  },
  // ============================================================
  // 美团旅行 Skill 工具
  // ============================================================
  {
    name: 'check_meituan_token',
    description: '检查美团旅行 API Token 是否已配置。Token 优先从环境变量 MEITUAN_API_TOKEN 读取，其次从 CLI 配置文件读取。',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      const status = getTokenStatus();
      return {
        configured: status.hasKey,
        source: status.source,
        message: status.hasKey
          ? `✅ Token 已配置（来源：${status.source === 'env' ? '环境变量 MEITUAN_API_TOKEN' : 'CLI 配置文件'}），可以直接使用美团旅行服务。`
          : '❌ Token 未配置，请在服务器 .env 中设置 MEITUAN_API_TOKEN。',
      };
    },
  },
  {
    name: 'save_meituan_token',
    description: `配置/修复美团旅行 API Token。
- 如果提供了 token 参数 → 保存到 CLI 配置文件（~/.config/meituan-travel/config.json）
- 如果未提供 token → 从环境变量 MEITUAN_API_TOKEN 读取并同步到 CLI 配置文件
- 当 CLI 找不到 Token 时使用此工具从环境变量恢复配置`,
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: '可选：用户提供的 Token 字符串。不填则从环境变量 MEITUAN_API_TOKEN 同步' },
      },
      required: [],
    },
    execute: async (args) => {
      try {
        if (args.token) {
          // 用户提供了 token → 保存到 CLI 配置
          saveToken(args.token);
          return { success: true, message: '✅ Token 已保存到 CLI 配置文件。' };
        } else {
          // 未提供 token → 从环境变量同步
          const envToken = process.env.MEITUAN_API_TOKEN;
          if (!envToken || envToken.trim().length === 0) {
            return {
              success: false,
              message: '⚠️ 环境变量 MEITUAN_API_TOKEN 未设置或为空，请在服务器 .env 中配置。',
            };
          }
          syncTokenToCLIConfig();
          return { success: true, message: '✅ 已将环境变量 MEITUAN_API_TOKEN 同步到 CLI 配置文件。' };
        }
      } catch (e: any) {
        return { success: false, message: `Token 配置失败：${e.message}` };
      }
    },
  },
  {
    name: 'search_meituan_travel',
    description: `使用美团旅行服务搜索酒店、景点门票、机票火车票、度假产品等。
Token 已在服务器环境变量中配置，无需额外检查。
参数:
- city: 城市名称（必填），如"北京"、"上海"、"三亚"
- query: 详细的查询需求（必填），越具体推荐越精准。
  建议包含：出发城市、出行时间、人数、预算、偏好风格等。
  示例："周末情侣酒店，预算500内，离西湖1公里内"
  示例："两大一小上海迪士尼门票"
  示例："明天北京到武汉的火车票"
返回：美团旅行平台的真实商品/攻略数据。响应耗时约1-2分钟，调用后请告知用户耐心等待。`,
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称，如"北京"、"上海"、"三亚"' },
        query: { type: 'string', description: '详细查询需求，包含出行时间、人数、预算、偏好等' },
      },
      required: ['city', 'query'],
    },
    execute: async (args) => {
      return searchMeituanTravel(args.city, args.query);
    },
  },
];
