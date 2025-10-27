import { env } from 'cloudflare:workers';

/*
 * Writes healthcheck data to Analytics Engine.
 * 
 * Data structure written:
 * - blob1: service name
 * - double1: status (1 = up, 0 = down)
 * - double2: latency (ms)
 * - double3: statusCode
 */
export function writeHealthcheck(service: ServiceConfig, status: HealthCheckResult) {
  env.ANALYTICS.writeDataPoint({
    indexes: [service.id],
    blobs: [
      service.name,
    ],
    doubles: [
      status.status === 'up' ? 1 : 0,
      status.latency,
      status.statusCode ?? 0,
    ],
  });
}

/**
 * Determines service status based on uptime percentage
 */
function getStatusFromUptime(uptime: number): ServiceStatus {
  if (uptime >= 99.9) return 'operational';
  if (uptime >= 95) return 'degraded';
  if (uptime >= 90) return 'partial-outage';
  return 'major-outage';
}

async function queryAnalyticsEngine<T = unknown>(sql: string): Promise<T[]> {
  // Check if we have the necessary credentials
  if (!env.ACCOUNT_ID || !env.API_TOKEN) {
    console.error('Analytics Engine SQL API credentials not configured.');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.API_TOKEN}`,
        },
        body: sql,
      }
    );

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status} ${response.statusText}\n${await response.text()}`);
    }

    const body = await response.text();
    const result: T[] = [];

    for (const line of body.split('\n')) {
      if (line.trim() === '') continue;

      result.push(JSON.parse(line));
    }

    return result;
  } catch (error) {
    console.error('Error querying Analytics Engine:', error);
    return [];
  }
}

/**
 * Queries Analytics Engine for service data within a time range
 */
async function getUptimeLatency(
  serviceId: string,
  daysAgo: number,
): Promise<{ uptime: number; avgLatency: number }> {
  if (!env.CONFIG.services.find((service) => service.id == serviceId)) {
    throw new Error(`Service ${serviceId} not found`);
  }

  const result = await queryAnalyticsEngine<{
    uptime: number,
    avgLatency: number,
  }>(`
    SELECT
      ((SUM(_sample_interval) - sumIf(_sample_interval, double1 = 0)) / SUM(_sample_interval)) * 100 as uptime,
      avg(double2) as avgLatency
    FROM workers_status_page
    WHERE
      index1 = '${serviceId}'
      AND timestamp >= now() - INTERVAL '${daysAgo}' DAY
    FORMAT JSONEachRow
  `);

  if (result.length === 0) {
    return { uptime: 100, avgLatency: 0 };
  }
  return result[0];
}

/**
 * Gets the current status for all services
 */
export async function getServicesStatus(): Promise<ServiceStatusResponse[]> {
  const services = env.CONFIG.services;
  const statusPromises = services.map(async (service) => {
    const [data24h, data7d, data30d] = await Promise.all([
      getUptimeLatency(service.id, 1),
      getUptimeLatency(service.id, 7),
      getUptimeLatency(service.id, 30),
    ]);

    // Use 24h data for current status
    const status = getStatusFromUptime(data24h.uptime);

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      link: service.link,
      status,
      currentLatency: data24h.avgLatency > 0 ? Math.round(data24h.avgLatency) : undefined,
      uptime24h: Math.round(data24h.uptime * 100) / 100,
      uptime7d: Math.round(data7d.uptime * 100) / 100,
      uptime30d: Math.round(data30d.uptime * 100) / 100,
    };
  });

  return Promise.all(statusPromises);
}

/**
 * Gets historical status data for a specific service (last 90 days)
 */
export async function getServiceHistory(serviceId: string): Promise<DayStatusResponse[]> {
  const result = await queryAnalyticsEngine<{
    date: string;
    uptime: number;
    avgLatency: number;
  }>(`
    SELECT
      formatDateTime(timestamp, '%Y-%m-%d') as date,
      ((SUM(_sample_interval) - sumIf(_sample_interval, double1 = 0)) / SUM(_sample_interval)) * 100 as uptime,
      avg(double2) as avgLatency
    FROM workers_status_page
    WHERE
      index1 = '${serviceId}'
      AND timestamp >= now() - INTERVAL '90' DAY
    GROUP BY date
    FORMAT JSONEachRow
  `);

  const history = result.map((row) => ({
    date: row.date,
    uptime: Math.round(row.uptime * 100) / 100,
    avgLatency: Math.round(row.avgLatency * 100) / 100,
    status: getStatusFromUptime(row.uptime),
  })).reverse();

  // If history is not the full 90 days, pad the data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const endDate = new Date();

  const missingDates = [];
  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    if (!history.some((entry) => entry.date === date.toISOString().split('T')[0])) {
      missingDates.push(date.toISOString().split('T')[0]);
    }
  }

  return [...missingDates.map((date) => ({
    date,
    uptime: 100,
    avgLatency: 0,
    status: 'unknown' as ServiceStatus,
  })), ...history];
}
