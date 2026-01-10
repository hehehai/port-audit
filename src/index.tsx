import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";

const renderer = await createCliRenderer();
const root = createRoot(renderer);

function cleanup() {
	root.unmount();
	renderer.destroy();
	process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

declare global {
	var __cleanup: () => void;
}

globalThis.__cleanup = cleanup;

root.render(<App />);
