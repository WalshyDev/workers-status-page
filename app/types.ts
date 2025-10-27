export type ServiceStatus = 'unknown' | 'operational' | 'degraded' | 'partial-outage' | 'major-outage';

export interface DayStatus {
  date: string;
  status: ServiceStatus;
  uptime: number;
  avgLatency?: number;
}

export interface Service {
  name: string;
  description: string;
  link: string;
  status: ServiceStatus;
  currentLatency?: number;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  history: DayStatus[];
}

export interface Banner {
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
