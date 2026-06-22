// ============================================================
// 共享类型定义
// ============================================================

export interface TripRequest {
  city: string;
  days: number;
  preferences: string[];
  budget: 'budget' | 'moderate' | 'luxury';
}

export interface Attraction {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  duration: number; // 建议游玩时长（小时）
  category: string;
  description: string;
}

export interface Hotel {
  name: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  stars: number;
  description: string;
}

export interface Flight {
  flightNo: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface WeatherInfo {
  date: string;
  temperature: { low: number; high: number };
  condition: string;
  suggestion: string;
}

export interface RouteInfo {
  from: string;
  to: string;
  modes: { type: string; duration: number; price: number }[];
  path: [number, number][];
  distance: number;
}

export interface Restaurant {
  name: string;
  lat: number;
  lng: number;
  avgPrice: number;
  cuisine: string;
  rating: number;
}

// ---- SSE 事件类型 ----
// Lifecycle:  start → (thought | status | action | observation)* → complete | error
export type SSEEventType =
  | 'start'        // 规划开始
  | 'thought'      // LLM 流式推理 token
  | 'status'       // 系统状态/进度提示（如重试、逐天生成）
  | 'action'       // 工具调用
  | 'observation'  // 工具返回
  | 'response'     // 最终自然语言回复
  | 'complete'     // 行程规划完成（含结构化 TripPlan）
  | 'error';       // 错误（来自 route 层 catch）

export interface SSEEvent {
  type: SSEEventType;
  step?: number;
  content?: string;
  tool?: string;
  args?: Record<string, unknown>;
  data?: unknown;
  plan?: TripPlan;
  message?: string;
}

// ---- 结构化行程结果 ----
export interface Activity {
  time: string;
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'restaurant' | 'hotel';
  duration: string;
  note: string;
  /** 购票/预订链接（美团返回） */
  bookingUrl?: string;
  /** 景点图片（美团返回） */
  imageUrls?: string[];
}

export interface DayPlan {
  day: number;
  date: string;
  weather: WeatherInfo | null;
  activities: Activity[];
  hotel: (Hotel & { bookingUrl?: string }) | null;
}

export interface TripPlan {
  city: string;
  days: DayPlan[];
  totalBudget: string;
  tips: string[];
}
