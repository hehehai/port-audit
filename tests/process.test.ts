import { describe, expect, it } from "bun:test";
import { parseLsofOutput } from "../src/utils/process";

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
