import { Activity } from "lucide-react";
import type { Service } from "../types";
import StatusBadge from "./StatusBadge";
import HistoryChart from "./HistoryChart";

interface ServiceCardProps {
	service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
	return (
		<div className="border border-border rounded-lg p-6 bg-background hover:shadow-lg transition-shadow">
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-foreground mb-1">
						{service.link ? (
							<a
								href={service.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 underline"
							>
								{service.name}
							</a>
						) : (
							service.name
						)}
					</h3>
					<p className="text-sm text-foreground/60">{service.description}</p>
				</div>
				<StatusBadge status={service.status} />
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-foreground/5 rounded-lg p-3">
					<div className="flex items-center gap-2 text-foreground/60 text-xs mb-1">
						<Activity className="w-4 h-4" />
						<span>24h Uptime</span>
					</div>
					<div className="text-2xl font-bold text-foreground">
						{service.uptime24h.toFixed(2)}%
					</div>
				</div>
				<div className="bg-foreground/5 rounded-lg p-3">
					<div className="text-foreground/60 text-xs mb-1">7d Uptime</div>
					<div className="text-2xl font-bold text-foreground">
						{service.uptime7d.toFixed(2)}%
					</div>
				</div>
				<div className="bg-foreground/5 rounded-lg p-3">
					<div className="text-foreground/60 text-xs mb-1">30d Uptime</div>
					<div className="text-2xl font-bold text-foreground">
						{service.uptime30d.toFixed(2)}%
					</div>
				</div>
				{service.currentLatency !== undefined && (
					<div className="bg-foreground/5 rounded-lg p-3">
						<div className="text-foreground/60 text-xs mb-1">
							Current Latency
						</div>
						<div className="text-2xl font-bold text-foreground">
							{service.currentLatency}ms
						</div>
					</div>
				)}
			</div>

			{service.history.length > 0 && <HistoryChart history={service.history} />}
		</div>
	);
}
