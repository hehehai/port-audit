import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ProcessDetail } from "./components/ProcessDetail";
import { ProcessList } from "./components/ProcessList";
import { StatusBar } from "./components/StatusBar";
import { useKillProcess } from "./hooks/useKillProcess";
import { useProcesses } from "./hooks/useProcesses";
import { theme } from "./theme";

export function App() {
	const { processes, loading, refresh } = useProcesses();
	const { killing, lastResult, kill, clearResult } = useKillProcess();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [statusMessage, setStatusMessage] = useState<string | undefined>();
	const [searchMode, setSearchMode] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredProcesses = useMemo(() => {
		if (!searchQuery) return processes;
		const q = searchQuery.toLowerCase();
		return processes.filter(
			(p) =>
				p.port.toString().includes(q) || p.command.toLowerCase().includes(q),
		);
	}, [processes, searchQuery]);

	const selectedProcess = filteredProcesses[selectedIndex] ?? null;

	useEffect(() => {
		if (
			selectedIndex >= filteredProcesses.length &&
			filteredProcesses.length > 0
		) {
			setSelectedIndex(filteredProcesses.length - 1);
		}
	}, [filteredProcesses.length, selectedIndex]);

	useEffect(() => {
		if (lastResult) {
			if (lastResult.success) {
				setStatusMessage(`Killed PID ${lastResult.pid}`);
			} else {
				setStatusMessage(`Failed: ${lastResult.error}`);
			}
			const timer = setTimeout(() => {
				setStatusMessage(undefined);
				clearResult();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [lastResult, clearResult]);

	useKeyboard((key) => {
		if (searchMode) {
			if (key.name === "escape") {
				setSearchMode(false);
				setSearchQuery("");
				setSelectedIndex(0);
			}
			if (key.name === "up") {
				setSelectedIndex((prev) => Math.max(0, prev - 1));
			}
			if (key.name === "down") {
				setSelectedIndex((prev) =>
					Math.min(filteredProcesses.length - 1, prev + 1),
				);
			}
			return;
		}

		if (key.name === "escape" || key.name === "q") {
			globalThis.__cleanup?.();
		}

		if (key.name === "/") {
			setSearchMode(true);
			return;
		}

		if (key.name === "up" || key.name === "k") {
			setSelectedIndex((prev) => Math.max(0, prev - 1));
		}

		if (key.name === "down" || key.name === "j") {
			setSelectedIndex((prev) =>
				Math.min(filteredProcesses.length - 1, prev + 1),
			);
		}

		if (key.name === "r") {
			refresh();
			setStatusMessage("Refreshing...");
			setTimeout(() => setStatusMessage(undefined), 1000);
		}

		if (
			(key.name === "return" || key.name === "x") &&
			selectedProcess &&
			!killing
		) {
			kill(selectedProcess.pid);
		}
	});

	return (
		<box
			style={{
				flexDirection: "column",
				flexGrow: 1,
				height: "100%",
				overflow: "hidden",
				backgroundColor: theme.bg,
			}}
		>
			<Header
				processCount={filteredProcesses.length}
				totalCount={processes.length}
				loading={loading}
				searchMode={searchMode}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>
			<ProcessList
				processes={filteredProcesses}
				selectedIndex={selectedIndex}
				selectedProcess={selectedProcess}
			/>
			<ProcessDetail process={selectedProcess} />
			<StatusBar
				message={killing ? "Killing..." : statusMessage}
				searchMode={searchMode}
			/>
		</box>
	);
}
