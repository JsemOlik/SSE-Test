import { desktopClients, broadcastClientList, type DesktopClient } from "../../../lib/clients";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get("hostname") || `Desktop-${Date.now()}`;
  const clientId = `${hostname}-${Date.now()}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const client: DesktopClient = {
        hostname,
        controller,
        connectedAt: Date.now(),
      };

      desktopClients.set(clientId, client);
      broadcastClientList();

      // Send a welcome message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", hostname })}\n\n`)
      );

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Cleanup on abort (client disconnect)
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        desktopClients.delete(clientId);
        broadcastClientList();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
