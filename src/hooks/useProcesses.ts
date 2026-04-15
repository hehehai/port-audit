import { useCallback, useEffect, useRef, useState } from "react";
import type { ProcessInfo } from "../types";
import { getListeningProcesses } from "../utils/process";

const REFRESH_INTERVAL = 2000;

type RefreshOptions = {
	force?: boolean;
};

type UseProcessesOptions = {
	getListeningProcesses?: typeof getListeningProcesses;
	refreshIntervalMs?: number;
	paused?: boolean;
};

export function useProcesses(options: UseProcessesOptions = {}) {
	const {
		getListeningProcesses: getProcesses = getListeningProcesses,
		refreshIntervalMs = REFRESH_INTERVAL,
		paused = false,
	} = options;
	const [processes, setProcesses] = useState<ProcessInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const pausedRef = useRef(paused);
	pausedRef.current = paused;

	const refresh = useCallback(async (options: RefreshOptions = {}) => {
		const { force = false } = options;
		try {
			const result = await getProcesses();
			if (!pausedRef.current || force) {
				setProcesses(result);
				setError(null);
			}
		} catch (err) {
			if (!pausedRef.current || force) {
				setError(err instanceof Error ? err.message : String(err));
			}
		} finally {
			setLoading(false);
		}
	}, [getProcesses]);

	useEffect(() => {
		if (paused) {
			return undefined;
		}

		void refresh();
		if (refreshIntervalMs > 0) {
			const interval = setInterval(() => {
				void refresh();
			}, refreshIntervalMs);
			return () => clearInterval(interval);
		}
		return undefined;
	}, [paused, refresh, refreshIntervalMs]);

	return { processes, loading, error, refresh };
}
