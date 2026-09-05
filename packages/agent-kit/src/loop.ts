import Anthropic from '@anthropic-ai/sdk';
import { extractAndParseJSON } from './json';
import type { AgentStreamEvent, RunAgentLoopOptions } from './types';

const DEFAULT_MAX_ITERATIONS = 8;
const DEFAULT_MAX_TOKENS = 4096;

export async function* runAgentLoop<TResult>(
  options: RunAgentLoopOptions<TResult>
): AsyncGenerator<AgentStreamEvent<TResult>> {
  const {
    apiKey,
    model,
    systemPrompt,
    tools,
    toolExecutors,
    initialMessage,
    maxIterations = DEFAULT_MAX_ITERATIONS,
    maxTokens = DEFAULT_MAX_TOKENS,
    resultFenceTag,
    parseResult,
  } = options;

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: initialMessage }];

  for (let i = 0; i < maxIterations; i++) {
    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      tools,
      messages,
    });

    let assistantText = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        assistantText += event.delta.text;
        yield { type: 'text', text: event.delta.text };
      }
    }

    const finalMessage = await stream.finalMessage();
    messages.push({ role: 'assistant', content: finalMessage.content });

    if (finalMessage.stop_reason === 'end_turn') {
      try {
        const json = extractAndParseJSON<unknown>(assistantText, resultFenceTag);
        yield { type: 'result', result: parseResult(json) };
      } catch (err) {
        yield {
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not parse the agent result.',
        };
      }
      yield { type: 'done' };
      return;
    }

    const toolUses = finalMessage.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    if (toolUses.length === 0) {
      yield { type: 'done' };
      return;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUses) {
      const input = toolUse.input as Record<string, unknown>;
      const entry = toolExecutors[toolUse.name];

      if (entry) {
        const describedInput = entry.describeInput ? entry.describeInput(input) : input;
        yield { type: 'tool_use', toolName: toolUse.name, input: describedInput };
        const result = await entry.executor(input);
        const summary = entry.describeResult
          ? entry.describeResult(input, result)
          : `Ran ${toolUse.name}`;
        yield { type: 'tool_result', toolName: toolUse.name, summary };
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } else {
        // Native/server-executed tool (e.g. web_search_20250305) — Anthropic
        // resolves the actual result server-side; push back an empty
        // placeholder so the loop continues.
        yield { type: 'tool_use', toolName: toolUse.name, input };
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: '' });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  yield { type: 'error', message: 'Agent exceeded maximum iterations without producing a result.' };
  yield { type: 'done' };
}
