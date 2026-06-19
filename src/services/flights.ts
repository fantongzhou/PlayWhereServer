import type { Flight } from '../types.js';

const flightsDB: Record<string, Flight[]> = {
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
