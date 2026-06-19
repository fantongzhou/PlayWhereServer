import type { Attraction } from '../types.js';

const attractionsDB: Record<string, Attraction[]> = {
  '京都': [
    { name: '清水寺', lat: 34.9949, lng: 135.7850, rating: 4.7, duration: 2.5, category: '寺庙', description: '世界文化遗产，京都最古老的寺院，悬空舞台可俯瞰京都市景' },
    { name: '金阁寺', lat: 35.0394, lng: 135.7292, rating: 4.6, duration: 1.5, category: '寺庙', description: '贴满金箔的楼阁倒映在镜湖池中，是京都最具代表性的景观' },
    { name: '伏见稻荷大社', lat: 34.9671, lng: 135.7726, rating: 4.8, duration: 3, category: '神社', description: '千本鸟居绵延至稻荷山顶，是京都最受欢迎的神社之一' },
    { name: '岚山竹林', lat: 35.0170, lng: 135.6710, rating: 4.5, duration: 2, category: '自然', description: '高耸的竹林小径，光影交错，是京都最具禅意的景点' },
    { name: '二条城', lat: 35.0142, lng: 135.7481, rating: 4.4, duration: 2, category: '历史', description: '德川家康兴建的城堡，黄莺走廊和狩野派障壁画值得一看' },
    { name: '祇园', lat: 35.0036, lng: 135.7757, rating: 4.6, duration: 2, category: '街区', description: '京都著名的艺伎区，花见小路两旁保留着传统町家建筑' },
    { name: '银阁寺', lat: 35.0270, lng: 135.7980, rating: 4.3, duration: 1.5, category: '寺庙', description: '枯山水庭园代表，银沙滩向月台极富禅意' },
    { name: '锦市场', lat: 35.0050, lng: 135.7667, rating: 4.4, duration: 1.5, category: '购物', description: '京都厨房，400年历史的商店街，可品尝各种京都美食' },
    { name: '鸭川', lat: 35.0117, lng: 135.7681, rating: 4.2, duration: 1, category: '自然', description: '穿城而过的河流，两岸的纳凉床是京都夏日风情' },
    { name: '龙安寺', lat: 35.0345, lng: 135.7185, rating: 4.5, duration: 1, category: '寺庙', description: '以枯山水石庭闻名，15块石头从任何角度只能看到14块' },
  ],
  '东京': [
    { name: '浅草寺', lat: 35.7148, lng: 139.7967, rating: 4.5, duration: 2, category: '寺庙', description: '东京最古老的寺院，雷门大红灯笼和仲见世通商店街' },
    { name: '明治神宫', lat: 35.6764, lng: 139.6993, rating: 4.6, duration: 2, category: '神社', description: '位于涩谷的都市绿洲，供奉明治天皇和昭宪皇太后' },
    { name: '涩谷十字路口', lat: 35.6595, lng: 139.7004, rating: 4.4, duration: 0.5, category: '街区', description: '世界最繁忙的十字路口，是东京的象征性地标' },
    { name: '东京晴空塔', lat: 35.7101, lng: 139.8107, rating: 4.5, duration: 2, category: '观景', description: '634米高的世界第一高塔，可360度俯瞰东京全景' },
    { name: '秋叶原', lat: 35.7023, lng: 139.7745, rating: 4.4, duration: 3, category: '购物', description: '电器街和御宅文化中心，动漫、手办、电玩的圣地' },
    { name: '上野公园', lat: 35.7146, lng: 139.7732, rating: 4.5, duration: 2.5, category: '公园', description: '东京最大的公园，内有博物馆、动物园和数千棵樱花树' },
    { name: '筑地场外市场', lat: 35.6654, lng: 139.7707, rating: 4.6, duration: 2, category: '美食', description: '新鲜海鲜和寿司的天堂，早晨去可以品尝最新鲜的海鲜丼' },
    { name: '皇居', lat: 35.6854, lng: 139.7533, rating: 4.3, duration: 2, category: '历史', description: '日本天皇的居所，东御苑对外开放，护城河和石垣值得一看' },
    { name: '台场', lat: 35.6262, lng: 139.7751, rating: 4.3, duration: 3, category: '娱乐', description: '临海副都心，有巨型高达、teamLab和彩虹大桥夜景' },
    { name: '新宿御苑', lat: 35.6852, lng: 139.7087, rating: 4.4, duration: 1.5, category: '公园', description: '日式、法式、英式三种风格的庭园，是赏樱名所' },
  ],
  '大阪': [
    { name: '大阪城', lat: 34.6873, lng: 135.5259, rating: 4.5, duration: 2.5, category: '历史', description: '丰臣秀吉建造的城堡，天守阁内展示着大阪历史文物' },
    { name: '道顿堀', lat: 34.6687, lng: 135.5012, rating: 4.6, duration: 2, category: '美食', description: '大阪美食天堂，格力高广告牌和蟹道乐是标志性景观' },
    { name: '环球影城', lat: 34.6654, lng: 135.4323, rating: 4.7, duration: 8, category: '主题乐园', description: '日本环球影城，任天堂世界备受游客喜爱' },
    { name: '通天阁', lat: 34.6525, lng: 135.5063, rating: 4.1, duration: 1, category: '观景', description: '大阪的地标建筑，展望台可眺望大阪市区' },
    { name: '海游馆', lat: 34.6545, lng: 135.4288, rating: 4.6, duration: 3, category: '水族馆', description: '世界最大级水族馆，鲸鲨是镇馆之宝' },
    { name: '心斋桥', lat: 34.6721, lng: 135.5010, rating: 4.4, duration: 2, category: '购物', description: '大阪最繁华的购物街，药妆店和百货商场林立' },
  ],
};

export function searchAttractions(city: string, preferences: string[]): Attraction[] {
  const all = attractionsDB[city] || [];
  if (preferences.length === 0) return all;

  const prefMap: Record<string, string[]> = {
    '文化历史': ['寺庙', '神社', '历史'],
    '自然风光': ['自然', '公园'],
    '美食购物': ['美食', '购物', '街区'],
    '娱乐休闲': ['主题乐园', '娱乐', '观景'],
    '亲子游': ['主题乐园', '水族馆', '公园'],
  };

  const preferredCategories = preferences.flatMap(p => prefMap[p] || []);
  if (preferredCategories.length === 0) return all;

  return all.filter(a => preferredCategories.some(c => a.category.includes(c)));
}
