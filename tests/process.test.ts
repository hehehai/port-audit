import { describe, expect, it } from "bun:test";
import {
	parseLsofOutput,
	parseSsOutput,
	parseWindowsJson,
} from "../src/utils/process";

describe("parseLsofOutput", () => {
	it("parses and de-duplicates IPv4/IPv6 entries", () => {
		const output = `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node     123 alice  22u  IPv6 0x01       0t0  TCP *:3001 (LISTEN)
node     123 alice  23u  IPv4 0x02       0t0  TCP 127.0.0.1:3001 (LISTEN)
python   456 bob    10u  IPv4 0x03       0t0  TCP *:8080 (LISTEN)`;

		const result = parseLsofOutput(output);
		expect(result).toHaveLength(2);
		expect(result[0]?.port).toBe(3001);
		expect(result[1]?.port).toBe(8080);
		expect(result[0]?.pid).toBe(123);
		expect(result[1]?.pid).toBe(456);
	});

	it("returns empty when output is blank", () => {
		const result = parseLsofOutput("");
		expect(result).toEqual([]);
	});
});

describe("parseSsOutput", () => {
	it("parses ss output with pid and command", () => {
		const output = `State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process
LISTEN 0      128        0.0.0.0:3001      0.0.0.0:*     users:(("node",pid=123,fd=12))
LISTEN 0      128        [::]:8080         [::]:*        users:(("python",pid=456,fd=9))`;
		const result = parseSsOutput(output);
		expect(result).toHaveLength(2);
		expect(result[0]?.port).toBe(3001);
		expect(result[0]?.pid).toBe(123);
		expect(result[1]?.port).toBe(8080);
		expect(result[1]?.command).toBe("python");
	});
});

describe("parseWindowsJson", () => {
	it("parses PowerShell JSON output", () => {
		const output = JSON.stringify([
			{ Port: 3001, Pid: 12, Command: "node", LocalAddress: "0.0.0.0" },
			{ Port: 8080, Pid: 34, Command: "python", LocalAddress: "::" },
		]);
		const result = parseWindowsJson(output);
		expect(result).toHaveLength(2);
		expect(result[0]?.port).toBe(3001);
		expect(result[0]?.command).toBe("node");
		expect(result[1]?.name).toContain("8080");
	});
});
