import type { Restaurant } from '../types.js';

const restaurantsDB: Record<string, Restaurant[]> = {
  '京都': [
    { name: '祇园 末友', lat: 35.0039, lng: 135.7750, avgPrice: 400, cuisine: '怀石料理', rating: 4.8 },
    { name: '一兰拉面 京都河原町店', lat: 35.0065, lng: 135.7695, avgPrice: 60, cuisine: '拉面', rating: 4.3 },
    { name: '锦市场 海鲜丼', lat: 35.0050, lng: 135.7667, avgPrice: 80, cuisine: '海鲜', rating: 4.4 },
    { name: '先斗町 京料理 六盛', lat: 35.0063, lng: 135.7700, avgPrice: 300, cuisine: '京料理', rating: 4.5 },
    { name: '岚山 よしむら', lat: 35.0155, lng: 135.6765, avgPrice: 150, cuisine: '荞麦面', rating: 4.3 },
    { name: '京都站 拉面小路', lat: 34.9855, lng: 135.7586, avgPrice: 60, cuisine: '拉面', rating: 4.2 },
  ],
  '东京': [
    { name: '筑地 寿司大', lat: 35.6600, lng: 139.7700, avgPrice: 250, cuisine: '寿司', rating: 4.7 },
    { name: '一兰拉面 新宿店', lat: 35.6940, lng: 139.7030, avgPrice: 60, cuisine: '拉面', rating: 4.3 },
    { name: '叙叙苑 银座店', lat: 35.6715, lng: 139.7645, avgPrice: 500, cuisine: '烧肉', rating: 4.6 },
    { name: '六本木 龙吟', lat: 35.6615, lng: 139.7295, avgPrice: 1200, cuisine: '怀石料理', rating: 4.9 },
    { name: '秋叶原 丸五', lat: 35.7020, lng: 139.7730, avgPrice: 120, cuisine: '炸猪排', rating: 4.5 },
    { name: '浅草 今半', lat: 35.7130, lng: 139.7950, avgPrice: 400, cuisine: '寿喜烧', rating: 4.6 },
  ],
  '大阪': [
    { name: '道顿堀 蟹道乐', lat: 34.6689, lng: 135.5010, avgPrice: 300, cuisine: '螃蟹料理', rating: 4.4 },
    { name: '新世界 串カツ だるま', lat: 34.6515, lng: 135.5065, avgPrice: 80, cuisine: '炸串', rating: 4.3 },
    { name: '黑门市场 鱼福', lat: 34.6630, lng: 135.5045, avgPrice: 150, cuisine: '海鲜', rating: 4.5 },
    { name: '心斋桥 大阪王将', lat: 34.6720, lng: 135.5005, avgPrice: 50, cuisine: '饺子', rating: 4.0 },
    { name: '梅田 はり重', lat: 34.7000, lng: 135.4960, avgPrice: 500, cuisine: '和牛', rating: 4.7 },
    { name: '美国村 タコタコキング', lat: 34.6710, lng: 135.4985, avgPrice: 30, cuisine: '章鱼烧', rating: 4.2 },
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
