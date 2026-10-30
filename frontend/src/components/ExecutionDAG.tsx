import React from 'react';
import {
  ListTree,
  Wrench,
  Filter,
  FileText,
  ShieldCheck,
  Check,
  Clock,
  Activity
} from 'lucide-react';
import { CompleteResearchResponse, StreamEvent } from '../types';

interface ExecutionDAGProps {
  currentEvent?: StreamEvent;
  finalResult?: CompleteResearchResponse;
  activeInspectNode: string;
  setActiveInspectNode: (node: string) => void;
  isLoading: boolean;
}

export const ExecutionDAG: React.FC<ExecutionDAGProps> = ({
  currentEvent,
  finalResult,
  activeInspectNode,
  setActiveInspectNode,
  isLoading,
}) => {
  const currentStep = currentEvent?.step_index ?? (finalResult ? 7 : 0);

  const nodes = [
    {
      id: 'plan',
      stepNum: 1,
      tag: '01 / PLAN',
      title: 'Intent Deconstruction',
      icon: ListTree,
      duration: finalResult?.metrics.planning_latency_ms,
      desc: finalResult?.plan ? `${finalResult.plan.steps.length} sub-steps mapped` : 'Parsing query intent',
    },
    {
      id: 'tools',
      stepNum: 2,
      tag: '02 / TOOLS',
      title: 'Parallel Ingestion',
      icon: Wrench,
      duration: finalResult?.metrics.tool_execution_latency_ms,
      desc: finalResult?.tool_results
        ? `${finalResult.tool_results.length} tools executed`
        : 'Querying search & specs',
    },
    {
      id: 'filter',
      stepNum: 3,
      tag: '03 / FILTER',
      title: 'Noise & Injection Filter',
      icon: Filter,
      duration: finalResult?.metrics.filtering_latency_ms,
      desc: finalResult?.all_sources
        ? `${finalResult.metrics.filtered_sources_kept} kept / ${finalResult.metrics.total_sources_gathered} raw`
        : 'Screening relevance',
    },
    {
      id: 'synth',
      stepNum: 4,
      tag: '04 / SYNTHESIS',
      title: 'Structured Synthesis',
      icon: FileText,
      duration: finalResult?.metrics.synthesis_latency_ms,
      desc: finalResult?.final_answer
        ? `${finalResult.final_answer.key_findings.length} findings cited`
        : 'Attributing evidence',
    },
    {
      id: 'judge',
      stepNum: 5,
      tag: '05 / JUDGE',
      title: 'Hallucination Guardrail',
      icon: ShieldCheck,
      duration: finalResult?.metrics.judge_latency_ms,
      desc: finalResult?.judge_result
        ? `${finalResult.judge_result.faithfulness_score}% Faithfulness`
        : 'Verifying claims vs facts',
    },
  ];

  return (
    <div className="w-full bg-[#111114] rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl space-y-3.5">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
            Orchestration Graph // Execution Telemetry
          </h3>
        </div>
        {finalResult && (
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              Latency: <strong className="text-zinc-200">{(finalResult.metrics.total_latency_ms / 1000).toFixed(2)}s</strong>
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="hidden sm:flex items-center gap-1.5">
              Tokens: <strong className="text-zinc-200">{finalResult.metrics.tokens_prompt + finalResult.metrics.tokens_completion}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Graph Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isDone = currentStep > node.stepNum || (!isLoading && !!finalResult);
          const isCurrent = isLoading && currentStep === node.stepNum;
          const isSelected = activeInspectNode === node.id;

          let borderStyle = 'border-white/[0.06] bg-zinc-950/40 text-zinc-500';
          let iconColor = 'text-zinc-600';

          if (isDone) {
            borderStyle = isSelected
              ? 'border-zinc-400 bg-zinc-900/90 text-zinc-100 shadow-sm'
              : 'border-white/[0.08] bg-zinc-900/40 text-zinc-300 hover:border-white/20';
            iconColor = 'text-emerald-400';
          } else if (isCurrent) {
            borderStyle = 'border-zinc-400/80 bg-zinc-900 text-zinc-100';
            iconColor = 'text-white animate-pulse';
          }

          return (
            <button
              key={node.id}
              onClick={() => setActiveInspectNode(node.id)}
              disabled={!isDone && !isCurrent}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[105px] cursor-pointer ${borderStyle}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-medium">
                  {node.tag}
                </span>
                {isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </span>
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-200">
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                  <span className="truncate">{node.title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{node.desc}</p>
              </div>

              <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span>{node.duration ? `${Math.round(node.duration)}ms` : isCurrent ? 'RUNNING' : 'QUEUED'}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400">Inspect &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Streaming Event Live Indicator */}
      {isLoading && currentEvent && (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{currentEvent.message}</span>
        </div>
      )}
    </div>
  );
};
