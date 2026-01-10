import type { ProcessInfo } from "../types";

export async function getListeningProcesses(): Promise<ProcessInfo[]> {
	const proc = Bun.spawn(["lsof", "-iTCP", "-sTCP:LISTEN", "-P", "-n"], {
		stdout: "pipe",
		stderr: "pipe",
	});

	const output = await new Response(proc.stdout).text();
	await proc.exited;

	return parseLsofOutput(output);
}

export function parseLsofOutput(output: string): ProcessInfo[] {
	const lines = output.trim().split("\n");
	if (lines.length <= 1) return [];

	const processes: ProcessInfo[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;

		const parts = line.split(/\s+/);
		if (parts.length < 9) continue;

		const command = parts[0] ?? "";
		const pidStr = parts[1] ?? "";
		const user = parts[2] ?? "";
		const fd = parts[3] ?? "";
		const type = parts[4] ?? "";
		const device = parts[5] ?? "";
		const sizeOff = parts[6] ?? "";
		const node = parts[7] ?? "";
		const name = parts[8] ?? "";

		const pid = Number.parseInt(pidStr, 10);
		if (Number.isNaN(pid)) continue;

		const portMatch =
			name.match(/:(\d+)\s*\(LISTEN\)$/) ?? name.match(/:(\d+)$/);
		const port = portMatch ? Number.parseInt(portMatch[1] ?? "0", 10) : 0;

		processes.push({
			pid,
			command,
			user,
			fd,
			type,
			device,
			sizeOff,
			node,
			name,
			port,
			protocol: "TCP",
			state: "LISTEN",
		});
	}

	// 按 PID+端口去重（lsof 会为 IPv4/IPv6 返回多行）
	const seen = new Map<string, ProcessInfo>();
	for (const proc of processes) {
		const key = `${proc.pid}-${proc.port}`;
		if (!seen.has(key)) {
			seen.set(key, proc);
		}
	}

	return Array.from(seen.values()).sort((a, b) => a.port - b.port);
}

export async function killProcess(
	pid: number,
): Promise<{ success: boolean; error?: string }> {
	try {
		process.kill(pid, "SIGTERM");

		await new Promise((resolve) => setTimeout(resolve, 500));

		try {
			process.kill(pid, 0);
			process.kill(pid, "SIGKILL");
		} catch {
			// Process already terminated
		}

		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { success: false, error: message };
	}
}
