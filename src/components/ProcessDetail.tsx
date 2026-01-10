import type { ProcessInfo } from "../types";
import { Divider } from "./Divider";
import { theme } from "../theme";

interface ProcessDetailProps {
	process: ProcessInfo | null;
}

export function ProcessDetail({ process }: ProcessDetailProps) {
	return (
		<box style={{ flexDirection: "column", flexShrink: 0 }}>
			<Divider />
			<box style={{ padding: 1 }}>
				{process ? (
					<box style={{ flexDirection: "row", gap: 1 }}>
						<text fg={theme.textMuted}>{process.name}</text>
						<text fg={theme.textMuted}>·</text>
						<text fg={theme.text}>PID {process.pid}</text>
						<text fg={theme.textMuted}>·</text>
						<text fg={theme.accent}>Port {process.port}</text>
						<text fg={theme.textMuted}>·</text>
						<text fg={theme.textMuted}>{process.user}</text>
					</box>
				) : (
					<text fg={theme.textMuted}>No process selected</text>
				)}
			</box>
		</box>
	);
}
