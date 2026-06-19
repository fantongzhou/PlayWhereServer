import type { Hotel } from '../types.js';

const hotelsDB: Record<string, Hotel[]> = {
  // === 中国城市 ===
  '北京': [
    { name: '北京王府井文华东方酒店', lat: 39.9147, lng: 116.4107, pricePerNight: 2800, stars: 5, description: '俯瞰紫禁城，王府井核心地段，顶级奢华体验' },
    { name: '北京华尔道夫酒店', lat: 39.9170, lng: 116.4120, pricePerNight: 2200, stars: 5, description: '王府井商圈，黄铜外观设计独特，四合院套房颇具京味' },
    { name: '北京国贸大酒店', lat: 39.9088, lng: 116.4609, pricePerNight: 1800, stars: 5, description: 'CBD核心区域，云端客房可远眺长安街和故宫' },
    { name: '北京诺富特和平宾馆', lat: 39.9160, lng: 116.4130, pricePerNight: 600, stars: 4, description: '王府井步行街旁，交通便利，性价比之选' },
    { name: '北京东隅酒店', lat: 39.9360, lng: 116.4340, pricePerNight: 450, stars: 3, description: '三里屯附近，设计风格年轻时尚，适合潮流旅行者' },
  ],
  '上海': [
    { name: '上海外滩华尔道夫酒店', lat: 31.2398, lng: 121.4920, pricePerNight: 2500, stars: 5, description: '外滩历史建筑内，直面黄浦江，老上海风情与奢华并存' },
    { name: '上海浦东丽思卡尔顿', lat: 31.2366, lng: 121.5067, pricePerNight: 2200, stars: 5, description: '陆家嘴IFC楼上，落地窗正对东方明珠和外滩' },
    { name: '上海半岛酒店', lat: 31.2410, lng: 121.4885, pricePerNight: 3000, stars: 5, description: '外滩源，拥有专属劳斯莱斯车队和米其林餐厅' },
    { name: '上海迪士尼乐园酒店', lat: 31.1380, lng: 121.6610, pricePerNight: 1500, stars: 4, description: '迪士尼度假区内，主题房间充满童话气息，亲子首选' },
    { name: '全季酒店 上海外滩店', lat: 31.2370, lng: 121.4890, pricePerNight: 350, stars: 3, description: '外滩步行可达，中式简约风格，干净舒适价格适中' },
  ],
  '三亚': [
    { name: '三亚亚特兰蒂斯酒店', lat: 18.2680, lng: 109.7630, pricePerNight: 2800, stars: 5, description: '海棠湾地标，水世界和水族馆免费畅玩，亲子度假天堂' },
    { name: '三亚艾迪逊酒店', lat: 18.2650, lng: 109.7600, pricePerNight: 2200, stars: 5, description: '海棠湾极简设计风，私人沙滩和海上活动丰富' },
    { name: '三亚太阳湾柏悦酒店', lat: 18.2150, lng: 109.6380, pricePerNight: 2500, stars: 5, description: '亚龙湾私家湾区，私密性极好，独享白沙滩' },
    { name: '三亚亚龙湾红树林酒店', lat: 18.2230, lng: 109.6350, pricePerNight: 800, stars: 4, description: '亚龙湾C位，泰式风格建筑，直通沙滩性价比高' },
    { name: '三亚湾海韵度假酒店', lat: 18.2500, lng: 109.4800, pricePerNight: 300, stars: 3, description: '三亚湾一线海景，性价比之选，距机场仅15分钟' },
  ],
  '成都': [
    { name: '成都博舍酒店', lat: 30.6510, lng: 104.0850, pricePerNight: 1800, stars: 5, description: '太古里核心，新旧融合的设计典范，极具成都韵味' },
    { name: '成都钓鱼台精品酒店', lat: 30.6670, lng: 104.0550, pricePerNight: 1500, stars: 5, description: '宽窄巷子内，由清代庭院改建，闹中取静' },
    { name: '成都JW万豪酒店', lat: 30.6560, lng: 104.0680, pricePerNight: 900, stars: 4, description: '天府广场旁，交通便利，行政酒廊视野开阔' },
    { name: '成都全季酒店春熙路店', lat: 30.6540, lng: 104.0820, pricePerNight: 280, stars: 3, description: '春熙路步行可达，干净舒适价格实惠' },
  ],
  '西安': [
    { name: '西安索菲特传奇酒店', lat: 34.2620, lng: 108.9455, pricePerNight: 1600, stars: 5, description: '钟楼旁历史建筑内，法式优雅与古都底蕴完美融合' },
    { name: '西安威斯汀大酒店', lat: 34.2160, lng: 108.9630, pricePerNight: 900, stars: 4, description: '大雁塔对面，大唐不夜城步行可达，位置绝佳' },
    { name: '西安回民街美居酒店', lat: 34.2600, lng: 108.9420, pricePerNight: 350, stars: 3, description: '回民街近在咫尺，逛吃方便，性价比高' },
    { name: '西安W酒店', lat: 34.2140, lng: 108.9680, pricePerNight: 1200, stars: 5, description: '曲江新区，潮流设计风格，夜生活丰富多彩' },
  ],
  '杭州': [
    { name: '杭州法云安缦', lat: 30.2460, lng: 120.1000, pricePerNight: 4500, stars: 5, description: '灵隐寺旁的法云古村改建，禅意栖居的极致体验' },
    { name: '杭州西子湖四季酒店', lat: 30.2388, lng: 120.1433, pricePerNight: 3500, stars: 5, description: '西湖畔江南园林式酒店，金沙厅为杭城顶级中餐厅' },
    { name: '杭州城中香格里拉', lat: 30.2570, lng: 120.1610, pricePerNight: 900, stars: 4, description: '武林商圈，西湖步行可达，商务度假两相宜' },
    { name: '全季酒店 西湖店', lat: 30.2450, lng: 120.1550, pricePerNight: 320, stars: 3, description: '西湖步行可达，干净舒适，是西湖周边的性价比之选' },
    { name: '杭州西湖庐驿', lat: 30.2290, lng: 120.1300, pricePerNight: 600, stars: 3, description: '满觉陇茶园旁的精品民宿，隐于山林茶香环绕' },
  ],
  // === 日本城市（保留兼容） ===
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
