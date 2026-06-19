import { Router, type Request, type Response } from 'express';
import { getRoute } from '../services/routes.js';

const router = Router();

interface Waypoint {
  name: string;
  lat: number;
  lng: number;
}

// POST /api/routes — 接受一组点位，返回相邻点之间的最短时间路线
router.post('/', (req: Request, res: Response) => {
  const { waypoints } = req.body as { waypoints: Waypoint[] };

  if (!waypoints || waypoints.length < 2) {
    res.status(400).json({ error: '至少需要 2 个点位' });
    return;
  }

  const segments = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const route = getRoute(from.name, from.lat, from.lng, to.name, to.lat, to.lng);

    // 选择最短时间的交通方式
    const fastest = route.modes.reduce((best, mode) =>
      mode.duration < best.duration ? mode : best
    );

    segments.push({
      from: { name: from.name, lat: from.lat, lng: from.lng },
      to: { name: to.name, lat: to.lat, lng: to.lng },
      path: route.path,
      distance: route.distance,
      mode: fastest.type,
      duration: fastest.duration,
      price: fastest.price,
    });
  }

  res.json({ segments });
});

export default router;
