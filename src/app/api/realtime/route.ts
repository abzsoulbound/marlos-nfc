import { subscribe } from "@/lib/realtime.bus";

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      // initial ping
      send({ type: "hello", at: Date.now() });

      const unsub = subscribe((evt) => send(evt));

      const keepAlive = setInterval(() => {
        send({ type: "ping", at: Date.now() });
      }, 25000);

      (controller as any).closeStream = () => {
        clearInterval(keepAlive);
        unsub();
        try { controller.close(); } catch {}
      };
    },
    cancel(reason) {
      // noop (Next will drop connection)
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
