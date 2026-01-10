import { describe, expect, it } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { Header } from "../src/components/Header";
import { ProcessDetail } from "../src/components/ProcessDetail";
import { ProcessList } from "../src/components/ProcessList";
import { SearchInput } from "../src/components/SearchInput";
import { StatusBar } from "../src/components/StatusBar";
import type { ProcessInfo } from "../src/types";

describe("components", () => {
	it("Header renders title and counts", async () => {
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<Header
				processCount={2}
				totalCount={5}
				loading={false}
				searchMode={false}
				searchQuery=""
				onSearchChange={() => {}}
			/>,
			{ width: 60, height: 6 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("PORT-AUDIT");
		expect(frame).toContain("2");
		renderer.destroy();
	});

	it("ProcessList shows empty state", async () => {
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<ProcessList processes={[]} selectedIndex={0} selectedProcess={null} />,
			{ width: 60, height: 6 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("No processes found");
		renderer.destroy();
	});

	it("ProcessList renders rows", async () => {
		const processes: ProcessInfo[] = [
			{
				pid: 12,
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
		];
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<ProcessList
				processes={processes}
				selectedIndex={0}
				selectedProcess={processes[0] ?? null}
			/>,
			{ width: 60, height: 8 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("PID");
		expect(frame).toContain("COMMAND");
		expect(frame).toContain("node");
		expect(frame).toContain("3001");
		renderer.destroy();
	});

	it("ProcessDetail shows empty state", async () => {
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<ProcessDetail process={null} />,
			{ width: 60, height: 4 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("No process selected");
		renderer.destroy();
	});

	it("ProcessDetail shows selected process", async () => {
		const process: ProcessInfo = {
			pid: 55,
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
		};
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<ProcessDetail process={process} />,
			{ width: 60, height: 4 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("PID 55");
		expect(frame).toContain("Port 3001");
		renderer.destroy();
	});

	it("StatusBar renders search hints", async () => {
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<StatusBar message="Ready" searchMode={true} />,
			{ width: 60, height: 4 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("esc");
		expect(frame).toContain("navigate");
		expect(frame).toContain("Ready");
		renderer.destroy();
	});

	it("SearchInput shows result count when filtered", async () => {
		const { renderOnce, captureCharFrame, renderer } = await testRender(
			<SearchInput
				value="30"
				onChange={() => {}}
				focused={true}
				resultCount={2}
				totalCount={5}
			/>,
			{ width: 60, height: 4 },
		);

		await renderOnce();
		const frame = captureCharFrame();
		expect(frame).toContain("2/5");
		renderer.destroy();
	});
});
