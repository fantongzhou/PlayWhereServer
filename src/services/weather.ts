import type { WeatherInfo } from '../types.js';

const weatherConditions = ['晴', '多云', '阴', '小雨', '阵雨'];

export function getWeather(city: string, date: string): WeatherInfo {
  const seed = date.length + city.length;
  const month = parseInt(date.split('-')[1] || '6');

  // 根据月份调整温度范围
  let tempRange: [number, number];
  if (month >= 6 && month <= 8) {
    tempRange = [24, 35];
  } else if (month >= 3 && month <= 5) {
    tempRange = [10, 22];
  } else if (month >= 9 && month <= 11) {
    tempRange = [12, 25];
  } else {
    tempRange = [0, 10];
  }

  const low = tempRange[0] + (seed % 5);
  const high = tempRange[1] - (seed % 4);
  const condition = weatherConditions[seed % weatherConditions.length];

  const suggestions: Record<string, string> = {
    '晴': '天气晴好，适合户外活动，建议涂抹防晒',
    '多云': '多云天气，适宜出行，带一把折叠伞以备不时',
    '阴': '阴天，温度适中，适合室内外活动',
    '小雨': '有小雨，建议携带雨具，可安排室内景点',
    '阵雨': '有阵雨，建议上午户外下午室内，携带雨伞',
  };

  return {
    date,
    temperature: { low, high },
    condition,
    suggestion: suggestions[condition] || '天气适宜，祝旅途愉快',
  };
}
