import type { ProcessInfo } from "../types";

export async function getListeningProcesses(): Promise<ProcessInfo[]> {
	const platform = process.platform;
	if (platform === "win32") {
		return getListeningProcessesWindows();
	}
	if (platform === "linux") {
		return getListeningProcessesLinux();
	}
	return getListeningProcessesDarwin();
}

async function getListeningProcessesDarwin(): Promise<ProcessInfo[]> {
	const result = await runCommand([
		"lsof",
		"-iTCP",
		"-sTCP:LISTEN",
		"-P",
		"-n",
	]);
	if (result.exitCode !== 0) return [];
	return parseLsofOutput(result.stdout);
}

async function getListeningProcessesLinux(): Promise<ProcessInfo[]> {
	const lsofResult = await runCommand([
		"lsof",
		"-iTCP",
		"-sTCP:LISTEN",
		"-P",
		"-n",
	]);
	if (lsofResult.exitCode === 0 && lsofResult.stdout.trim()) {
		return parseLsofOutput(lsofResult.stdout);
	}

	const ssResult = await runCommand(["ss", "-ltnp"]);
	if (ssResult.exitCode !== 0) return [];
	return parseSsOutput(ssResult.stdout);
}

async function getListeningProcessesWindows(): Promise<ProcessInfo[]> {
	const script = [
		"Get-NetTCPConnection -State Listen |",
		"ForEach-Object {",
		"$p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue;",
		"[PSCustomObject]@{",
		"Port=$_.LocalPort;",
		"Pid=$_.OwningProcess;",
		"Command=$p.ProcessName;",
		"LocalAddress=$_.LocalAddress",
		"}",
		"} | ConvertTo-Json -Depth 3",
	].join(" ");

	const result = await runCommand([
		"powershell",
		"-NoProfile",
		"-Command",
		script,
	]);
	if (result.exitCode !== 0) return [];
	return parseWindowsJson(result.stdout);
}

async function runCommand(command: string[]): Promise<{
	stdout: string;
	stderr: string;
	exitCode: number;
}> {
	const proc = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();
	const exitCode = await proc.exited;
	return { stdout, stderr, exitCode };
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

	return dedupeAndSort(processes);
}

export function parseSsOutput(output: string): ProcessInfo[] {
	const lines = output.trim().split("\n");
	if (lines.length <= 1) return [];

	const processes: ProcessInfo[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;

		const portMatch = line.match(/[^\s]+:(\d+)/);
		const port = portMatch ? Number.parseInt(portMatch[1] ?? "0", 10) : 0;

		const procMatch = line.match(/users:\(\("([^"]+)",pid=(\d+)/);
		const command = procMatch?.[1] ?? "unknown";
		const pid = procMatch ? Number.parseInt(procMatch[2] ?? "0", 10) : 0;

		processes.push({
			pid,
			command,
			user: "",
			fd: "",
			type: "",
			device: "",
			sizeOff: "",
			node: "TCP",
			name: line.trim(),
			port,
			protocol: "TCP",
			state: "LISTEN",
		});
	}

	return dedupeAndSort(processes);
}

type WindowsTcpEntry = {
	Port?: number;
	Pid?: number;
	Command?: string;
	LocalAddress?: string;
};

export function parseWindowsJson(output: string): ProcessInfo[] {
	const trimmed = output.trim();
	if (!trimmed) return [];

	let data: WindowsTcpEntry[] = [];
	try {
		const parsed = JSON.parse(trimmed);
		data = Array.isArray(parsed) ? parsed : [parsed];
	} catch {
		return [];
	}

	const processes: ProcessInfo[] = data.map((entry) => {
		const port = entry.Port ?? 0;
		const pid = entry.Pid ?? 0;
		const command = entry.Command || "unknown";
		const address = entry.LocalAddress ?? "*";
		return {
			pid,
			command,
			user: "",
			fd: "",
			type: "",
			device: "",
			sizeOff: "",
			node: "TCP",
			name: `${address}:${port} (LISTEN)`,
			port,
			protocol: "TCP",
			state: "LISTEN",
		};
	});

	return dedupeAndSort(processes);
}

function dedupeAndSort(processes: ProcessInfo[]) {
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
