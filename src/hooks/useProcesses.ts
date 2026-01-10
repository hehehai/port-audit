import { useCallback, useEffect, useState } from "react";
import type { ProcessInfo } from "../types";
import { getListeningProcesses } from "../utils/process";

const REFRESH_INTERVAL = 2000;

export function useProcesses() {
	const [processes, setProcesses] = useState<ProcessInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			const result = await getListeningProcesses();
			setProcesses(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
		const interval = setInterval(refresh, REFRESH_INTERVAL);
		return () => clearInterval(interval);
	}, [refresh]);

	return { processes, loading, error, refresh };
}
