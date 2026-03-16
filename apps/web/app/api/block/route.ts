import { desktopClients } from "../../lib/clients";

export const dynamic = "force-dynamic";

export async function POST() {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({ type: "block" })}\n\n`;
  let sent = 0;

  for (const [id, client] of desktopClients) {
    try {
      client.controller.enqueue(encoder.encode(message));
      sent++;
    } catch {
      desktopClients.delete(id);
    }
  }

  return Response.json({ success: true, sent });
}
