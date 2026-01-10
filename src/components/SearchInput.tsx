import { theme } from "../theme";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	focused: boolean;
	resultCount: number;
	totalCount: number;
}

export function SearchInput({
	value,
	onChange,
	focused,
	resultCount,
	totalCount,
}: SearchInputProps) {
	const hasFilter = value.length > 0;

	return (
		<box
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 1,
				height: 1,
				flexGrow: 1,
			}}
		>
			<text fg={focused ? theme.primary : theme.textMuted}>/</text>
			<box style={{ flexGrow: 1, height: 1 }}>
				<input
					placeholder={focused ? "type to search..." : "/ to search"}
					value={value}
					onInput={onChange}
					focused={focused}
				/>
			</box>
			{hasFilter ? (
				<text fg={theme.textMuted}>
					{resultCount}/{totalCount}
				</text>
			) : (
				<text fg={theme.textDim}>{focused ? "esc to exit" : ""}</text>
			)}
		</box>
	);
}
