import { describe, expect, it } from "bun:test";
import { runCli } from "../src/cli";
import type { ProcessInfo } from "../src/types";

type WriteFn = typeof process.stdout.write;

function captureOutput() {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const originalStdout = process.stdout.write.bind(process.stdout);
	const originalStderr = process.stderr.write.bind(process.stderr);

	(process.stdout.write as WriteFn) = ((chunk: unknown) => {
		stdout.push(String(chunk));
		return true;
	}) as WriteFn;

	(process.stderr.write as WriteFn) = ((chunk: unknown) => {
		stderr.push(String(chunk));
		return true;
	}) as WriteFn;

	return {
		stdout,
		stderr,
		restore() {
			process.stdout.write = originalStdout;
			process.stderr.write = originalStderr;
		},
	};
}

describe("runCli", () => {
	it("prints help and returns handled", async () => {
		const { stdout, restore } = captureOutput();
		const prevExit = process.exitCode;
		process.exitCode = 0;

		const handled = await runCli(["--help"]);

		restore();
		expect(handled).toBe(true);
		expect(stdout.join("")).toContain("Usage:");
		process.exitCode = prevExit;
	});

	it("sets exitCode for unknown commands", async () => {
		const { stderr, restore } = captureOutput();
		const prevExit = process.exitCode;
		process.exitCode = 0;

		const handled = await runCli(["nope"]);

		restore();
		expect(handled).toBe(true);
		expect(process.exitCode).toBe(1);
		expect(stderr.join("")).toContain("Unknown command");
		process.exitCode = prevExit;
	});

	it("lists filtered processes", async () => {
		const { stdout, restore } = captureOutput();
		const prevExit = process.exitCode;
		process.exitCode = 0;

		const sample: ProcessInfo[] = [
			{
				pid: 101,
				command: "node",
				user: "alice",
				fd: "12u",
				type: "IPv4",
				device: "0x01",
				sizeOff: "0t0",
				node: "TCP",
				name: "*:3001 (LISTEN)",
				port: 3001,
				protocol: "TCP",
				state: "LISTEN",
			},
			{
				pid: 202,
				command: "python",
				user: "bob",
				fd: "14u",
				type: "IPv6",
				device: "0x02",
				sizeOff: "0t0",
				node: "TCP",
				name: "*:8080 (LISTEN)",
				port: 8080,
				protocol: "TCP",
				state: "LISTEN",
			},
		];

		const handled = await runCli(["list", "-s", "3001"], {
			getListeningProcesses: async () => sample,
			killProcess: async () => ({ success: true }),
		});

		restore();
		expect(handled).toBe(true);
		const output = stdout.join("");
		expect(output).toContain("3001");
		expect(output).not.toContain("8080");
		process.exitCode = prevExit;
	});

	it("kills matching processes", async () => {
		const { stdout, restore } = captureOutput();
		const prevExit = process.exitCode;
		process.exitCode = 0;

		const handled = await runCli(["k", "3001"], {
			getListeningProcesses: async () => [
				{
					pid: 99,
					command: "node",
					user: "alice",
					fd: "12u",
					type: "IPv4",
					device: "0x01",
					sizeOff: "0t0",
					node: "TCP",
					name: "*:3001 (LISTEN)",
					port: 3001,
					protocol: "TCP",
					state: "LISTEN",
				},
			],
			killProcess: async () => ({ success: true }),
		});

		restore();
		expect(handled).toBe(true);
		expect(stdout.join("")).toContain("Killed PID 99");
		process.exitCode = prevExit;
	});
});
