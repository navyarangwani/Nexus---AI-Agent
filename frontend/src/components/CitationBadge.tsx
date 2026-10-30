import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { FilteredSource } from '../types';

interface CitationBadgeProps {
  tag: string; // e.g. "[1]"
  source?: FilteredSource;
  onClickSource?: (sourceId: number) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  tag,
  source,
  onClickSource,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        onClick={() => {
          if (source && onClickSource) {
            onClickSource(source.source_id);
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="px-1.5 py-0.2 text-[11px] font-mono font-medium rounded bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-white/[0.08] transition-all cursor-pointer"
      >
        {tag}
      </button>

      {/* Tooltip on hover */}
      {showTooltip && source && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 rounded-xl bg-[#141418] border border-white/15 shadow-2xl z-50 text-left pointer-events-none animate-in fade-in duration-100">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1 border-b border-white/[0.06] pb-1">
            <span className="font-bold text-zinc-300">{tag} VERIFIED EVIDENCE</span>
            <span className="text-emerald-400">Score: {source.relevance_score}</span>
          </div>
          <div className="text-xs font-semibold text-zinc-100 truncate">{source.title}</div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">{source.domain}</div>
          <p className="text-[11px] text-zinc-300 mt-1.5 line-clamp-3 leading-snug font-sans">
            "{source.snippet}"
          </p>
          <div className="text-[9px] text-zinc-500 font-mono mt-1.5 flex items-center gap-1">
            <ExternalLink className="w-2.5 h-2.5" /> Click to jump to source
          </div>
        </div>
      )}
    </span>
  );
};
