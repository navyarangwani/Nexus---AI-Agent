import React from 'react';
import { X, ShieldAlert, RefreshCcw, Check } from 'lucide-react';
import { ChaosInjectionConfig } from '../types';

interface ChaosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChaosInjectionConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChaosInjectionConfig>>;
}

export const ChaosDrawer: React.FC<ChaosDrawerProps> = ({
  isOpen,
  onClose,
  config,
  setConfig,
}) => {
  if (!isOpen) return null;

  const toggleOption = (key: keyof ChaosInjectionConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAll = () => {
    setConfig({
      simulate_tool_timeout: false,
      simulate_malformed_tool_output: false,
      simulate_prompt_injection: false,
      simulate_empty_results: false,
      simulate_rate_limit: false,
    });
  };

  const hasActiveChaos = Object.values(config).some(Boolean);

  const options: {
    key: keyof ChaosInjectionConfig;
    title: string;
    desc: string;
    expectedRecovery: string;
  }[] = [
    {
      key: 'simulate_tool_timeout',
      title: 'Simulate Tool Timeout & Network Drop',
      desc: 'Forces downstream tools to exceed latency deadlines.',
      expectedRecovery: 'Exponential backoff retries (up to 2x); circuit breaker opens on repeated failure.',
    },
    {
      key: 'simulate_malformed_tool_output',
      title: 'Simulate Corrupt / Malformed Tool JSON',
      desc: 'Injects unparseable non-compliant raw tool payloads.',
      expectedRecovery: 'Pydantic validation layer catches malformed chunk and synthesizes fallback item.',
    },
    {
      key: 'simulate_prompt_injection',
      title: 'Simulate Adversarial Prompt Injection',
      desc: 'Injects malicious override instructions into public content.',
      expectedRecovery: 'Information filter sanitizes instruction tokens and quarantines untrusted content.',
    },
    {
      key: 'simulate_empty_results',
      title: 'Simulate Empty Search Results (Zero Lookup)',
      desc: 'Forces external search engines to return 0 items.',
      expectedRecovery: 'Synthesizer detects evidence deficit, reports Low confidence (15%), and outputs next steps.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#111114] rounded-2xl p-6 border border-white/[0.1] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm font-mono text-zinc-100 uppercase tracking-wider">
                Fault Simulation Sandbox
              </h3>
              <p className="text-xs text-zinc-400">Inject real-world failure modes to evaluate recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-2.5">
          {options.map((opt) => {
            const isActive = config[opt.key];
            return (
              <div
                key={opt.key}
                onClick={() => toggleOption(opt.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900/90 border-zinc-400 ring-1 ring-zinc-400/40'
                    : 'bg-zinc-950/60 border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-zinc-200">{opt.title}</span>
                      {isActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">{opt.desc}</p>
                    <div className="text-[11px] text-zinc-400 font-mono mt-1 pt-1 border-t border-white/[0.04]">
                      <strong>Expected:</strong> {opt.expectedRecovery}
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${
                      isActive ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono">
          <button
            onClick={resetAll}
            disabled={!hasActiveChaos}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              hasActiveChaos
                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Reset Faults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-medium tracking-wider shadow-sm transition-all"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
