import {
  CompleteResearchResponse,
  ChaosInjectionConfig,
  ProviderType,
  StreamEvent,
  BenchmarkSummary
} from './types';

export interface ResearchStreamParams {
  query: string;
  provider: ProviderType;
  apiKey?: string;
  modelName?: string;
  chaosConfig?: ChaosInjectionConfig;
  includeBaseline?: boolean;
  onEvent: (event: StreamEvent) => void;
  onError: (err: Error) => void;
  onDone: (result?: CompleteResearchResponse) => void;
}

export async function startResearchStream(params: ResearchStreamParams): Promise<() => void> {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: params.query,
          provider: params.provider,
          api_key: params.apiKey || undefined,
          model_name: params.modelName || undefined,
          include_baseline_comparison: params.includeBaseline ?? true,
          chaos_config: params.chaosConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream not supported by browser.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalResult: CompleteResearchResponse | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;
          const dataMatch = block.match(/data:\s*(.*)/);
          if (dataMatch) {
            try {
              const event: StreamEvent = JSON.parse(dataMatch[1]);
              params.onEvent(event);
              if (event.event_type === 'complete' && event.data?.result) {
                finalResult = event.data.result;
              }
            } catch (e) {
              console.error('Failed to parse SSE payload:', block, e);
            }
          }
        }
      }

      params.onDone(finalResult);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        params.onError(err);
      }
    }
  })();

  return () => {
    controller.abort();
  };
}

export async function runBenchmarkSuite(
  provider: ProviderType = 'mock',
  apiKey: string = '',
  modelName: string = ''
): Promise<BenchmarkSummary> {
  const response = await fetch('/api/evals/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, api_key: apiKey, model_name: modelName }),
  });
  if (!response.ok) {
    throw new Error(`Eval benchmark failed with status ${response.status}`);
  }
  return await response.json();
}
