import { useState, useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import ServiceCard from "./components/ServiceCard";
import type { Service, Banner as BannerType } from "./types";
import { fetchStatus, fetchServiceHistory } from "./api-client";

export default function App() {
	const [darkMode, setDarkMode] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("darkMode");
			return saved
				? JSON.parse(saved)
				: window.matchMedia("(prefers-color-scheme: dark)").matches;
		}
		return false;
	});

	const [services, setServices] = useState<Service[]>([]);
	const [banner, setBanner] = useState<BannerType | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		localStorage.setItem("darkMode", JSON.stringify(darkMode));
	}, [darkMode]);

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);
				setError(null);

				const statusData = await fetchStatus();

				// Fetch history for each service
				const servicesWithHistory = await Promise.all(
					statusData.services.map(async (service) => {
						try {
							const historyData = await fetchServiceHistory(service.id);
							return {
								...service,
								history: historyData.history,
							};
						} catch (err) {
							console.error(`Failed to fetch history for ${service.id}:`, err);
							return {
								...service,
								history: [],
							};
						}
					})
				);

				setServices(servicesWithHistory);
				setBanner(
					statusData.banner
						? {
								type: "warning",
								title: statusData.banner.title,
								message: statusData.banner.description,
							}
						: null
				);
				setLastUpdated(statusData.lastUpdated);
			} catch (err) {
				console.error("Failed to fetch status:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load status data"
				);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, []);

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	const dismissBanner = () => {
		setBanner(null);
	};

	const allOperational = services.every((s) => s.status === "operational");

	return (
		<div className="min-h-screen bg-background">
			<Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{banner && <Banner banner={banner} onDismiss={dismissBanner} />}

				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div
							className={`w-3 h-3 rounded-full ${allOperational ? "bg-green-500" : "bg-yellow-500"} animate-pulse`}
						/>
						<h2 className="text-2xl font-bold text-foreground">
							{allOperational
								? "All Systems Operational"
								: "Some Systems Experiencing Issues"}
						</h2>
					</div>
					<p className="text-foreground/60">
						Last updated:{" "}
						{lastUpdated
							? new Date(lastUpdated).toLocaleString()
							: "Loading..."}
					</p>
				</div>

				{loading && services.length === 0 ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
						<p className="mt-4 text-foreground/60">Loading status data...</p>
					</div>
				) : error ? (
					<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
						<p className="text-red-600 dark:text-red-400 font-semibold mb-2">
							Failed to load status
						</p>
						<p className="text-foreground/60 text-sm">{error}</p>
					</div>
				) : (
					<div className="space-y-6">
						{services.map((service) => (
							<ServiceCard key={service.name} service={service} />
						))}
					</div>
				)}

				<footer className="mt-12 pt-8 border-t border-border text-center text-sm text-foreground/60">
					<p>
						Powered by{" "}
						<a
							href="https://workers.cloudflare.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline"
						>
							Cloudflare Workers
						</a>
					</p>
				</footer>
			</main>
		</div>
	);
}
