import { theme } from "../theme";

export function Divider() {
	return (
		<box style={{ height: 1, width: "100%" }}>
			<text fg={theme.border}>{"─".repeat(200)}</text>
		</box>
	);
}
