import type { ProcessInfo } from "./types";
import { getListeningProcesses, killProcess } from "./utils/process";

const HELP_TEXT = `port - Manage listening TCP ports

Usage:
  port                 Start the TUI
  port list            List listening ports
  port list -s <term>  Filter by port or process name
  port k <port>        Kill process(es) by port
  port --help          Show help

Examples:
  port list
  port list -s 3001
  port k 3001
`;

type ListOptions = {
	search?: string;
};

type CliDeps = {
	getListeningProcesses: () => Promise<ProcessInfo[]>;
	killProcess: (pid: number) => Promise<{ success: boolean; error?: string }>;
};

const defaultDeps: CliDeps = {
	getListeningProcesses,
	killProcess,
};

export async function runCli(
	args: string[],
	deps: CliDeps = defaultDeps,
): Promise<boolean> {
	if (args.length === 0) return false;

	const [command, ...rest] = args;

	if (command === "-h" || command === "--help" || command === "help") {
		printHelp();
		return true;
	}

	if (command === "list" || command === "ls") {
		const options = parseListOptions(rest);
		await handleList(options, deps);
		return true;
	}

	if (command === "k" || command === "kill") {
		const target = rest[0];
		await handleKill(target, deps);
		return true;
	}

	printError(`Unknown command: ${command}`);
	printHelp();
	process.exitCode = 1;
	return true;
}

function printHelp() {
	process.stdout.write(`${HELP_TEXT}\n`);
}

function printError(message: string) {
	process.stderr.write(`${message}\n`);
}

function parseListOptions(args: string[]): ListOptions {
	const options: ListOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "-s" || arg === "--search") {
			options.search = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "-h" || arg === "--help") {
			printHelp();
			process.exit(0);
		}
		printError(`Unknown option: ${arg}`);
		printHelp();
		process.exit(1);
	}

	return options;
}

async function handleList(options: ListOptions, deps: CliDeps) {
	const processes = await deps.getListeningProcesses();
	const filtered = applySearch(processes, options.search);

	if (filtered.length === 0) {
		process.stdout.write("No listening ports found.\n");
		return;
	}

	printTable(
		["PORT", "PID", "COMMAND", "USER", "NAME"],
		filtered.map((proc) => [
			String(proc.port),
			String(proc.pid),
			proc.command,
			proc.user,
			proc.name,
		]),
	);
}

async function handleKill(target: string | undefined, deps: CliDeps) {
	if (!target) {
		printError("Missing port. Example: port k 3001");
		process.exitCode = 1;
		return;
	}

	const port = Number.parseInt(target, 10);
	if (!Number.isFinite(port)) {
		printError(`Invalid port: ${target}`);
		process.exitCode = 1;
		return;
	}

	const processes = await deps.getListeningProcesses();
	const matches = processes.filter((proc) => proc.port === port);

	if (matches.length === 0) {
		printError(`No process found on port ${port}`);
		process.exitCode = 1;
		return;
	}

	let anyFailure = false;
	for (const proc of matches) {
		const result = await deps.killProcess(proc.pid);
		if (result.success) {
			process.stdout.write(
				`Killed PID ${proc.pid} (port ${proc.port}, ${proc.command})\n`,
			);
		} else {
			anyFailure = true;
			printError(
				`Failed to kill PID ${proc.pid} (port ${proc.port}): ${result.error}`,
			);
		}
	}

	if (anyFailure) {
		process.exitCode = 1;
	}
}

function applySearch(processes: ProcessInfo[], search?: string) {
	if (!search) return processes;
	const term = search.toLowerCase();
	return processes.filter((proc) => {
		if (String(proc.port).includes(term)) return true;
		if (proc.command.toLowerCase().includes(term)) return true;
		if (proc.user.toLowerCase().includes(term)) return true;
		return proc.name.toLowerCase().includes(term);
	});
}

function printTable(headers: string[], rows: string[][]) {
	const widths = headers.map((header, idx) => {
		let max = header.length;
		for (const row of rows) {
			const cell = row[idx] ?? "";
			if (cell.length > max) max = cell.length;
		}
		return max;
	});

	const formatRow = (row: string[]) =>
		row
			.map((cell, idx) => {
				const width = widths[idx] ?? cell.length;
				return cell.padEnd(width);
			})
			.join("  ");

	process.stdout.write(`${formatRow(headers)}\n`);
	process.stdout.write(
		`${formatRow(widths.map((width) => "-".repeat(width)))}\n`,
	);
	for (const row of rows) {
		process.stdout.write(`${formatRow(row)}\n`);
	}
}
