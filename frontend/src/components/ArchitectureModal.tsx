import React, { useState } from 'react';
import { X, BookOpen, Cpu, ShieldCheck, Wrench, Activity, AlertTriangle, Layers, DollarSign } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'why' | 'tools' | 'bad_results' | 'hallucinations' | 'production' | 'monitoring' | 'tradeoffs'>('why');

  if (!isOpen) return null;

  const sections = [
    { id: 'why', title: '1. Why Agentic Approach?', icon: Cpu },
    { id: 'tools', title: '2. Tools Used & Rationale', icon: Wrench },
    { id: 'bad_results', title: '3. Handling Bad Tool Results', icon: AlertTriangle },
    { id: 'hallucinations', title: '4. Reducing Hallucinations', icon: ShieldCheck },
    { id: 'production', title: '5. Making it Production-Ready', icon: Layers },
    { id: 'monitoring', title: '6. Production Observability', icon: Activity },
    { id: 'tradeoffs', title: '7. Engineering Tradeoffs', icon: DollarSign },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#111114] rounded-2xl border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm font-mono text-zinc-100 uppercase tracking-wider">
                System Design & Production Architecture
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Comprehensive answers to the 7 core engineering evaluation questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/[0.06] p-3 space-y-1 bg-zinc-950/40 overflow-y-auto">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto text-xs sm:text-sm text-zinc-300 space-y-4 leading-relaxed font-sans">
            {activeSection === 'why' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">1. Why did you choose an agentic approach here?</h4>
                <p>
                  A research-style query (e.g. <em>"Compare open-source vector DBs for startup RAG"</em> or <em>"Indian HR tech SaaS landscape"</em>) cannot be reliably answered by a standard zero-shot LLM for three fundamental reasons:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-300">
                  <li><strong>Knowledge Drift & Training Cutoffs:</strong> Static weights cannot know 2026 releases (e.g. Qdrant v1.12+, Weaviate v1.28+, current funding rounds).</li>
                  <li><strong>Lack of Traceability & Hallucination:</strong> Standard LLMs invent plausible-sounding benchmarks (e.g. claiming Pinecone is open-source or confusing US startups with Indian startups) without primary evidence.</li>
                  <li><strong>Multi-Dimensional Problem Deconstruction:</strong> High quality research requires decomposing queries into architectural specs, empirical benchmarks, and operational costs. An agent dynamically plans sub-queries, dispatches tools in parallel, and filters noise before synthesizing conclusions.</li>
                </ul>
              </div>
            )}

            {activeSection === 'tools' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">2. What tools did you use, and why?</h4>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
                    <span className="font-mono text-xs font-semibold text-zinc-200 block mb-0.5">1. WebSearchTool (DuckDuckGo + Resilient Knowledge Corpus)</span>
                    <p className="text-zinc-400">Gathers live industry news, market funding, pricing disclosures, and community discussions. Includes a curated local fallback corpus ensuring 100% test reproducibility when downstream search engines rate-limit.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
                    <span className="font-mono text-xs font-semibold text-zinc-200 block mb-0.5">2. TechDocsTool (Architecture & Specification Analyzer)</span>
                    <p className="text-zinc-400">Retrieves deep engineering parameters: memory footprints (Rust vs Go vs C++), indexing algorithms (HNSW, DiskANN, IVF-PQ), payload filtering latency, and multi-tenant partitioning.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06]">
                    <span className="font-mono text-xs font-semibold text-zinc-200 block mb-0.5">3. WebScraperTool with Prompt Injection Defense</span>
                    <p className="text-zinc-400">Extracts long-form documentation from URLs while actively scanning for and defusing indirect prompt injection attack tokens before content reaches the LLM context window.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'bad_results' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">3. How does the system handle bad tool results?</h4>
                <p>Real-world external APIs and scrapers fail constantly. Our production agent guards against 4 major fault modes:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Timeouts & Drops</strong>
                    <p className="text-zinc-400 text-xs">Wrapped in 8s hard deadlines with exponential backoff (up to 2 retries). If retries fail, a Circuit Breaker trips to prevent latency cascading.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Malformed Payloads</strong>
                    <p className="text-zinc-400 text-xs">Pydantic v2 schemas intercept invalid structures. A self-healing fallback synthesizes normalized schemas so the pipeline never crashes.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Noisy / Irrelevant Results</strong>
                    <p className="text-zinc-400 text-xs">The InformationFilter calculates a relevance score (0.0–1.0) and de-duplicates &gt;70% semantic overlaps, discarding low-signal fluff.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Empty Results / Deficits</strong>
                    <p className="text-zinc-400 text-xs">If zero sources pass filters, the Synthesizer gracefully downgrades confidence to 'Low' (15%) and returns actionable next steps.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'hallucinations' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">4. How do you reduce hallucinations?</h4>
                <p>We deploy a multi-layered defense-in-depth architecture:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-300">
                  <li><strong>Constrained Synthesis:</strong> The LLM is strictly instructed to only assert claims backed by filtered context and format every sentence with citation tags e.g. <code>[1]</code>, <code>[2]</code>.</li>
                  <li><strong>Autonomous Hallucination Judge:</strong> A dedicated verification stage decomposes findings into atomic claims, parses citations, and verifies word overlap against source excerpts.</li>
                  <li><strong>Automated Guardrails:</strong> If the Faithfulness score falls below 75%, the system automatically flags the answer as Low confidence and adds explicit warning disclosures.</li>
                </ul>
              </div>
            )}

            {activeSection === 'production' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">5. How would you make this production-ready?</h4>
                <div className="space-y-2 text-zinc-300">
                  <p>To scale from this focused implementation to high-throughput production (10M+ queries/month):</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li><strong>Distributed Task Queues:</strong> Replace local asyncio with Celery/Temporal workers for resilient multi-minute research orchestration.</li>
                    <li><strong>Semantic Cache Layer:</strong> Store query embeddings in Redis with TTL to serve identical research queries at 0 token cost and &lt;10ms latency.</li>
                    <li><strong>Dynamic Routing:</strong> Use a lightweight classifier (e.g. small fine-tuned BERT or Gemini Flash-Lite) to fast-path simple lookups and bypass multi-step agents.</li>
                    <li><strong>Egress Network Proxies:</strong> Route scraping through rotating residential proxy pools to eliminate CAPTCHAs and IP bans.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeSection === 'monitoring' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">6. What would you monitor in production?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Quality & Faithfulness</strong>
                    <ul className="text-xs space-y-1 list-disc list-inside text-zinc-400">
                      <li>Judge Faithfulness Score distribution</li>
                      <li>Citation Grounding Rate (target: &gt;90%)</li>
                      <li>User thumbs-up / thumbs-down rating</li>
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Cost & Latency</strong>
                    <ul className="text-xs space-y-1 list-disc list-inside text-zinc-400">
                      <li>p50, p90, and p99 step latencies</li>
                      <li>Prompt vs Completion tokens per request</li>
                      <li>Average USD cost per synthesized answer</li>
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Tool Reliability</strong>
                    <ul className="text-xs space-y-1 list-disc list-inside text-zinc-400">
                      <li>Tool error / timeout rates per provider</li>
                      <li>Circuit breaker trip events</li>
                      <li>Source discard ratios (relevance yield)</li>
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <strong className="text-zinc-200 font-mono block text-xs uppercase mb-1">Security & Safety</strong>
                    <ul className="text-xs space-y-1 list-disc list-inside text-zinc-400">
                      <li>Prompt injection attempt rate</li>
                      <li>PII / confidential credential leak scans</li>
                      <li>Low-confidence fallback triggers</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tradeoffs' && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100 font-bold">7. What were your key tradeoffs?</h4>
                <div className="space-y-2 text-zinc-300">
                  <p><strong>Latency vs Thoroughness:</strong> We chose a 2-step parallel tool execution model. A 5-step iterative agent would retrieve deeper facts but incur 15s+ latency. Our parallel pipeline delivers high recall in ~500ms (simulation) to ~4s (live APIs).</p>
                  <p><strong>Framework Simplicity vs LangGraph Complexity:</strong> Instead of heavy orchestration abstractions that obscure debuggability, we implemented a typed async state machine in Python with Pydantic v2. This gives 100% deterministic control over retries, error recovery, and SSE streaming.</p>
                  <p><strong>Local Grounding Judge vs External API:</strong> Running an integrated heuristic/embedding Judge eliminates secondary API latency and guarantees determinism without runaway LLM verification costs.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.06] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-medium text-xs shadow-sm transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
