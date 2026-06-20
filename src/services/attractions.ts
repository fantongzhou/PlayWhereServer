import type { Attraction } from '../types.js';

const attractionsDB: Record<string, Attraction[]> = {
  // === 中国城市 ===
  '北京': [
    { name: '故宫博物院', lat: 39.9163, lng: 116.3972, rating: 4.8, duration: 4, category: '历史', description: '世界最大的宫殿建筑群，明清两代皇家宫殿，珍藏无数国宝文物' },
    { name: '八达岭长城', lat: 40.3597, lng: 116.0205, rating: 4.7, duration: 5, category: '历史', description: '万里长城最精华段，雄伟壮观，不到长城非好汉' },
    { name: '天坛公园', lat: 39.8822, lng: 116.4066, rating: 4.6, duration: 2.5, category: '历史', description: '明清皇帝祭天场所，祈年殿是中国古建筑瑰宝' },
    { name: '颐和园', lat: 39.9999, lng: 116.2755, rating: 4.7, duration: 3.5, category: '公园', description: '中国现存最大的皇家园林，昆明湖与万寿山相映成趣' },
    { name: '南锣鼓巷', lat: 39.9380, lng: 116.4038, rating: 4.4, duration: 2, category: '街区', description: '北京最古老的胡同街区，文艺小店与老北京风情并存' },
    { name: '798艺术区', lat: 39.9842, lng: 116.4951, rating: 4.3, duration: 3, category: '文化', description: '由旧工厂改造的当代艺术区，画廊和创意空间聚集' },
    { name: '天安门广场', lat: 39.9054, lng: 116.3976, rating: 4.5, duration: 1.5, category: '历史', description: '世界上最大的城市广场，国家象征，可观看升降旗仪式' },
    { name: '北海公园', lat: 39.9245, lng: 116.3893, rating: 4.5, duration: 2, category: '公园', description: '中国现存最古老的皇家园林，白塔是标志性建筑' },
    { name: '鸟巢/水立方', lat: 39.9920, lng: 116.3906, rating: 4.3, duration: 2, category: '建筑', description: '2008年奥运主场馆，建筑奇观，夜景尤为壮观' },
    { name: '雍和宫', lat: 39.9474, lng: 116.4175, rating: 4.5, duration: 2, category: '寺庙', description: '北京最大的藏传佛教寺院，香火旺盛，建筑精美' },
  ],
  '上海': [
    { name: '外滩', lat: 31.2400, lng: 121.4904, rating: 4.7, duration: 2, category: '街区', description: '黄浦江畔的万国建筑博览群，隔江眺望陆家嘴天际线' },
    { name: '迪士尼乐园', lat: 31.1433, lng: 121.6605, rating: 4.7, duration: 8, category: '主题乐园', description: '中国大陆首座迪士尼乐园，奇幻童话城堡不可错过' },
    { name: '东方明珠塔', lat: 31.2397, lng: 121.4998, rating: 4.4, duration: 2, category: '观景', description: '上海地标，可360度俯瞰浦江两岸城市风光' },
    { name: '豫园', lat: 31.2272, lng: 121.4924, rating: 4.5, duration: 2, category: '园林', description: '明代江南私家园林，九曲桥和湖心亭是经典景致' },
    { name: '南京路步行街', lat: 31.2355, lng: 121.4763, rating: 4.3, duration: 2, category: '购物', description: '中华第一商业街，老字号与时尚品牌云集' },
    { name: '田子坊', lat: 31.2080, lng: 121.4690, rating: 4.3, duration: 2, category: '街区', description: '石库门里弄改造的创意街区，小资情调满满' },
    { name: '上海科技馆', lat: 31.2205, lng: 121.5397, rating: 4.5, duration: 4, category: '博物馆', description: '超大型科普场馆，互动体验丰富，亲子游首选' },
    { name: '朱家角古镇', lat: 31.1075, lng: 121.0570, rating: 4.3, duration: 4, category: '古镇', description: '上海保存最完整的水乡古镇，小桥流水人家' },
  ],
  '三亚': [
    { name: '亚龙湾', lat: 18.2235, lng: 109.6401, rating: 4.7, duration: 4, category: '海滩', description: '天下第一湾，沙质细白海水清澈，是三亚最美的海湾' },
    { name: '蜈支洲岛', lat: 18.3085, lng: 109.7648, rating: 4.6, duration: 6, category: '海岛', description: '潜水天堂，海水透明度极高，可体验丰富水上项目' },
    { name: '南山文化旅游区', lat: 18.3035, lng: 109.2080, rating: 4.5, duration: 4, category: '文化', description: '108米海上观音圣像巍峨壮观，佛教文化圣地' },
    { name: '天涯海角', lat: 18.2542, lng: 109.3461, rating: 4.2, duration: 3, category: '自然', description: '三亚标志性景点，天涯石和海角石是情侣打卡圣地' },
    { name: '呀诺达雨林', lat: 18.4520, lng: 109.6440, rating: 4.4, duration: 5, category: '自然', description: '热带雨林景区，可体验踏瀑戏水和高空滑索' },
    { name: '三亚湾椰梦长廊', lat: 18.2540, lng: 109.4840, rating: 4.3, duration: 2, category: '自然', description: '20公里滨海椰林大道，日落时分景色绝美' },
  ],
  '成都': [
    { name: '大熊猫繁育研究基地', lat: 30.7335, lng: 104.1450, rating: 4.8, duration: 3.5, category: '自然', description: '近距离观察国宝大熊猫，尤其推荐早上去看熊猫进食' },
    { name: '宽窄巷子', lat: 30.6667, lng: 104.0547, rating: 4.5, duration: 2, category: '街区', description: '成都最具代表性的历史文化街区，喝茶掏耳朵感受慢生活' },
    { name: '武侯祠', lat: 30.6480, lng: 104.0474, rating: 4.5, duration: 2, category: '历史', description: '三国文化圣地，纪念诸葛亮的祠堂，锦里古街紧邻其侧' },
    { name: '都江堰', lat: 30.9980, lng: 103.6130, rating: 4.6, duration: 4, category: '历史', description: '两千多年前的水利工程奇迹，至今仍在发挥作用' },
    { name: '锦里古街', lat: 30.6482, lng: 104.0488, rating: 4.3, duration: 1.5, category: '街区', description: '西蜀历史上最古老的商业街，美食小吃和手工艺品琳琅满目' },
    { name: '青城山', lat: 30.8985, lng: 103.5712, rating: 4.5, duration: 5, category: '自然', description: '道教发源地，青城天下幽，前山问道后山观景' },
    { name: '春熙路', lat: 30.6570, lng: 104.0830, rating: 4.3, duration: 2, category: '购物', description: '成都最繁华的商业中心，IFS爬楼大熊猫是网红打卡点' },
  ],
  '西安': [
    { name: '秦始皇兵马俑', lat: 34.3850, lng: 109.2730, rating: 4.9, duration: 4, category: '历史', description: '世界第八大奇迹，数千陶俑陶马气势恢宏震撼世界' },
    { name: '大雁塔', lat: 34.2194, lng: 108.9594, rating: 4.6, duration: 2, category: '历史', description: '唐代玄奘译经之地，西安城市名片，北广场音乐喷泉壮观' },
    { name: '西安城墙', lat: 34.2598, lng: 108.9442, rating: 4.6, duration: 3, category: '历史', description: '中国现存最完整的古代城垣，可骑车环游感受古城风貌' },
    { name: '回民街', lat: 34.2622, lng: 108.9435, rating: 4.4, duration: 2, category: '美食', description: '西安美食集中地，羊肉泡馍肉夹馍凉皮等小吃应有尽有' },
    { name: '华清宫', lat: 34.3647, lng: 109.2072, rating: 4.4, duration: 3, category: '历史', description: '唐代皇家温泉行宫，杨贵妃沐浴之地，长恨歌实景演出' },
    { name: '大唐不夜城', lat: 34.2145, lng: 108.9655, rating: 4.5, duration: 2.5, category: '街区', description: '再现盛唐风华的步行街，不倒翁小姐姐火遍全网' },
    { name: '陕西历史博物馆', lat: 34.2150, lng: 108.9508, rating: 4.7, duration: 3, category: '博物馆', description: '古都明珠华夏宝库，周秦汉唐文物珍藏丰富' },
  ],
  '杭州': [
    { name: '西湖', lat: 30.2427, lng: 120.1473, rating: 4.8, duration: 5, category: '自然', description: '人间天堂，断桥残雪雷峰夕照苏堤春晓等十景闻名天下' },
    { name: '灵隐寺', lat: 30.2439, lng: 120.0978, rating: 4.6, duration: 2.5, category: '寺庙', description: '江南禅宗名刹，飞来峰石刻造像群是珍贵文化遗产' },
    { name: '西溪湿地', lat: 30.2690, lng: 120.0650, rating: 4.4, duration: 4, category: '自然', description: '城市中的天然湿地，可乘摇橹船穿梭芦苇荡' },
    { name: '宋城', lat: 30.1697, lng: 120.0930, rating: 4.3, duration: 4, category: '主题乐园', description: '宋文化主题公园，宋城千古情演出震撼人心' },
    { name: '龙井村', lat: 30.2212, lng: 120.1168, rating: 4.3, duration: 2, category: '自然', description: '西湖龙井茶原产地，茶园叠翠可体验采茶品茗' },
    { name: '河坊街', lat: 30.2410, lng: 120.1690, rating: 4.2, duration: 1.5, category: '街区', description: '杭州历史文化街区，老字号店铺和特色小吃云集' },
    { name: '雷峰塔', lat: 30.2337, lng: 120.1477, rating: 4.4, duration: 1.5, category: '历史', description: '白蛇传传说发生地，登塔可俯瞰西湖全景' },
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
