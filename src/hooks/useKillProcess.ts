import { useCallback, useState } from "react";
import { killProcess } from "../utils/process";

interface UseKillProcessResult {
	killing: boolean;
	lastResult: { pid: number; success: boolean; error?: string } | null;
	kill: (pid: number) => Promise<void>;
	clearResult: () => void;
}

export function useKillProcess(): UseKillProcessResult {
	const [killing, setKilling] = useState(false);
	const [lastResult, setLastResult] = useState<{
		pid: number;
		success: boolean;
		error?: string;
	} | null>(null);

	const kill = useCallback(async (pid: number) => {
		setKilling(true);
		try {
			const result = await killProcess(pid);
			setLastResult({ pid, ...result });
		} finally {
			setKilling(false);
		}
	}, []);

	const clearResult = useCallback(() => {
		setLastResult(null);
	}, []);

	return { killing, lastResult, kill, clearResult };
}
