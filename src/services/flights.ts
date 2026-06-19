import type { Flight } from '../types.js';

const flightsDB: Record<string, Flight[]> = {
  // === 中国国内航线 ===
  '北京-上海': [
    { flightNo: 'MU5101', departure: '北京首都', arrival: '上海虹桥', departureTime: '07:00', arrivalTime: '09:15', price: 800 },
    { flightNo: 'CA1501', departure: '北京首都', arrival: '上海虹桥', departureTime: '08:30', arrivalTime: '10:45', price: 950 },
    { flightNo: 'CZ8889', departure: '北京大兴', arrival: '上海浦东', departureTime: '10:00', arrivalTime: '12:10', price: 650 },
    { flightNo: 'HU7605', departure: '北京首都', arrival: '上海虹桥', departureTime: '14:00', arrivalTime: '16:15', price: 550 },
    { flightNo: 'MU5125', departure: '北京大兴', arrival: '上海虹桥', departureTime: '18:00', arrivalTime: '20:15', price: 480 },
  ],
  '北京-三亚': [
    { flightNo: 'CA1377', departure: '北京首都', arrival: '三亚凤凰', departureTime: '07:30', arrivalTime: '11:30', price: 1500 },
    { flightNo: 'CZ6716', departure: '北京大兴', arrival: '三亚凤凰', departureTime: '09:00', arrivalTime: '13:00', price: 1200 },
    { flightNo: 'HU7079', departure: '北京首都', arrival: '三亚凤凰', departureTime: '12:00', arrivalTime: '16:00', price: 980 },
    { flightNo: 'MU2727', departure: '北京大兴', arrival: '三亚凤凰', departureTime: '16:00', arrivalTime: '20:00', price: 850 },
  ],
  '北京-成都': [
    { flightNo: '3U8882', departure: '北京首都', arrival: '成都双流', departureTime: '07:00', arrivalTime: '10:00', price: 900 },
    { flightNo: 'CA4101', departure: '北京首都', arrival: '成都天府', departureTime: '08:30', arrivalTime: '11:30', price: 1050 },
    { flightNo: 'CZ6183', departure: '北京大兴', arrival: '成都双流', departureTime: '13:00', arrivalTime: '16:00', price: 680 },
    { flightNo: 'MU5841', departure: '北京大兴', arrival: '成都天府', departureTime: '17:00', arrivalTime: '20:00', price: 550 },
  ],
  '北京-西安': [
    { flightNo: 'MU2101', departure: '北京首都', arrival: '西安咸阳', departureTime: '07:00', arrivalTime: '09:00', price: 600 },
    { flightNo: 'CA1201', departure: '北京首都', arrival: '西安咸阳', departureTime: '09:00', arrivalTime: '11:00', price: 750 },
    { flightNo: 'CZ6940', departure: '北京大兴', arrival: '西安咸阳', departureTime: '14:00', arrivalTime: '16:00', price: 450 },
  ],
  '北京-杭州': [
    { flightNo: 'CA1701', departure: '北京首都', arrival: '杭州萧山', departureTime: '07:00', arrivalTime: '09:00', price: 700 },
    { flightNo: 'MU5131', departure: '北京大兴', arrival: '杭州萧山', departureTime: '10:00', arrivalTime: '12:00', price: 550 },
    { flightNo: 'CZ8855', departure: '北京首都', arrival: '杭州萧山', departureTime: '15:00', arrivalTime: '17:00', price: 480 },
  ],
  '上海-三亚': [
    { flightNo: 'MU5377', departure: '上海虹桥', arrival: '三亚凤凰', departureTime: '08:00', arrivalTime: '11:00', price: 1100 },
    { flightNo: 'CZ6754', departure: '上海浦东', arrival: '三亚凤凰', departureTime: '10:00', arrivalTime: '13:00', price: 850 },
    { flightNo: 'HO1127', departure: '上海虹桥', arrival: '三亚凤凰', departureTime: '15:00', arrivalTime: '18:00', price: 650 },
  ],
  '上海-成都': [
    { flightNo: '3U8962', departure: '上海浦东', arrival: '成都双流', departureTime: '07:00', arrivalTime: '10:10', price: 900 },
    { flightNo: 'CA4501', departure: '上海虹桥', arrival: '成都天府', departureTime: '09:00', arrivalTime: '12:00', price: 1050 },
    { flightNo: 'MU5409', departure: '上海浦东', arrival: '成都双流', departureTime: '14:00', arrivalTime: '17:10', price: 720 },
  ],
  '上海-西安': [
    { flightNo: 'MU2155', departure: '上海虹桥', arrival: '西安咸阳', departureTime: '08:00', arrivalTime: '10:30', price: 650 },
    { flightNo: 'CA1215', departure: '上海浦东', arrival: '西安咸阳', departureTime: '13:00', arrivalTime: '15:30', price: 550 },
  ],
  // === 日本航线（保留兼容） ===
  '上海-京都': [
    { flightNo: 'MU525', departure: '上海浦东', arrival: '大阪关西', departureTime: '08:30', arrivalTime: '11:30', price: 1800 },
    { flightNo: 'CA921', departure: '上海浦东', arrival: '大阪关西', departureTime: '09:15', arrivalTime: '12:15', price: 2100 },
    { flightNo: 'FM813', departure: '上海浦东', arrival: '大阪关西', departureTime: '13:40', arrivalTime: '16:40', price: 1500 },
    { flightNo: '9C8559', departure: '上海浦东', arrival: '大阪关西', departureTime: '07:00', arrivalTime: '10:00', price: 900 },
  ],
  '北京-京都': [
    { flightNo: 'CA927', departure: '北京首都', arrival: '大阪关西', departureTime: '09:00', arrivalTime: '13:00', price: 2200 },
    { flightNo: 'NH980', departure: '北京首都', arrival: '大阪关西', departureTime: '14:00', arrivalTime: '18:00', price: 2500 },
  ],
  '上海-东京': [
    { flightNo: 'MU523', departure: '上海浦东', arrival: '东京成田', departureTime: '09:00', arrivalTime: '12:30', price: 2000 },
    { flightNo: 'CA929', departure: '上海浦东', arrival: '东京羽田', departureTime: '10:00', arrivalTime: '14:00', price: 2300 },
    { flightNo: 'FM815', departure: '上海浦东', arrival: '东京成田', departureTime: '08:15', arrivalTime: '12:00', price: 1700 },
    { flightNo: '9C8517', departure: '上海浦东', arrival: '东京成田', departureTime: '06:50', arrivalTime: '10:30', price: 850 },
  ],
  '北京-东京': [
    { flightNo: 'CA925', departure: '北京首都', arrival: '东京成田', departureTime: '09:30', arrivalTime: '14:00', price: 2400 },
    { flightNo: 'NH964', departure: '北京首都', arrival: '东京羽田', departureTime: '15:00', arrivalTime: '19:30', price: 2700 },
  ],
};

export function searchFlights(origin: string, destination: string): Flight[] {
  const key = `${origin}-${destination}`;
  const keyReverse = `${destination}-${origin}`;
  return flightsDB[key] || flightsDB[keyReverse] || [];
}
