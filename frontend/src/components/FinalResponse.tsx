import React, { useState } from 'react';
import {
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { CompleteResearchResponse, FilteredSource } from '../types';
import { CitationBadge } from './CitationBadge';

interface FinalResponseProps {
  result: CompleteResearchResponse;
  highlightedSourceId?: number | null;
  setHighlightedSourceId: (id: number | null) => void;
}

export const FinalResponse: React.FC<FinalResponseProps> = ({
  result,
  highlightedSourceId,
  setHighlightedSourceId,
}) => {
  const [copied, setCopied] = useState(false);
  const answer = result.final_answer;
  const sourcesMap = new Map<number, FilteredSource>(
    result.all_sources.filter((s) => s.kept).map((s) => [s.source_id, s])
  );

  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const sourceId = parseInt(match[1], 10);
        const source = sourcesMap.get(sourceId);
        return (
          <CitationBadge
            key={i}
            tag={part}
            source={source}
            onClickSource={(id) => {
              setHighlightedSourceId(id);
              const el = document.getElementById(`source-card-${id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    let md = `# Research Report: ${answer.user_question}\n\n`;
    md += `## Short Answer\n${answer.short_answer}\n\n`;
    md += `## Key Findings\n`;
    answer.key_findings.forEach((kf) => {
      md += `### ${kf.id}. ${kf.title}\n${kf.finding}\n\n`;
    });
    md += `## Sources Used\n`;
    answer.sources_used.forEach((s) => {
      md += `- ${s.citation_tag} [${s.title}](${s.url}) (${s.domain}, Relevance: ${s.relevance_score})\n  > "${s.key_excerpt}"\n`;
    });
    md += `\n## Confidence Assessment\n- Level: ${answer.confidence_level} (${Math.round(answer.confidence_score * 100)}%)\n- Rationale: ${answer.confidence_rationale}\n\n`;
    md += `## Limitations & Assumptions\n`;
    answer.limitations_or_assumptions.forEach((lim) => {
      md += `- ${lim}\n`;
    });
    md += `\n## Suggested Next Steps\n`;
    answer.suggested_next_steps.forEach((step) => {
      md += `- ${step}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-[#111114] rounded-2xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-white/10">
              SYNTHESIS DOSSIER
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                answer.confidence_level === 'High'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : answer.confidence_level === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              CONFIDENCE: {answer.confidence_level} ({Math.round(answer.confidence_score * 100)}%)
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight font-sans">
            {answer.user_question}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/15 text-zinc-300 transition-all flex items-center gap-1.5 shadow-sm"
            title="Copy structured response as JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
          </button>
          <button
            onClick={downloadMarkdown}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-zinc-100 hover:bg-white text-zinc-950 font-medium transition-all flex items-center gap-1.5 shadow-sm"
            title="Export markdown report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .MD</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Summary - Clean Left Accent Border */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/70 border-l-2 border-l-zinc-300 border-y border-r border-white/[0.05] space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
          Executive Summary
        </span>
        <p className="text-zinc-100 text-sm leading-relaxed font-sans">
          {answer.short_answer}
        </p>
      </div>

      {/* 2. Key Grounded Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Key Grounded Findings</span>
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            {answer.key_findings.length} Attributed Points
          </span>
        </div>

        <div className="space-y-2.5">
          {answer.key_findings.map((kf) => (
            <div
              key={kf.id}
              className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06] hover:border-white/15 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-zinc-200 flex items-center gap-2 font-sans">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                    0{kf.id}
                  </span>
                  <span>{kf.title}</span>
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-white/[0.04]">
                  {kf.confidence}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {renderTextWithCitations(kf.finding)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sources Used Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-300" />
            <span>Verified Sources & Grounding Artifacts</span>
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            {answer.sources_used.length} Verified Sources
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {answer.sources_used.map((src) => {
            const isHighlighted = highlightedSourceId === src.source_id;
            return (
              <div
                id={`source-card-${src.source_id}`}
                key={src.source_id}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                  isHighlighted
                    ? 'bg-zinc-900/90 border-zinc-400 ring-1 ring-zinc-400/50'
                    : 'bg-zinc-950/60 border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold border border-white/10">
                      {src.citation_tag}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-200 hover:text-white transition-colors truncate flex items-center gap-1 font-sans"
                    >
                      <span className="truncate">{src.title}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    </a>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    REL: {src.relevance_score}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 truncate">
                  Domain: <span className="text-zinc-400">{src.domain}</span>
                </div>

                <p className="text-zinc-400 line-clamp-2 leading-snug italic bg-zinc-900/40 p-2 rounded-lg border border-white/[0.03] font-sans">
                  "{src.key_excerpt}"
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Limitations & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06] space-y-2">
          <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Limitations & Assumptions</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
            {answer.limitations_or_assumptions.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-zinc-600 mt-0.5">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06] space-y-2">
          <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Recommended Next Steps</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
            {answer.suggested_next_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono text-[10px] mt-0.5">&rarr;</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
