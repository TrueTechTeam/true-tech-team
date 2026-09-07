import { describe, it, expect, vi, beforeEach } from 'vitest';

const streamMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: streamMock };
  },
}));

// Imported after the mock so loop.ts picks up the mocked SDK.
const { runAgentLoop } = await import('./loop');

interface FinalMessage {
  content: unknown[];
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

function makeStream(finalMessage: FinalMessage, deltaText?: string) {
  return {
    [Symbol.asyncIterator]: async function* () {
      if (deltaText) {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: deltaText } };
      }
    },
    finalMessage: () => Promise.resolve(finalMessage),
  };
}

describe('runAgentLoop usage tracking', () => {
  beforeEach(() => {
    streamMock.mockReset();
  });

  it('emits one usage event summing tokens across multiple tool-use turns', async () => {
    streamMock
      .mockReturnValueOnce(
        makeStream({
          content: [{ type: 'tool_use', id: 't1', name: 'noop', input: {} }],
          stop_reason: 'tool_use',
          usage: { input_tokens: 100, output_tokens: 20 },
        })
      )
      .mockReturnValueOnce(
        makeStream(
          {
            content: [{ type: 'text', text: '```result-json\n{"ok":true}\n```' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 150, output_tokens: 30 },
          },
          '```result-json\n{"ok":true}\n```'
        )
      );

    const events = [];
    for await (const event of runAgentLoop({
      apiKey: 'test-key',
      model: 'claude-opus-4-5',
      systemPrompt: 'test',
      tools: [],
      toolExecutors: { noop: { executor: async () => ({}) } },
      initialMessage: 'go',
      resultFenceTag: 'result-json',
      parseResult: (json) => json,
    })) {
      events.push(event);
    }

    expect(events).toContainEqual({
      type: 'usage',
      model: 'claude-opus-4-5',
      inputTokens: 250,
      outputTokens: 50,
    });
    // usage must arrive before done
    const usageIndex = events.findIndex((e) => e.type === 'usage');
    const doneIndex = events.findIndex((e) => e.type === 'done');
    expect(usageIndex).toBeLessThan(doneIndex);
  });

  it('passes metadata.user_id on every stream() call when userId is provided', async () => {
    streamMock.mockReturnValueOnce(
      makeStream(
        {
          content: [{ type: 'text', text: '```result-json\n{}\n```' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 10, output_tokens: 5 },
        },
        '```result-json\n{}\n```'
      )
    );

    for await (const _event of runAgentLoop({
      apiKey: 'test-key',
      model: 'claude-opus-4-5',
      systemPrompt: 'test',
      tools: [],
      toolExecutors: {},
      initialMessage: 'go',
      resultFenceTag: 'result-json',
      parseResult: (json) => json,
      userId: 'user-123',
    })) {
      // drain
    }

    expect(streamMock).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { user_id: 'user-123' } })
    );
  });

  it('does not set metadata when userId is omitted', async () => {
    streamMock.mockReturnValueOnce(
      makeStream(
        {
          content: [{ type: 'text', text: '```result-json\n{}\n```' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 10, output_tokens: 5 },
        },
        '```result-json\n{}\n```'
      )
    );

    for await (const _event of runAgentLoop({
      apiKey: 'test-key',
      model: 'claude-opus-4-5',
      systemPrompt: 'test',
      tools: [],
      toolExecutors: {},
      initialMessage: 'go',
      resultFenceTag: 'result-json',
      parseResult: (json) => json,
    })) {
      // drain
    }

    const callArgs = streamMock.mock.calls[0][0];
    expect(callArgs.metadata).toBeUndefined();
  });
});
