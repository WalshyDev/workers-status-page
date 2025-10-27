import type { DayStatus, ServiceStatus } from "../types";

interface HistoryChartProps {
	history: DayStatus[];
}

export default function HistoryChart({ history }: HistoryChartProps) {
	const getStatusColor = (status: ServiceStatus) => {
		switch (status) {
			case "operational":
				return "bg-green-500 dark:bg-green-600";
			case "degraded":
				return "bg-yellow-500 dark:bg-yellow-600";
			case "partial-outage":
				return "bg-orange-500 dark:bg-orange-600";
			case "major-outage":
				return "bg-red-500 dark:bg-red-600";
			default:
				return "bg-gray-300 dark:bg-gray-600";
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-xs text-foreground/60">
				<span>90 days ago</span>
				<span>Today</span>
			</div>
			<div className="flex gap-1">
				{history.map((day, index) => (
					<div key={index} className="group relative flex-1">
						<div
							className={`h-10 rounded ${getStatusColor(day.status)} transition-all hover:opacity-80 cursor-pointer`}
							title={`${day.date}: ${day.status} - ${day.uptime}% uptime${day.avgLatency ? ` - ${day.avgLatency}ms avg` : ""}`}
						/>
						<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
							<div className="font-semibold">{day.date}</div>
							{day.status === "unknown" ? (
								<div>No data</div>
							) : (
								<>
									<div>{day.uptime}% uptime</div>
									{day.avgLatency && day.avgLatency > 0 && (
										<div>{day.avgLatency}ms avg</div>
									)}
								</>
							)}
						</div>
					</div>
				))}
			</div>
			<div className="flex items-center gap-4 text-xs text-foreground/60">
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 rounded bg-green-500 dark:bg-green-600" />
					<span>Operational</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 rounded bg-yellow-500 dark:bg-yellow-600" />
					<span>Degraded</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 rounded bg-orange-500 dark:bg-orange-600" />
					<span>Partial Outage</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-3 h-3 rounded bg-red-500 dark:bg-red-600" />
					<span>Major Outage</span>
				</div>
			</div>
		</div>
	);
}
