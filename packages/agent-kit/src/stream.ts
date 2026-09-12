import type { AgentStreamEvent } from './types';

// Wraps an agent event generator into the NDJSON streaming Response shape
// used by every agent API route: one JSON object per line.
export function toNdjsonResponse<TResult>(
  generator: AsyncGenerator<AgentStreamEvent<TResult>>
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          if (event.type === 'done') {
            break;
          }
        }
      } catch (err) {
        console.error('[agent-kit] agent loop threw before completing:', err);
        const errorEvent: AgentStreamEvent<TResult> = {
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        };
        controller.enqueue(encoder.encode(`${JSON.stringify(errorEvent)}\n`));
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: 'done' })}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
