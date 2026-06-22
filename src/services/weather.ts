import type { WeatherInfo } from '../types.js';

// ============================================================
// 高德天气 API
// Key 从环境变量读取（.env: AMAP_API_KEY），禁止硬编码
// 文档: https://lbs.amap.com/api/webservice/guide/api/weatherinfo
// 注意: extensions=all 最多返回 4 天预报（当天起），
//       超出范围的日期回退到基于月份的兜底天气。
// ============================================================

const AMAP_KEY = process.env.AMAP_API_KEY;
const AMAP_WEATHER_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

/** 城市 adcode 由 agent 自主搜索获取，不再硬编码映射。高德天气 API 同时支持中文城市名和 adcode。 */

/** 天气现象（汉字）→ 出行建议；用关键字匹配以兼容「小雨转中雨」等组合 */
function getSuggestion(condition: string): string {
  const c = condition || '';
  if (c.includes('雷')) return '有雷雨，避免户外与登山，建议安排室内活动';
  if (c.includes('暴雨') || c.includes('大雨')) return '有大到暴雨，不建议户外活动，建议安排室内景点';
  if (c.includes('雨')) return '有降水，建议携带雨具，可优先安排室内景点';
  if (c.includes('雪') || c.includes('冰')) return '有降雪/结冰，注意保暖防滑，谨慎出行';
  if (c.includes('雾') || c.includes('霾')) return '有雾/霾，能见度低，出行注意安全并佩戴口罩';
  if (c.includes('沙') || c.includes('尘')) return '有沙尘，注意防护，尽量减少户外';
  if (c.includes('晴')) return '天气晴好，适合户外活动，建议涂抹防晒';
  if (c.includes('多云')) return '多云天气，适宜出行，带把折叠伞以备不时';
  if (c.includes('阴')) return '阴天，温度适中，适合室内外活动';
  return '天气适宜，祝旅途愉快';
}

/**
 * 兜底天气：API Key 缺失 / 请求失败 / 日期超出预报范围时使用。
 * 基于月份给出合理的温度区间，确定性可复现。
 */
function fallbackWeather(city: string, date: string): WeatherInfo {
  const seed = date.length + city.length;
  const month = parseInt(date.split('-')[1] || '6', 10);

  let tempRange: [number, number];
  if (month >= 6 && month <= 8) tempRange = [24, 35];
  else if (month >= 3 && month <= 5) tempRange = [10, 22];
  else if (month >= 9 && month <= 11) tempRange = [12, 25];
  else tempRange = [0, 10];

  const low = tempRange[0] + (seed % 5);
  const high = tempRange[1] - (seed % 4);
  const conditions = ['晴', '多云', '阴', '小雨', '阵雨'];
  const condition = conditions[seed % conditions.length];

  return {
    date,
    temperature: { low, high },
    condition,
    suggestion: getSuggestion(condition),
  };
}

interface AmapCast {
  date: string;
  dayweather: string;
  nightweather: string;
  daytemp: number | string;
  nighttemp: number | string;
}

/**
 * 拉取高德天气预报（extensions=all），返回 date -> {condition, low, high} 映射。
 * 任何异常都返回空 Map，由调用方走兜底，保证不抛错。
 */
async function fetchAmapForecast(city: string): Promise<Map<string, { condition: string; low: number; high: number }>> {
  const result = new Map<string, { condition: string; low: number; high: number }>();
  if (!AMAP_KEY) return result;

  // 高德天气 API 支持中文城市名，也可接受 adcode。Agent 可自行搜索 adcode 作为 city 参数传入。
  const url = `${AMAP_WEATHER_URL}?key=${AMAP_KEY}&city=${encodeURIComponent(city)}&extensions=all&output=JSON`;

  try {
    const res = await fetch(url);
    if (!res.ok) return result;

    const data = (await res.json()) as {
      status?: string;
      info?: string;
      infocode?: string;
      forecasts?: { casts?: AmapCast[] }[];
    };

    if (data.status !== '1') {
      // 不打印 key，仅暴露高德返回的错误码便于排查（如 10009 = key 平台不匹配）
      console.warn(
        `⚠️ 高德天气接口返回异常：${data.info || '未知'} (infocode ${data.infocode || '-'})，将使用兜底天气`,
      );
      return result;
    }
    if (!Array.isArray(data.forecasts)) return result;

    const casts = data.forecasts[0]?.casts;
    if (!Array.isArray(casts)) return result;

    for (const c of casts) {
      if (!c.date) continue;
      result.set(c.date, {
        condition: c.dayweather || '晴',
        low: parseInt(String(c.nighttemp), 10) || 0,
        high: parseInt(String(c.daytemp), 10) || 0,
      });
    }
  } catch {
    // 网络/解析错误 → 返回空 Map，调用方走兜底
  }

  return result;
}

/**
 * 批量获取多个日期的天气（一次性查询，返回数组）。
 * 命中高德预报的日期用真实数据，其余回退到基于月份的兜底天气。
 */
export async function getWeatherBatch(city: string, dates: string[]): Promise<WeatherInfo[]> {
  try {
    const forecast = await fetchAmapForecast(city);

    return dates.map(date => {
      const f = forecast.get(date);
      if (f) {
        return {
          date,
          temperature: { low: f.low, high: f.high },
          condition: f.condition,
          suggestion: getSuggestion(f.condition),
        };
      }
      return fallbackWeather(city, date);
    });
  } catch (error) {
    console.log(error);
    return dates.map(date => fallbackWeather(city, date));
  }

}

/**
 * 获取单日天气。
 */
export async function getWeather(city: string, date: string): Promise<WeatherInfo> {
  const [w] = await getWeatherBatch(city, [date]);
  return w;
}
