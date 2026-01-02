
export interface EnergyDataPoint {
  time: string;
  usage: number;
  solar: number;
  battery: number;
  cost: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface DashboardInsights {
  status: string;
  insight: string;
  prediction: string;
  solarForecast: string;
  alert: string;
  action: string;
  impact: string;
  narrative?: string;
}

export interface SensorStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastPing: string;
  load: number;
}

export interface DashboardState {
  currentPower: number;
  peakToday: number;
  totalConsumption: number;
  efficiencyScore: number;
  carbonSaved: number;
  sensors: SensorStatus[];
  history: EnergyDataPoint[];
}
