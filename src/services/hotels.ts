import type { Hotel } from '../types.js';

const hotelsDB: Record<string, Hotel[]> = {
  '京都': [
    { name: '京都格兰比亚大酒店', lat: 34.9855, lng: 135.7586, pricePerNight: 800, stars: 4, description: '位于京都站内，交通极为便利' },
    { name: '京都丽思卡尔顿酒店', lat: 35.0117, lng: 135.7688, pricePerNight: 2500, stars: 5, description: '鸭川河畔奢华日式酒店，拥有私人庭园' },
    { name: '京都祇园赛莱斯廷酒店', lat: 35.0020, lng: 135.7767, pricePerNight: 1200, stars: 4, description: '祇园核心位置，可步行至花见小路' },
    { name: '京都町家民宿 乐宿', lat: 34.9987, lng: 135.7710, pricePerNight: 400, stars: 3, description: '传统町家改建的民宿，体验日式生活' },
    { name: '京都岚山花传抄', lat: 35.0132, lng: 135.6762, pricePerNight: 1800, stars: 4, description: '岚山温泉酒店，拥有露天风吕' },
  ],
  '东京': [
    { name: '东京安缦', lat: 35.6833, lng: 139.7640, pricePerNight: 3000, stars: 5, description: '大手町的高空奢华酒店，可以眺望富士山' },
    { name: '新宿格拉斯丽酒店', lat: 35.6955, lng: 139.7014, pricePerNight: 700, stars: 4, description: '新宿歌舞伎町，哥斯拉主题酒店' },
    { name: '东京浅草雷门休雷克盖特酒店', lat: 35.7125, lng: 139.7962, pricePerNight: 500, stars: 3, description: '浅草寺附近，性价比极高' },
    { name: '东京半岛酒店', lat: 35.6736, lng: 139.7640, pricePerNight: 2200, stars: 5, description: '丸之内商务区，直面皇居外苑' },
    { name: '东京涩谷卓越酒店', lat: 35.6588, lng: 139.7009, pricePerNight: 550, stars: 3, description: '涩谷中心，步行到十字路口仅3分钟' },
  ],
  '大阪': [
    { name: '大阪万豪都酒店', lat: 34.6463, lng: 135.5137, pricePerNight: 1200, stars: 5, description: '日本第一高楼阿倍野HARUKAS内，夜景绝佳' },
    { name: '大阪心斋桥格兰多酒店', lat: 34.6732, lng: 135.5005, pricePerNight: 500, stars: 3, description: '心斋桥商店街步行可达，购物便利' },
    { name: '大阪洲际酒店', lat: 34.6995, lng: 135.4947, pricePerNight: 1500, stars: 5, description: '梅田商圈，服务和设施一流' },
    { name: '大阪难波光芒酒店', lat: 34.6670, lng: 135.5020, pricePerNight: 600, stars: 4, description: '难波核心地带，道顿堀步行可达' },
  ],
};

export function searchHotels(city: string, budget: string): Hotel[] {
  const all = hotelsDB[city] || [];
  const budgetLimit: Record<string, number> = {
    budget: 600,
    moderate: 1500,
    luxury: Infinity,
  };

  const maxPrice = budgetLimit[budget] || Infinity;
  return all.filter(h => h.pricePerNight <= maxPrice);
}
