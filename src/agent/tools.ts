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
    description: '检查美团旅行 API Token 是否已配置。返回 Token 状态。',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      const status = getTokenStatus();
      return {
        configured: status.hasKey,
        message: status.hasKey
          ? '✅ Token 已配置，可以直接使用美团旅行服务。'
          : '❌ Token 未配置，需要用户前往美团开发者中心创建 Token。',
      };
    },
  },
  {
    name: 'save_meituan_token',
    description: '保存用户提供的美团旅行 API Token。参数: token(用户提供的Token字符串)。调用后 Token 会被安全存储到本地配置。',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: '用户提供的美团 API Token 字符串' },
      },
      required: ['token'],
    },
    execute: async (args) => {
      try {
        saveToken(args.token);
        return { success: true, message: '✅ Token 已保存，正在为您查询…' };
      } catch (e: any) {
        return { success: false, message: `Token 保存失败：${e.message}` };
      }
    },
  },
  {
    name: 'search_meituan_travel',
    description: `使用美团旅行服务搜索酒店、景点门票、机票火车票、度假产品等。
调用前必须先通过 check_meituan_token 确认 Token 已配置。
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
