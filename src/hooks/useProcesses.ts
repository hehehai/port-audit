import { useCallback, useEffect, useState } from "react";
import type { ProcessInfo } from "../types";
import { getListeningProcesses } from "../utils/process";

const REFRESH_INTERVAL = 2000;

type UseProcessesOptions = {
	getListeningProcesses?: typeof getListeningProcesses;
	refreshIntervalMs?: number;
};

export function useProcesses(options: UseProcessesOptions = {}) {
	const {
		getListeningProcesses: getProcesses = getListeningProcesses,
		refreshIntervalMs = REFRESH_INTERVAL,
	} = options;
	const [processes, setProcesses] = useState<ProcessInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			const result = await getProcesses();
			setProcesses(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}, [getProcesses]);

	useEffect(() => {
		refresh();
		if (refreshIntervalMs > 0) {
			const interval = setInterval(refresh, refreshIntervalMs);
			return () => clearInterval(interval);
		}
		return undefined;
	}, [refresh, refreshIntervalMs]);

	return { processes, loading, error, refresh };
}
