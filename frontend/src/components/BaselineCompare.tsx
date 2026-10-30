import React from 'react';
import { Scale, CheckCircle2, XCircle } from 'lucide-react';
import { BaselineComparison, StructuredFinalAnswer } from '../types';

interface BaselineCompareProps {
  baseline: BaselineComparison;
  agentAnswer: StructuredFinalAnswer;
}

export const BaselineCompare: React.FC<BaselineCompareProps> = ({
  baseline,
  agentAnswer,
}) => {
  return (
    <div className="w-full bg-[#111114] rounded-2xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-zinc-300" />
          <h3 className="font-mono font-medium text-xs sm:text-sm text-zinc-200 uppercase tracking-wider">
            Comparative Matrix // Direct Zero-Shot LLM vs. Autonomous Agent
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10 uppercase">
          A/B Delta Audit
        </span>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Direct Non-Agentic Baseline */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <XCircle className="w-3.5 h-3.5 text-zinc-500" />
              Direct Zero-Shot LLM (No Agent)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-white/[0.04]">
              0 Citations • Static
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed italic bg-zinc-900/40 p-3 rounded-lg border border-white/[0.03] font-sans">
            "{baseline.direct_llm_answer}"
          </p>
          <div className="text-[11px] space-y-1 pt-1 font-mono">
            <div className="text-zinc-500 font-semibold uppercase text-[10px]">Identified Hallucinations / Deficits:</div>
            <ul className="space-y-1 list-disc list-inside text-zinc-400 pl-1 font-sans">
              {baseline.hallucination_differences.map((diff, i) => (
                <li key={i}>{diff}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Agentic Workflow */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous Production Agent
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {agentAnswer.sources_used.length} Verified Sources
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-white/[0.03] font-sans">
            {agentAnswer.short_answer}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.04]">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Freshness Advantage</span>
              <p className="text-zinc-300 text-[11px] mt-0.5 font-sans">{baseline.freshness_advantage}</p>
            </div>
            <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.04]">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Grounding Advantage</span>
              <p className="text-zinc-300 text-[11px] mt-0.5 font-sans">{baseline.grounding_advantage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
