import { setServers } from "node:dns";

/**
 * Points Node's resolver at specific DNS servers. Needed when the OS resolver cannot answer the SRV lookup behind
 * `mongodb+srv://` URIs (Node reads a local-only resolver such as 127.0.0.1 and gets ECONNREFUSED).
 * Must run before the first connection attempt. A no-op when nothing is configured.
 */
export function applyDnsServers(servers: readonly string[] | undefined): void {
	if (servers && servers.length > 0) setServers([...servers]);
}
