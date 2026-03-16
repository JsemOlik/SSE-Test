import { desktopClients } from "../../lib/clients";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let action = "block";
  try {
    const body = await request.json();
    if (body.action === "unblock") action = "unblock";
  } catch {
    // default to block
  }

  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({ type: action })}\n\n`;
  let sent = 0;

  for (const [id, client] of desktopClients) {
    try {
      client.controller.enqueue(encoder.encode(message));
      sent++;
    } catch {
      desktopClients.delete(id);
    }
  }

  return Response.json({ success: true, action, sent });
}
