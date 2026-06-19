import { searchAttractions } from '../services/attractions.js';
import { searchHotels } from '../services/hotels.js';
import { searchFlights as getFlights } from '../services/flights.js';
import { getWeather } from '../services/weather.js';
import { getRoute } from '../services/routes.js';
import { searchRestaurants } from '../services/restaurants.js';
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
    name: 'search_attractions',
    description: '搜索指定城市的旅游景点。参数: city(城市名), preferences(偏好数组，如["文化历史","美食购物"])',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称，如"京都"、"东京"、"大阪"' },
        preferences: {
          type: 'array',
          items: { type: 'string' },
          description: '用户的偏好标签',
        },
      },
      required: ['city'],
    },
    execute: async (args) => searchAttractions(args.city, args.preferences || []),
  },
  {
    name: 'search_hotels',
    description: '搜索指定城市的酒店。参数: city(城市名), budget(预算等级: budget/moderate/luxury)',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
        budget: { type: 'string', enum: ['budget', 'moderate', 'luxury'], description: '预算等级' },
      },
      required: ['city'],
    },
    execute: async (args) => searchHotels(args.city, args.budget || 'moderate'),
  },
  {
    name: 'search_flights',
    description: '搜索航班信息。参数: origin(出发城市), destination(目的城市)',
    parameters: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: '出发城市' },
        destination: { type: 'string', description: '目的城市' },
      },
      required: ['origin', 'destination'],
    },
    execute: async (args) => getFlights(args.origin, args.destination),
  },
  {
    name: 'get_weather',
    description: '获取指定城市某天的天气。参数: city(城市名), date(日期，格式YYYY-MM-DD)',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
        date: { type: 'string', description: '日期，格式YYYY-MM-DD' },
      },
      required: ['city', 'date'],
    },
    execute: async (args) => getWeather(args.city, args.date),
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
  {
    name: 'search_restaurants',
    description: '搜索指定城市的餐厅。参数: city(城市名), preferences(偏好数组)',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
        preferences: {
          type: 'array',
          items: { type: 'string' },
          description: '菜系偏好',
        },
      },
      required: ['city'],
    },
    execute: async (args) => searchRestaurants(args.city, args.preferences || []),
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
