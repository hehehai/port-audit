import { useCallback, useState } from "react";
import { killProcess } from "../utils/process";

interface UseKillProcessResult {
	killing: boolean;
	lastResult: { pid: number; success: boolean; error?: string } | null;
	kill: (pid: number) => Promise<void>;
	clearResult: () => void;
}

type UseKillProcessOptions = {
	killProcess?: typeof killProcess;
};

export function useKillProcess(
	options: UseKillProcessOptions = {},
): UseKillProcessResult {
	const { killProcess: kill = killProcess } = options;
	const [killing, setKilling] = useState(false);
	const [lastResult, setLastResult] = useState<{
		pid: number;
		success: boolean;
		error?: string;
	} | null>(null);

	const triggerKill = useCallback(
		async (pid: number) => {
			setKilling(true);
			try {
				const result = await kill(pid);
				setLastResult({ pid, ...result });
			} finally {
				setKilling(false);
			}
		},
		[kill],
	);

	const clearResult = useCallback(() => {
		setLastResult(null);
	}, []);

	return { killing, lastResult, kill: triggerKill, clearResult };
}
