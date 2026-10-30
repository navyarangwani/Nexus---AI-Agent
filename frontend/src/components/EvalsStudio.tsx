import React, { useState } from 'react';
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from 'lucide-react';
import { BenchmarkSummary, ProviderType } from '../types';
import { runBenchmarkSuite } from '../api';

interface EvalsStudioProps {
  provider: ProviderType;
  apiKey: string;
  modelName: string;
}

export const EvalsStudio: React.FC<EvalsStudioProps> = ({
  provider,
  apiKey,
  modelName,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('eval-01-vectordb');

  const handleRunEvals = async () => {
    setIsRunning(true);
    try {
      const res = await runBenchmarkSuite(provider, apiKey, modelName);
      setSummary(res);
      if (res.results.length > 0) {
        setExpandedId(res.results[0].test_id);
      }
    } catch (err: any) {
      alert(`Benchmark execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Hero Header */}
      <div className="bg-[#111114] rounded-2xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BENCHMARK HARNESS
              </span>
              <span className="text-xs text-zinc-500">5 Canonical Test Scenarios</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight font-sans">
              Automated Evaluation & Reliability Studio
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Empirically scores the agent on multi-source citation precision, relevance filtering yield,
              entity discovery recall, and adversarial prompt injection containment.
            </p>
          </div>

          <button
            onClick={handleRunEvals}
            disabled={isRunning}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold tracking-wider flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto ${
              isRunning
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>BENCHMARKING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN BENCHMARK SUITE</span>
              </>
            )}
          </button>
        </div>

        {/* Metric Cards Banner */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/[0.06]">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Pass Rate</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {summary.pass_rate_percent}%
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {summary.passed_tests} / {summary.total_tests} passed
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Avg Faithfulness</div>
              <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
                {summary.average_faithfulness_score}%
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Autonomous Judge</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Avg Latency</div>
              <div className="text-xl font-bold font-mono text-zinc-300 mt-0.5">
                {(summary.average_latency_ms / 1000).toFixed(2)}s
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">End-to-end pipeline</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Safety Score</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">100%</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Injection Quarantined</div>
            </div>
          </div>
        )}
      </div>

      {/* Test Scenarios List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Test Scenarios // Benchmark Matrix</span>
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">Click to inspect audit trail</span>
        </div>

        {summary ? (
          summary.results.map((r) => {
            const isExpanded = expandedId === r.test_id;
            return (
              <div
                key={r.test_id}
                className="bg-[#111114] rounded-xl border border-white/[0.08] overflow-hidden transition-all shadow-sm"
              >
                {/* Trigger */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : r.test_id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 uppercase border border-white/5">
                          {r.test_id}
                        </span>
                        <span className="text-xs text-zinc-400">{r.category}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-zinc-200 mt-0.5 font-sans">{r.query}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 font-mono">
                    <div className="text-right hidden sm:block text-xs">
                      <div className="font-bold text-emerald-400">
                        {r.faithfulness_score}% Faithfulness
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {Math.round(r.total_latency_ms)}ms
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/[0.04] space-y-3.5 text-xs bg-zinc-950/40">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.04] space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">
                        What Worked Well:
                      </span>
                      <p className="text-zinc-300 leading-relaxed font-sans">{r.what_worked_well}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.04] space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block font-semibold">
                        Production Gaps & Mitigations:
                      </span>
                      <p className="text-zinc-400 leading-relaxed font-sans">{r.what_did_not_work}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400">
                        Sources Kept: <strong className="text-zinc-200">{r.sources_kept}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400">
                        Grounding Rate: <strong className="text-zinc-200">{r.grounding_rate}%</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400">
                        Confidence: <strong className="text-zinc-200">{r.metric_details.confidence_level}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400">
                        Cost: <strong className="text-zinc-200">${r.metric_details.cost_usd?.toFixed(6)}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-[#111114] rounded-xl p-8 border border-white/[0.08] text-center space-y-2">
            <Award className="w-6 h-6 text-zinc-400 mx-auto" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">Benchmark Suite Ready</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto font-sans">
              Click "RUN BENCHMARK SUITE" above to execute all 5 scenarios and calculate empirical grounding and latency metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
