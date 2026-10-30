import React from 'react';
import { ShieldAlert, Cpu, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ProviderType } from '../types';

interface HeaderProps {
  activeTab: 'research' | 'evals' | 'architecture';
  setActiveTab: (tab: 'research' | 'evals' | 'architecture') => void;
  provider: ProviderType;
  onOpenSettings: () => void;
  onOpenChaos: () => void;
  onOpenArchitecture: () => void;
  hasActiveChaos: boolean;
  isTourOpen: boolean;
  onToggleTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  provider,
  onOpenSettings,
  onOpenChaos,
  onOpenArchitecture,
  hasActiveChaos,
  isTourOpen,
  onToggleTour,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Title - Clean Architectural Style */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs tracking-wider text-white shadow-inner">
            NX
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100 font-mono">
                NEXUS<span className="text-zinc-600 font-light mx-1.5">/</span>RESEARCH
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-sans hidden sm:block">
              Living Intelligence Graph & Hallucination Guardrails
            </span>
          </div>
        </div>

        {/* Center Navigation - Minimalist Segmented Pill */}
        <nav className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('research')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'research'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Intelligence Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('evals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'evals'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benchmark Evals</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 ml-0.5">
              5/5
            </span>
          </button>

          <button
            onClick={() => onOpenArchitecture()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture Docs</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Tour Dossier Button */}
          <button
            onClick={onToggleTour}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              isTourOpen
                ? 'bg-zinc-100 text-zinc-950 border-white font-medium shadow-sm'
                : 'bg-zinc-900/80 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
            }`}
            title="Toggle Side Explanation Dossier"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Dossier</span>
          </button>

          {/* Chaos / Fault Sandbox */}
          <button
            onClick={onOpenChaos}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              hasActiveChaos
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/80 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
            }`}
            title="Inject simulated latency, corrupt payloads, and adversarial injection"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${hasActiveChaos ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Fault Mode</span>
            {hasActiveChaos && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Engine / Provider Selector */}
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900/80 border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/15 transition-all flex items-center gap-1.5"
            title="Configure LLM Provider & Credentials"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="uppercase text-[11px] tracking-wide">
              {provider === 'mock' ? 'SIM-v1' : provider}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
