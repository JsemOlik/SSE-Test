import { desktopClients, webClients, type WebClient } from "../../../lib/clients";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const client: WebClient = { controller };
      webClients.add(client);

      // Send current state immediately
      const list = Array.from(desktopClients.values()).map((c) => ({
        hostname: c.hostname,
        connectedAt: c.connectedAt,
      }));

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "clients", clients: list })}\n\n`)
      );

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        webClients.delete(client);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
