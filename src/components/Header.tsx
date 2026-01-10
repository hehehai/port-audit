import { TextAttributes } from "@opentui/core";
import { Divider } from "./Divider";
import { SearchInput } from "./SearchInput";
import { theme } from "../theme";

interface HeaderProps {
	processCount: number;
	totalCount: number;
	loading: boolean;
	searchMode: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
}

export function Header({
	processCount,
	totalCount,
	loading,
	searchMode,
	searchQuery,
	onSearchChange,
}: HeaderProps) {
	return (
		<box style={{ flexDirection: "column" }}>
			<box
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					padding: 1,
				}}
			>
				<text fg={theme.primary} attributes={TextAttributes.BOLD}>
					PORT-AUDIT
				</text>
				<SearchInput
					value={searchQuery}
					onChange={onSearchChange}
					focused={searchMode}
					resultCount={processCount}
					totalCount={totalCount}
				/>
				<text fg={loading ? theme.textMuted : theme.text}>
					{loading ? "..." : processCount}
				</text>
			</box>
			<Divider />
		</box>
	);
}
