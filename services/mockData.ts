
import { EnergyDataPoint, SensorStatus, DashboardState } from '../types';

export const generateMockHistory = (points: number = 24): EnergyDataPoint[] => {
  const history: EnergyDataPoint[] = [];
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const usageBase = Math.sin((time.getHours() / 24) * Math.PI * 2) * 5 + 10;
    const solarBase = time.getHours() > 6 && time.getHours() < 18 
      ? Math.sin(((time.getHours() - 6) / 12) * Math.PI) * 12 
      : 0;

    history.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usage: parseFloat((usageBase + Math.random() * 2).toFixed(2)),
      solar: parseFloat((solarBase + Math.random() * 1).toFixed(2)),
      battery: Math.floor(Math.random() * 40 + 40),
      cost: parseFloat((usageBase * 0.15).toFixed(2))
    });
  }
  return history;
};

export const generateMockSensors = (): SensorStatus[] => [
  { id: 'iot-001', name: 'HVAC Main', status: 'online', lastPing: '2m ago', load: 65 },
  { id: 'iot-002', name: 'Server Rack A', status: 'online', lastPing: '1m ago', load: 88 },
  { id: 'iot-003', name: 'Lighting Grid', status: 'degraded', lastPing: '5m ago', load: 12 },
  { id: 'iot-004', name: 'Solar Inverter', status: 'online', lastPing: 'just now', load: 45 },
  { id: 'iot-005', name: 'EV Charging', status: 'offline', lastPing: '1h ago', load: 0 },
];

export const getInitialState = (): DashboardState => {
  const history = generateMockHistory();
  const last = history[history.length - 1];
  return {
    currentPower: last.usage,
    peakToday: Math.max(...history.map(h => h.usage)),
    totalConsumption: history.reduce((acc, h) => acc + h.usage, 0),
    efficiencyScore: 84,
    carbonSaved: 124.5,
    sensors: generateMockSensors(),
    history
  };
};
