/**
 * Global in-memory store for SSE connections.
 * Uses `globalThis` to survive Next.js HMR reloads in dev mode.
 */

export interface DesktopClient {
  hostname: string;
  controller: ReadableStreamDefaultController;
  connectedAt: number;
}

export interface WebClient {
  controller: ReadableStreamDefaultController;
}

// Persist across HMR in development
const g = globalThis as unknown as {
  __desktopClients?: Map<string, DesktopClient>;
  __webClients?: Set<WebClient>;
};

if (!g.__desktopClients) {
  g.__desktopClients = new Map<string, DesktopClient>();
}
if (!g.__webClients) {
  g.__webClients = new Set<WebClient>();
}

export const desktopClients = g.__desktopClients;
export const webClients = g.__webClients;

/** Broadcast updated client list to all connected web dashboards */
export function broadcastClientList() {
  const list = Array.from(desktopClients.values()).map((c) => ({
    hostname: c.hostname,
    connectedAt: c.connectedAt,
  }));

  const data = `data: ${JSON.stringify({ type: "clients", clients: list })}\n\n`;

  for (const wc of webClients) {
    try {
      wc.controller.enqueue(new TextEncoder().encode(data));
    } catch {
      webClients.delete(wc);
    }
  }
}
