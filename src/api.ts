import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getServicesStatus, getServiceHistory } from './analytics';

const api = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
api.use('/*', cors());

/**
 * GET /api/status
 * Returns current status for all services
 */
api.get('/status', async (ctx) => {
  try {
    const services = await getServicesStatus();
    
    const response: StatusPageResponse = {
      banner: ctx.env.CONFIG.banner,
      services,
      lastUpdated: new Date().toISOString(),
    };

    return ctx.json(response);
  } catch (error) {
    console.error('Error fetching status:', error);
    return ctx.json({ error: 'Failed to fetch status' }, 500);
  }
});

/**
 * GET /api/service/:name/history
 * Returns historical data for a specific service
 */
api.get('/service/:name/history', async (c) => {
  const serviceName = c.req.param('name');

  try {
    const history = await getServiceHistory(serviceName);
    return c.json({ serviceName, history });
  } catch (error) {
    console.error(`Error fetching history for ${serviceName}:`, error);
    return c.json({ error: 'Failed to fetch service history' }, 500);
  }
});

export default api;
