export interface ProcessInfo {
	pid: number;
	command: string;
	user: string;
	fd: string;
	type: string;
	device: string;
	sizeOff: string;
	node: string;
	name: string;
	port: number;
	protocol: "TCP" | "UDP";
	state: string;
}
