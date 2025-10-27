import { Hono } from "hono";
import api from "./api";
import { checkAllServices } from "./health-check";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", api);

export default {
	/**
	 * HTTP request handler
	 */
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		return app.fetch(request, env, ctx);
	},

	/**
	 * Scheduled cron handler - runs health checks on all services
	 */
	async scheduled(_: ScheduledController, env: Env): Promise<void> {
		console.log("Running scheduled health checks...");

		try {
			const results = await checkAllServices(env);

			console.log(
				`Health checks completed: ${results.length} services checked`
			);

			// Log summary
			const upCount = results.filter((r) => r.status === "up").length;
			const downCount = results.filter((r) => r.status === "down").length;
			console.log(`Status: ${upCount} up, ${downCount} down`);
		} catch (error) {
			console.error("Error during scheduled health check:", error);
		}
	},
} satisfies ExportedHandler<Env>;
