import { runCli } from "./cli";

const handled = await runCli(process.argv.slice(2));
if (!handled) {
	await import("./index.tsx");
}
