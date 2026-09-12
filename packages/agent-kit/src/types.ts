import type Anthropic from '@anthropic-ai/sdk';

export type AgentStreamEvent<TResult = unknown> =
  | { type: 'tool_use'; toolName: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; summary: string }
  | { type: 'text'; text: string }
  | { type: 'result'; result: TResult }
  | { type: 'error'; message: string }
  | { type: 'done' };

export type ToolExecutorFn = (input: Record<string, unknown>) => Promise<unknown>;

export interface ToolExecutorEntry {
  executor: ToolExecutorFn;
  /** Shapes the input echoed in the tool_use event (e.g. strip large payloads) */
  describeInput?: (input: Record<string, unknown>) => Record<string, unknown>;
  /** Produces the human-readable summary for the tool_result event */
  describeResult?: (input: Record<string, unknown>, result: unknown) => string;
}

export interface RunAgentLoopOptions<TResult> {
  apiKey: string;
  model: string;
  systemPrompt: string;
  // Anthropic.ToolUnion covers both custom tools (Tool, with input_schema) and
  // native server-executed tools (e.g. WebSearchTool20250305).
  tools: Anthropic.ToolUnion[];
  // Keyed by tool name. A tool present in `tools` but absent here is treated
  // as native/server-executed — see loop.ts.
  toolExecutors: Record<string, ToolExecutorEntry>;
  initialMessage: string;
  maxIterations?: number; // default 8
  maxTokens?: number; // default 4096
  resultFenceTag: string; // e.g. 'recipe-json' | 'jobs-json' | 'resume-json' | 'critique-json'
  parseResult: (json: unknown) => TResult;
  // Per-request timeout (ms) passed to the Anthropic client. Left undefined
  // preserves the SDK's own default (10 minutes, retried up to maxRetries
  // times) — set explicitly for agents that can run long, open-ended
  // server-tool loops (e.g. web_search) so a stalled request fails fast
  // with a clear error instead of hanging far longer than any caller expects.
  timeoutMs?: number;
  // Overall wall-clock budget (ms) for the whole loop, checked once per
  // iteration. Left undefined preserves existing behavior (no cap).
  maxTotalDurationMs?: number;
}
