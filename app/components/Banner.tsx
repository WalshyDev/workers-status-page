import { AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import type { Banner as BannerType } from "../types";

interface BannerProps {
	banner: BannerType;
	onDismiss: () => void;
}

export default function Banner({ banner, onDismiss }: BannerProps) {
	const styles = {
		info: {
			bg: "bg-blue-50 dark:bg-blue-950/30",
			border: "border-blue-200 dark:border-blue-800",
			text: "text-blue-900 dark:text-blue-100",
			icon: <Info className="w-5 h-5" />,
		},
		warning: {
			bg: "bg-yellow-50 dark:bg-yellow-950/30",
			border: "border-yellow-200 dark:border-yellow-800",
			text: "text-yellow-900 dark:text-yellow-100",
			icon: <AlertTriangle className="w-5 h-5" />,
		},
		error: {
			bg: "bg-red-50 dark:bg-red-950/30",
			border: "border-red-200 dark:border-red-800",
			text: "text-red-900 dark:text-red-100",
			icon: <AlertCircle className="w-5 h-5" />,
		},
	};

	const style = styles[banner.type];

	return (
		<div
			className={`${style.bg} ${style.border} ${style.text} border rounded-lg p-4 mb-6`}
		>
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0 mt-0.5">{style.icon}</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm mb-1">{banner.title}</h3>
					<p className="text-sm opacity-90">{banner.message}</p>
				</div>
				<button
					onClick={onDismiss}
					className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
					aria-label="Dismiss banner"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
