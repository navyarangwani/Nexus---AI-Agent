import React from 'react';
import {
  ListTree,
  Wrench,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { CompleteResearchResponse } from '../types';

interface StepInspectorProps {
  activeNode: string;
  result?: CompleteResearchResponse;
  onSelectSource?: (sourceId: number) => void;
}

export const StepInspector: React.FC<StepInspectorProps> = ({
  activeNode,
  result,
}) => {
  if (!result) return null;

  return (
    <div className="w-full bg-[#111114] rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl space-y-4">
      {/* 01: Plan Inspector */}
      {activeNode === 'plan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4 text-zinc-300" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-zinc-200">
                01 // Research Intent & Step Breakdown
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {result.plan.steps.length} Sub-Tasks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Target Intent</span>
              <p className="text-zinc-200 leading-relaxed font-sans">{result.plan.query_intent}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Clarified Objective</span>
              <p className="text-zinc-200 leading-relaxed font-sans">{result.plan.clarified_objective}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Execution Sequence
            </span>
            <div className="space-y-2">
              {result.plan.steps.map((s) => (
                <div
                  key={s.step_id}
                  className="p-3.5 rounded-xl bg-zinc-950/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/10">
                        STEP 0{s.step_id}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">{s.title}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">{s.rationale}</p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 pt-0.5">
                      <span>Tool: <strong className="text-zinc-300">{s.tool_name}</strong></span>
                      <span>•</span>
                      <span>Query: <code className="text-zinc-400">"{s.tool_query}"</code></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
                    {s.duration_ms && (
                      <span className="text-zinc-500">{Math.round(s.duration_ms)}ms</span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 02: Tools Inspector */}
      {activeNode === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-zinc-300" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-zinc-200">
                02 // Tool Execution & Telemetry
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {result.tool_results.length} Tools Invoked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.tool_results.map((tr, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200 font-mono text-xs">{tr.tool_name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">STEP 0{tr.step_id}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      tr.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : tr.status === 'repaired'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {tr.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 font-mono text-[11px] text-zinc-400 border-y border-white/[0.04]">
                  <div>Latency: <strong className="text-zinc-200">{Math.round(tr.latency_ms)}ms</strong></div>
                  <div>Items: <strong className="text-zinc-200">{tr.items.length}</strong></div>
                  <div>Retries: <strong className="text-zinc-200">{tr.retry_count}</strong></div>
                </div>

                {tr.error_details && (
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                    <strong>Fault Log:</strong> {tr.error_details}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                    Extracted Excerpts
                  </span>
                  {tr.items.slice(0, 2).map((it, i) => (
                    <div key={i} className="p-2 rounded bg-zinc-900/50 border border-white/[0.03] text-zinc-300">
                      <div className="font-medium text-xs text-zinc-200 truncate">{it.title}</div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 font-sans">{it.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 03: Filter Inspector */}
      {activeNode === 'filter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-300" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-zinc-200">
                03 // Information Filter & Relevance Yield
              </h4>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400">
                Kept: {result.metrics.filtered_sources_kept}
              </span>
              <span className="text-zinc-500">
                Discarded: {result.all_sources.length - result.metrics.filtered_sources_kept}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {result.all_sources.map((src) => (
              <div
                key={src.source_id}
                className={`p-3 rounded-xl border transition-all ${
                  src.kept
                    ? 'bg-zinc-950/60 border-white/[0.06]'
                    : 'bg-zinc-950/20 border-white/[0.03] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                          src.kept
                            ? 'bg-zinc-800 text-zinc-200 border border-white/10'
                            : 'bg-zinc-900 text-zinc-600'
                        }`}
                      >
                        {src.citation_tag}
                      </span>
                      <span className="font-medium text-zinc-200 font-sans">{src.title}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">({src.domain})</span>
                    </div>
                    <p className="text-zinc-400 line-clamp-2 font-sans">{src.snippet}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0 font-mono">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        src.relevance_score >= 0.6
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : src.relevance_score >= 0.35
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      SCORE: {src.relevance_score}
                    </span>
                    {src.kept ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> DROPPED
                      </span>
                    )}
                  </div>
                </div>

                {src.discard_reason && (
                  <div className="mt-2 text-[11px] p-1.5 rounded bg-zinc-900/80 border border-white/[0.05] text-zinc-400 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{src.discard_reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 04: Synthesis Inspector */}
      {activeNode === 'synth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-300" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-zinc-200">
                04 // Structured Output Attribution
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Confidence: {result.final_answer.confidence_level} ({Math.round(result.final_answer.confidence_score * 100)}%)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Short Answer</span>
              <p className="text-zinc-200 leading-relaxed font-sans">{result.final_answer.short_answer}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Confidence Assessment</span>
              <p className="text-zinc-300 font-sans">{result.final_answer.confidence_rationale}</p>
            </div>
          </div>
        </div>
      )}

      {/* 05: Judge Inspector */}
      {activeNode === 'judge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono text-zinc-200">
                05 // Hallucination Verification Matrix
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {result.judge_result.faithfulness_score}% Faithfulness
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                Risk: {result.judge_result.hallucination_risk}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-white/[0.06] font-mono leading-relaxed">
            {result.judge_result.judgment_summary}
          </p>

          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Claim Attribution Audit Trail
            </span>
            {result.judge_result.claims_matrix.map((c) => (
              <div
                key={c.claim_id}
                className={`p-3 rounded-xl border transition-all ${
                  c.is_grounded
                    ? 'bg-zinc-950/60 border-white/[0.06]'
                    : 'bg-rose-950/20 border-rose-800/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                        CLAIM 0{c.claim_id}
                      </span>
                      {c.cited_source_ids.length > 0 && (
                        <span className="text-[10px] text-zinc-400">
                          Sources: {c.cited_source_ids.map((id) => `[${id}]`).join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-200 font-sans">{c.claim_text}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">{c.verification_notes}</p>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs flex-shrink-0">
                    {c.is_grounded ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> GROUNDED ({Math.round(c.grounding_confidence * 100)}%)
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> UNGROUNDED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
