import type { ScrollBoxRenderable } from "@opentui/core";
import { useEffect, useRef } from "react";
import type { ProcessInfo } from "../types";
import { theme } from "../theme";

interface ProcessListProps {
	processes: ProcessInfo[];
	selectedIndex: number;
	selectedProcess: ProcessInfo | null;
}

const ROW_HEIGHT = 1;

export function ProcessList({
	processes,
	selectedIndex,
	selectedProcess,
}: ProcessListProps) {
	const scrollRef = useRef<ScrollBoxRenderable>(null);

	// 滚动到选中项
	// biome-ignore lint/correctness/useExhaustiveDependencies: processes.length 用于在过滤后重新计算滚动位置
	useEffect(() => {
		if (scrollRef.current) {
			const scrollBox = scrollRef.current;
			const viewportHeight = scrollBox.viewport.height;
			const currentScroll = scrollBox.scrollTop;
			const itemTop = selectedIndex * ROW_HEIGHT;
			const itemBottom = itemTop + ROW_HEIGHT;

			// 选中第一项时，强制滚动到顶部
			if (selectedIndex === 0) {
				scrollBox.scrollTop = 0;
			} else if (itemTop < currentScroll) {
				scrollBox.scrollTop = itemTop;
			} else if (itemBottom > currentScroll + viewportHeight) {
				scrollBox.scrollTop = itemBottom - viewportHeight;
			}
		}
	}, [selectedIndex, processes.length]);

	if (processes.length === 0) {
		return (
			<box
				style={{
					flexGrow: 1,
					padding: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<text fg={theme.textMuted}>No processes found</text>
			</box>
		);
	}

	return (
		<box
			style={{
				flexDirection: "column",
				flexGrow: 1,
				flexShrink: 1,
				minHeight: 0,
				justifyContent: "flex-start",
			}}
		>
			<box
				style={{
					flexDirection: "row",
					paddingLeft: 1,
					paddingRight: 1,
					height: 1,
					flexShrink: 0,
				}}
			>
				<text fg={theme.textMuted} style={{ width: 8 }}>
					PID
				</text>
				<text fg={theme.textMuted} style={{ width: 18 }}>
					COMMAND
				</text>
				<text fg={theme.textMuted} style={{ width: 8 }}>
					PORT
				</text>
				<text fg={theme.textMuted} style={{ flexGrow: 1 }}>
					USER
				</text>
			</box>
			<scrollbox
				ref={scrollRef}
				style={{
					flexGrow: 1,
					flexShrink: 1,
					minHeight: 0,
					contentOptions: {
						flexDirection: "column",
						justifyContent: "flex-start",
						alignItems: "stretch",
					},
				}}
			>
				{processes.map((proc) => {
					const isSelected =
						selectedProcess !== null &&
						proc.pid === selectedProcess.pid &&
						proc.port === selectedProcess.port;
					return (
						<ProcessRow
							key={`${proc.pid}-${proc.port}`}
							process={proc}
							selected={isSelected}
						/>
					);
				})}
			</scrollbox>
		</box>
	);
}

interface ProcessRowProps {
	process: ProcessInfo;
	selected: boolean;
}

function ProcessRow({ process, selected }: ProcessRowProps) {
	const bg = selected ? theme.bgHighlight : undefined;

	return (
		<box
			style={{
				flexDirection: "row",
				backgroundColor: bg,
				height: ROW_HEIGHT,
				paddingLeft: 1,
				paddingRight: 1,
			}}
		>
			<text fg={selected ? theme.warning : theme.text} style={{ width: 8 }}>
				{process.pid}
			</text>
			<text fg={selected ? theme.primary : theme.text} style={{ width: 18 }}>
				{process.command.slice(0, 16)}
			</text>
			<text fg={theme.accent} style={{ width: 8 }}>
				{process.port}
			</text>
			<text fg={theme.textMuted} style={{ flexGrow: 1 }}>
				{process.user}
			</text>
		</box>
	);
}
