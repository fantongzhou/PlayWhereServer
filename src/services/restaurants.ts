import type { Restaurant } from '../types.js';

const restaurantsDB: Record<string, Restaurant[]> = {
  // === 中国城市 ===
  '北京': [
    { name: '全聚德烤鸭店 前门店', lat: 39.8950, lng: 116.3970, avgPrice: 200, cuisine: '北京菜', rating: 4.3 },
    { name: '四季民福烤鸭店 故宫店', lat: 39.9160, lng: 116.4030, avgPrice: 150, cuisine: '北京菜', rating: 4.6 },
    { name: '簋街胡大饭馆', lat: 39.9340, lng: 116.4320, avgPrice: 120, cuisine: '川菜', rating: 4.4 },
    { name: '大董烤鸭店', lat: 39.9120, lng: 116.4650, avgPrice: 350, cuisine: '创意京菜', rating: 4.7 },
    { name: '南门涮肉', lat: 39.9385, lng: 116.4040, avgPrice: 100, cuisine: '火锅', rating: 4.5 },
    { name: '护国寺小吃', lat: 39.9320, lng: 116.3700, avgPrice: 30, cuisine: '北京小吃', rating: 4.1 },
  ],
  '上海': [
    { name: '南翔馒头店 豫园店', lat: 31.2270, lng: 121.4930, avgPrice: 80, cuisine: '上海小吃', rating: 4.4 },
    { name: '老吉士酒家', lat: 31.2150, lng: 121.4450, avgPrice: 150, cuisine: '本帮菜', rating: 4.6 },
    { name: 'Ultraviolet by Paul Pairet', lat: 31.2600, lng: 121.4800, avgPrice: 6000, cuisine: '分子料理', rating: 4.9 },
    { name: '蟹家大院', lat: 31.2380, lng: 121.4950, avgPrice: 360, cuisine: '蟹料理', rating: 4.5 },
    { name: '德兴馆', lat: 31.2340, lng: 121.4940, avgPrice: 60, cuisine: '本帮面馆', rating: 4.2 },
    { name: '哥老官重庆美蛙鱼头', lat: 31.2280, lng: 121.4780, avgPrice: 130, cuisine: '火锅', rating: 4.4 },
  ],
  '三亚': [
    { name: '三亚第一市场海鲜加工', lat: 18.2400, lng: 109.5100, avgPrice: 150, cuisine: '海鲜', rating: 4.2 },
    { name: '嗲嗲的椰子鸡', lat: 18.2450, lng: 109.5000, avgPrice: 100, cuisine: '海南菜', rating: 4.4 },
    { name: '阿浪海鲜', lat: 18.2670, lng: 109.7600, avgPrice: 180, cuisine: '海鲜', rating: 4.3 },
    { name: '四川小胡子海鲜加工店', lat: 18.2420, lng: 109.5120, avgPrice: 120, cuisine: '川味海鲜', rating: 4.1 },
    { name: '张猫猫的店', lat: 18.2650, lng: 109.7580, avgPrice: 80, cuisine: '创意海南菜', rating: 4.3 },
  ],
  '成都': [
    { name: '大龙燚火锅 太古里店', lat: 30.6530, lng: 104.0860, avgPrice: 120, cuisine: '火锅', rating: 4.5 },
    { name: '陈麻婆豆腐', lat: 30.6570, lng: 104.0560, avgPrice: 50, cuisine: '川菜', rating: 4.4 },
    { name: '玉林串串香', lat: 30.6320, lng: 104.0520, avgPrice: 60, cuisine: '串串', rating: 4.3 },
    { name: '张烤鸭', lat: 30.6500, lng: 104.0720, avgPrice: 80, cuisine: '川菜', rating: 4.5 },
    { name: '龙抄手 春熙路店', lat: 30.6550, lng: 104.0810, avgPrice: 30, cuisine: '成都小吃', rating: 4.2 },
    { name: '小龙坎老火锅', lat: 30.6540, lng: 104.0650, avgPrice: 110, cuisine: '火锅', rating: 4.6 },
  ],
  '西安': [
    { name: '回民街 老米家大雨肉夹馍', lat: 34.2630, lng: 108.9430, avgPrice: 25, cuisine: '陕西小吃', rating: 4.5 },
    { name: '西安饭庄', lat: 34.2600, lng: 108.9510, avgPrice: 120, cuisine: '陕菜', rating: 4.4 },
    { name: '长安大排档', lat: 34.2150, lng: 108.9630, avgPrice: 80, cuisine: '创意陕菜', rating: 4.5 },
    { name: '回民街 贾三灌汤包子', lat: 34.2625, lng: 108.9435, avgPrice: 40, cuisine: '陕西小吃', rating: 4.3 },
    { name: '醉长安', lat: 34.2610, lng: 108.9460, avgPrice: 90, cuisine: '陕菜', rating: 4.4 },
  ],
  '杭州': [
    { name: '楼外楼 孤山路店', lat: 30.2510, lng: 120.1360, avgPrice: 200, cuisine: '杭帮菜', rating: 4.3 },
    { name: '外婆家 湖滨店', lat: 30.2490, lng: 120.1640, avgPrice: 70, cuisine: '杭帮菜', rating: 4.2 },
    { name: '知味观 味庄', lat: 30.2370, lng: 120.1460, avgPrice: 120, cuisine: '杭帮菜', rating: 4.4 },
    { name: '奎元馆', lat: 30.2480, lng: 120.1670, avgPrice: 50, cuisine: '面馆', rating: 4.3 },
    { name: '绿茶餐厅 龙井路店', lat: 30.2300, lng: 120.1240, avgPrice: 70, cuisine: '创意江浙菜', rating: 4.3 },
    { name: '新丰小吃', lat: 30.2530, lng: 120.1680, avgPrice: 20, cuisine: '杭州小吃', rating: 4.1 },
  ],
};

export function searchRestaurants(city: string, preferences: string[]): Restaurant[] {
  const all = restaurantsDB[city] || [];
  if (preferences.length === 0) return all;

  const cuisinePrefs = preferences
    .filter(p => ['日本料理', '中华料理', '西餐', '素食'].includes(p))
    .map(p => {
      const map: Record<string, string> = {
        '日本料理': '怀石料理',
      };
      return map[p] || p;
    });

  if (cuisinePrefs.length === 0) return all;

  // 如果指定了菜系偏好，优先返回匹配的，再补充其他的
  const matched = all.filter(r => cuisinePrefs.some(c => r.cuisine.includes(c)));
  return matched.length > 0 ? matched : all;
}
