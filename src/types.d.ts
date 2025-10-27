interface Config {
	banner: Banner | null;
	services: ServiceConfig[];
}

interface Banner {
	title: string;
	description: string;
}

interface ServiceConfig {
	id: string;
	name: string;
	description: string;
	link: string;
	healthcheck?: {
		url?: string;
		method?: string;
		timeout?: number;
		headers?: Record<string, string>;
	};
}

interface HealthCheckResult {
	serviceName: string;
	url: string;
	status: "up" | "down";
	latency: number;
	statusCode?: number;
	timestamp: number;
}

type ServiceStatus =
	| "unknown"
	| "operational"
	| "degraded"
	| "partial-outage"
	| "major-outage";

interface ServiceStatusResponse {
	name: string;
	description: string;
	link: string;
	status: ServiceStatus;
	currentLatency?: number;
	uptime24h: number;
	uptime7d: number;
	uptime30d: number;
}

interface DayStatusResponse {
	date: string;
	status: ServiceStatus;
	uptime: number;
	avgLatency?: number;
}

interface StatusPageResponse {
	banner: Banner | null;
	services: ServiceStatusResponse[];
	lastUpdated: string;
}

// Override env type
interface Env {
	CONFIG: {
		banner: Banner | null;
		services: ServiceConfig[];
	};
}
