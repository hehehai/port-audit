import { Divider } from "./Divider";
import { theme } from "../theme";

interface StatusBarProps {
	message?: string;
	searchMode: boolean;
}

function KeyHint({
	keyName,
	label,
	keyColor,
}: {
	keyName: string;
	label: string;
	keyColor: string;
}) {
	return (
		<box style={{ flexDirection: "row", gap: 0 }}>
			<text fg={keyColor}>{keyName}</text>
			<text fg={theme.textMuted}> {label}</text>
		</box>
	);
}

export function StatusBar({ message, searchMode }: StatusBarProps) {
	return (
		<box style={{ flexDirection: "column", flexShrink: 0 }}>
			<Divider />
			<box
				style={{
					flexDirection: "row",
					height: 1,
					justifyContent: "space-between",
				}}
			>
				<box style={{ flexDirection: "row", gap: 2 }}>
					{searchMode ? (
						<>
							<KeyHint keyName="esc" label="clear" keyColor={theme.primary} />
							<KeyHint keyName="↑↓" label="navigate" keyColor={theme.text} />
						</>
					) : (
						<>
							<KeyHint keyName="↑↓" label="navigate" keyColor={theme.text} />
							<KeyHint keyName="/" label="search" keyColor={theme.primary} />
							<KeyHint keyName="x" label="kill" keyColor={theme.error} />
							<KeyHint keyName="r" label="refresh" keyColor={theme.text} />
							<KeyHint keyName="q" label="quit" keyColor={theme.text} />
						</>
					)}
				</box>
				{message && <text fg={theme.warning}>{message}</text>}
			</box>
		</box>
	);
}
