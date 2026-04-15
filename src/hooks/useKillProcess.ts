import { useCallback, useRef, useState } from "react";
import type { ProcessInfo } from "../types";
import { killProcess } from "../utils/process";

type KillTarget = Pick<ProcessInfo, "pid" | "port" | "command">;

interface UseKillProcessResult {
	killing: boolean;
	killingTarget: KillTarget | null;
	lastResult:
		| { pid: number; port: number; success: boolean; error?: string }
		| null;
	kill: (target: KillTarget) => Promise<void>;
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
	const [killingTarget, setKillingTarget] = useState<KillTarget | null>(null);
	const [lastResult, setLastResult] = useState<{
		pid: number;
		port: number;
		success: boolean;
		error?: string;
	} | null>(null);
	const killingRef = useRef(false);

	const triggerKill = useCallback(
		async (target: KillTarget) => {
			if (killingRef.current) {
				return;
			}

			killingRef.current = true;
			setKilling(true);
			setKillingTarget(target);
			try {
				const result = await kill(target.pid);
				setLastResult({ pid: target.pid, port: target.port, ...result });
			} finally {
				killingRef.current = false;
				setKilling(false);
				setKillingTarget(null);
			}
		},
		[kill],
	);

	const clearResult = useCallback(() => {
		setLastResult(null);
	}, []);

	return {
		killing,
		killingTarget,
		lastResult,
		kill: triggerKill,
		clearResult,
	};
}
