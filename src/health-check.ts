import { env } from "cloudflare:workers";
import { writeHealthcheck } from "./analytics";

/**
 * Performs a health check on a single service endpoint
 */
export async function checkServiceHealth(
	service: ServiceConfig
): Promise<HealthCheckResult> {
	const startTime = Date.now();
	const timestamp = startTime;

	try {
		const headers = new Headers(service?.healthcheck?.headers);
		if (!headers.has("user-agent")) {
			headers.set("user-agent", "Mozilla/5.0 (WorkersStatusPage)");
		}
		// Make sure secrets are inserted if needed
		const regex = new RegExp(`\$(\w+)`);
		for (const [key, value] of headers) {
			if (regex.test(value)) {
				headers.set(
					key,
					// @ts-expect-error - User secrets are unknown here
					value.replace(regex, (_, secretName) => env[secretName] ?? secretName)
				);
			}
		}

		const response = await fetch(service?.healthcheck?.url ?? service.link, {
			method: service?.healthcheck?.method ?? "GET",
			signal: AbortSignal.timeout(service?.healthcheck?.timeout ?? 10000),
			headers,
		});

		const latency = Date.now() - startTime;

		console.log(
			`Checked ${service.id}: ${response.status} returned in ${latency}ms`
		);

		const result: HealthCheckResult = {
			serviceName: service.name,
			url: service.link,
			status: response.ok ? "up" : "down",
			latency,
			statusCode: response.status,
			timestamp,
		};

		writeHealthcheck(service, result);

		return result;
	} catch (error) {
		const latency = Date.now() - startTime;

		const result: HealthCheckResult = {
			serviceName: service.name,
			url: service.link,
			status: "down",
			latency,
			timestamp,
		};

		writeHealthcheck(service, result);

		return result;
	}
}

/**
 * Performs health checks on all configured services
 */
export async function checkAllServices(env: Env): Promise<HealthCheckResult[]> {
	const services = env.CONFIG.services;
	const checks = services.map((service) => checkServiceHealth(service));
	return Promise.all(checks);
}
