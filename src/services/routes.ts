import type { RouteInfo } from '../types.js';

// 已缓存的城市内路线
const routeCache: Record<string, RouteInfo> = {};

function generatePath(from: [number, number], to: [number, number]): [number, number][] {
  const steps = 10;
  const path: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 加一点随机偏移模拟真实路线
    const jitter = i > 0 && i < steps ? (Math.random() - 0.5) * 0.003 : 0;
    path.push([
      from[0] + (to[0] - from[0]) * t + jitter,
      from[1] + (to[1] - from[1]) * t + jitter,
    ]);
  }
  return path;
}

export function getRoute(fromName: string, fromLat: number, fromLng: number,
                         toName: string, toLat: number, toLng: number): RouteInfo {
  const cacheKey = `${fromLat},${fromLng}->${toLat},${toLng}`;
  if (routeCache[cacheKey]) return routeCache[cacheKey];

  // 计算直线距离（km）
  const R = 6371;
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const route: RouteInfo = {
    from: fromName,
    to: toName,
    modes: [
      { type: '步行', duration: Math.round(distance / 5 * 60), price: 0 },
      { type: '公交/地铁', duration: Math.round(distance / 30 * 60 + 10), price: 10 },
      { type: '出租车', duration: Math.round(distance / 40 * 60 + 5), price: Math.round(distance * 8 + 30) },
    ],
    path: generatePath([fromLat, fromLng], [toLat, toLng]),
    distance: Math.round(distance * 10) / 10,
  };

  routeCache[cacheKey] = route;
  return route;
}
