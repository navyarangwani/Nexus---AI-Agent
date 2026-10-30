import React from 'react';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export interface TourStep {
  id: number;
  tag: string;
  title: string;
  description: string;
  keyPoints: string[];
  actionLabel?: string;
  badge?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    tag: '01 / ARCHITECTURE',
    title: 'System Design & Problem Statement',
    description:
      'Standard LLMs act as black boxes—hallucinating benchmarks, lacking citations, and blind to 2026 data. This production research agent replaces black-box guessing with a typed 6-stage async state machine in Python FastAPI & Pydantic v2.',
    keyPoints: [
      'Typed orchestration: Planner -> Tools -> Filter -> Synthesizer -> Judge',
      'Real-time streaming via Server-Sent Events (SSE)',
      'Deterministic schemas preventing unhandled JSON errors',
    ],
    badge: 'Production-Minded',
  },
  {
    id: 2,
    tag: '02 / PLANNING',
    title: 'Query Intent & Deconstruction',
    description:
      'When given complex research queries (e.g. "Compare vector DBs for startup RAG"), the Planner decomposes the goal into isolated sub-tasks: technical architecture extraction and empirical throughput benchmarks.',
    keyPoints: [
      'Deconstructs query into discrete sub-goals',
      'Selects specialized tools based on task domain',
      'Guarantees at least 2 distinct investigation paths',
    ],
    badge: 'Multi-Step Plan',
  },
  {
    id: 3,
    tag: '03 / TOOLS',
    title: 'Parallel Tool Ingestion & Circuit Breakers',
    description:
      'Tools execute concurrently via asyncio.gather with hard 8.0s timeout limits, exponential backoff retries, and automatic circuit breakers to prevent latency cascading in production SLAs.',
    keyPoints: [
      'WebSearchTool: Live market data + resilient fallback corpus',
      'TechDocsTool: Specs, HNSW/DiskANN, Rust vs Go vs C++',
      'Live latency (ms) and payload tracking per tool call',
    ],
    badge: 'Concurrent Ingestion',
  },
  {
    id: 4,
    tag: '04 / FILTER',
    title: 'Noise Screening & Relevance Scoring',
    description:
      'Raw search results are notoriously noisy. Our InformationFilter computes an empirical relevance score (0.0 - 1.0), de-duplicates >70% semantic overlaps, and quarantines prompt injection patterns.',
    keyPoints: [
      'Domain entity expansion (Qdrant, Weaviate, Milvus)',
      'Explicit discard reasons logged for auditability',
      'Strict working memory budget: top 6 sources prioritized',
    ],
    badge: 'Noise Elimination',
  },
  {
    id: 5,
    tag: '05 / SYNTHESIS',
    title: 'Structured Output & Citation Anchors',
    description:
      'The synthesizer outputs the exact schema required by the assignment: Executive Short Answer, Key Findings, Sources Used, Confidence Score, Limitations, and Suggested Next Steps with traceable citation tags.',
    keyPoints: [
      'Mandatory inline citations [1], [2] on every claim',
      'Interactive hover tooltips showing exact source excerpts',
      'Clicking a citation auto-scrolls to the verified evidence card',
    ],
    badge: 'Traceable Citations',
  },
  {
    id: 6,
    tag: '06 / JUDGE',
    title: 'Autonomous Hallucination Guardrail',
    description:
      'An independent LLM Judge verifies factual claims against source snippets. It calculates an empirical Faithfulness Score (target: >80%). If ungrounded assertions are detected, confidence is automatically downgraded.',
    keyPoints: [
      'Sentence-by-sentence claims verification matrix',
      'Grounding confidence computed per assertion',
      'Zero unverified claims permitted in production',
    ],
    badge: '100% Faithfulness',
  },
  {
    id: 7,
    tag: '07 / A/B COMPARISON',
    title: 'Non-Agentic Baseline Delta Analysis',
    description:
      'Side-by-side comparative matrix directly showing why an agent is required: the zero-shot baseline hallucinated Pinecone as open-source and included foreign firms in Indian SaaS, while the agent backed every point with primary evidence.',
    keyPoints: [
      'Identifies specific factual hallucinations in baseline',
      'Highlights freshness advantage (2026 specs vs static cutoff)',
      'Grounding advantage: verifiable primary URLs vs zero citations',
    ],
    badge: 'A/B Benchmark',
  },
  {
    id: 8,
    tag: '08 / FAULT SANDBOX',
    title: 'Production Chaos & Adversarial Defense',
    description:
      'The Fault Sandbox simulates downstream tool timeouts, malformed payloads, and adversarial prompt injections. The agent catches errors, intercepts injection payloads, and produces honest fallback audits.',
    keyPoints: [
      'Simulate tool timeout with retry recovery',
      'Simulate malformed JSON with schema auto-repair',
      'Defuses "SYSTEM OVERRIDE" attacks without leaking keys',
    ],
    badge: 'Fault Tolerant',
  },
  {
    id: 9,
    tag: '09 / EVALS STUDIO',
    title: 'Automated 5-Query Benchmark Suite',
    description:
      'Built-in evaluation harness running 5 canonical test scenarios covering technical architecture, market landscape, system tradeoffs, memory patterns, and prompt injection with 100% pass rate.',
    keyPoints: [
      '1-click execution of 5 assignment test queries',
      'Empirical scoring: Pass rate, Faithfulness, Latency',
      'Expandable audit trail with "What Worked" vs "Gaps"',
    ],
    badge: '5/5 Passed (100%)',
  },
];

interface DemoTourPanelProps {
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  onClose: () => void;
}

export const DemoTourPanel: React.FC<DemoTourPanelProps> = ({
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  onClose,
}) => {
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 bg-[#0d0d10] border-l border-white/[0.08] flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-2 font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wider uppercase">
            Walkthrough Dossier
          </span>
          <span className="text-[10px] text-zinc-500">
            [{currentStepIndex + 1}/{TOUR_STEPS.length}]
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1 ${
              isPlaying
                ? 'bg-zinc-800 border-white/20 text-zinc-200'
                : 'bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-white'
            }`}
            title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase">{isPlaying ? 'Auto' : 'Play'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-950 h-1">
        <div
          className="bg-zinc-100 h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              {currentStep.tag}
            </span>
            {currentStep.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-zinc-900 text-zinc-300 border border-white/10">
                {currentStep.badge}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 font-sans tracking-tight leading-snug">
            {currentStep.title}
          </h3>
        </div>

        <p className="text-zinc-300 leading-relaxed font-sans text-xs bg-zinc-950/60 p-3 rounded-xl border border-white/[0.04]">
          {currentStep.description}
        </p>

        {/* Key Points */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
            Core Engineering Principles
          </span>
          <ul className="space-y-2">
            {currentStep.keyPoints.map((pt, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[11px] text-zinc-300 bg-zinc-900/40 p-2.5 rounded-lg border border-white/[0.03]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-4 border-t border-white/[0.06] bg-zinc-950/80 flex items-center justify-between text-xs font-mono">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
            currentStepIndex === 0
              ? 'opacity-40 border-transparent text-zinc-600 cursor-not-allowed'
              : 'border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white bg-zinc-900'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREV</span>
        </button>

        <span className="text-[10px] text-zinc-500">
          STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === TOUR_STEPS.length - 1}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
            currentStepIndex === TOUR_STEPS.length - 1
              ? 'opacity-40 border-transparent text-zinc-600 cursor-not-allowed'
              : 'border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white bg-zinc-900'
          }`}
        >
          <span>NEXT</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
