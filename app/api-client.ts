export interface StatusPageResponse {
	banner: BannerData | null;
	services: ServiceData[];
	lastUpdated: string;
}

export interface BannerData {
	title: string;
	description: string;
	expires?: string;
}

export interface ServiceData {
	id: string;
	name: string;
	description: string;
	link: string;
	status: "operational" | "degraded" | "partial-outage" | "major-outage";
	currentLatency?: number;
	uptime24h: number;
	uptime7d: number;
	uptime30d: number;
}

export interface ServiceHistoryResponse {
	serviceName: string;
	history: DayStatusData[];
}

export interface DayStatusData {
	date: string;
	status: "operational" | "degraded" | "partial-outage" | "major-outage";
	uptime: number;
	avgLatency?: number;
}

/**
 * Fetches current status for all services
 */
export async function fetchStatus(): Promise<StatusPageResponse> {
	const response = await fetch("/api/status");

	if (!response.ok) {
		throw new Error(`Failed to fetch status: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Fetches historical data for a specific service
 */
export async function fetchServiceHistory(
	serviceName: string
): Promise<ServiceHistoryResponse> {
	const response = await fetch(
		`/api/service/${encodeURIComponent(serviceName)}/history`
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch history for ${serviceName}: ${response.statusText}`
		);
	}

	return response.json();
}
