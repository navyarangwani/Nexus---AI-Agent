import React from 'react';
import { X, Key, Cpu, Check, Info } from 'lucide-react';
import { ProviderType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderType;
  setProvider: (p: ProviderType) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  modelName: string;
  setModelName: (m: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  provider,
  setProvider,
  apiKey,
  setApiKey,
  modelName,
  setModelName,
}) => {
  if (!isOpen) return null;

  const providers: {
    id: ProviderType;
    name: string;
    badge: string;
    desc: string;
    defaultModel: string;
    keyLabel: string;
  }[] = [
    {
      id: 'mock',
      name: 'High-Fidelity Simulator',
      badge: 'Zero API Key Required • Deterministic',
      desc: 'Deterministic evaluation engine with verified benchmarks. Instant response, zero external dependency.',
      defaultModel: 'simulator-v1',
      keyLabel: 'None Required',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      badge: 'Official API',
      desc: 'Connect to Gemini 2.0 Flash or Gemini 1.5 Pro via Google AI Studio.',
      defaultModel: 'gemini-2.0-flash',
      keyLabel: 'GEMINI_API_KEY',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      badge: 'GPT-4o / GPT-4o-mini',
      desc: 'Connect to OpenAI chat models for live planning and synthesis.',
      defaultModel: 'gpt-4o-mini',
      keyLabel: 'OPENAI_API_KEY',
    },
    {
      id: 'groq',
      name: 'Groq Cloud',
      badge: 'Sub-second Llama 3.3',
      desc: 'Ultra-low latency inference via Groq Cloud API.',
      defaultModel: 'llama-3.3-70b-versatile',
      keyLabel: 'GROQ_API_KEY',
    },
    {
      id: 'ollama',
      name: 'Local Ollama',
      badge: 'Private Local LLM',
      desc: 'Connect to an Ollama server running locally on http://localhost:11434.',
      defaultModel: 'llama3.2',
      keyLabel: 'None Required',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#111114] rounded-2xl p-6 border border-white/[0.1] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm font-mono text-zinc-100 uppercase tracking-wider">
                Inference Engine & Keys
              </h3>
              <p className="text-xs text-zinc-400 font-sans">Configure live LLM connectivity or offline evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Cards */}
        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {providers.map((p) => {
            const isSelected = provider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                  if (!modelName || modelName.includes('-')) {
                    setModelName(p.defaultModel);
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900/90 border-zinc-400 ring-1 ring-zinc-400/40'
                    : 'bg-zinc-950/60 border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-200">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-zinc-100" />}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* API Key Input */}
        {provider !== 'mock' && provider !== 'ollama' && (
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-zinc-400" />
                API KEY // {provider.toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-500">Session only</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste your ${provider.toUpperCase()} key...`}
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>
        )}

        {/* Model Name Input */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-zinc-400 block">MODEL IDENTIFIER</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g. gemini-2.5-flash, gpt-4o-mini"
            className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] flex items-start gap-2 text-[11px] text-zinc-400 font-mono">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zinc-500" />
          <span>The High-Fidelity Simulator runs 100% offline with zero external dependencies and reproducible benchmarks.</span>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-medium text-xs shadow-sm transition-all"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
