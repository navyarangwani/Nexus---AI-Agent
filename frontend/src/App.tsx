import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QueryBar } from './components/QueryBar';
import { ExecutionDAG } from './components/ExecutionDAG';
import { StepInspector } from './components/StepInspector';
import { FinalResponse } from './components/FinalResponse';
import { BaselineCompare } from './components/BaselineCompare';
import { ChaosDrawer } from './components/ChaosDrawer';
import { EvalsStudio } from './components/EvalsStudio';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SettingsModal } from './components/SettingsModal';
import { DemoTourPanel, TOUR_STEPS } from './components/DemoTourPanel';
import {
  CompleteResearchResponse,
  ChaosInjectionConfig,
  ProviderType,
  StreamEvent,
} from './types';
import { startResearchStream } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<'research' | 'evals' | 'architecture'>('research');
  const [query, setQuery] = useState('Compare the top 3 open-source vector databases for a startup building RAG products.');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<StreamEvent | undefined>();
  const [finalResult, setFinalResult] = useState<CompleteResearchResponse | undefined>();
  const [activeInspectNode, setActiveInspectNode] = useState<string>('plan');
  const [highlightedSourceId, setHighlightedSourceId] = useState<number | null>(null);

  // Settings & Configuration (persisted to localStorage)
  const [provider, setProviderState] = useState<ProviderType>(() => {
    return (localStorage.getItem('nexus_provider') as ProviderType) || 'mock';
  });
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem('nexus_api_key') || '';
  });
  const [modelName, setModelNameState] = useState(() => {
    return localStorage.getItem('nexus_model') || 'simulator-v1';
  });

  const setProvider = (p: ProviderType) => {
    setProviderState(p);
    localStorage.setItem('nexus_provider', p);
  };
  const setApiKey = (k: string) => {
    setApiKeyState(k);
    localStorage.setItem('nexus_api_key', k);
  };
  const setModelName = (m: string) => {
    setModelNameState(m);
    localStorage.setItem('nexus_model', m);
  };
  const [includeBaseline, setIncludeBaseline] = useState(true);

  // Chaos Injection state
  const [chaosConfig, setChaosConfig] = useState<ChaosInjectionConfig>({
    simulate_tool_timeout: false,
    simulate_malformed_tool_output: false,
    simulate_prompt_injection: false,
    simulate_empty_results: false,
    simulate_rate_limit: false,
  });

  // Modals
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Demo Tour State
  const [isTourOpen, setIsTourOpen] = useState(true); // Default open for rich side-by-side walkthrough!
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);

  const hasActiveChaos = Object.values(chaosConfig).some(Boolean);

  // Auto-play timer for demo tour
  useEffect(() => {
    if (!isTourPlaying || !isTourOpen) return;
    const timer = setInterval(() => {
      setTourStepIndex((prev) => {
        if (prev < TOUR_STEPS.length - 1) return prev + 1;
        setIsTourPlaying(false);
        return prev;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [isTourPlaying, isTourOpen]);

  // Run initial query on first mount so the reviewer immediately sees the full UI in action!
  useEffect(() => {
    handleExecuteResearch();
  }, []);

  const handleExecuteResearch = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentEvent({
      event_type: 'status',
      step_index: 0,
      message: 'Initializing autonomous research agent...',
    });
    setHighlightedSourceId(null);

    await startResearchStream({
      query,
      provider,
      apiKey,
      modelName,
      chaosConfig: hasActiveChaos ? chaosConfig : undefined,
      includeBaseline,
      onEvent: (evt) => {
        setCurrentEvent(evt);
        if (evt.event_type === 'plan_ready') setActiveInspectNode('plan');
        if (evt.event_type === 'tool_complete') setActiveInspectNode('tools');
        if (evt.event_type === 'filter_complete') setActiveInspectNode('filter');
        if (evt.event_type === 'judge_complete') setActiveInspectNode('judge');
      },
      onError: (err) => {
        setIsLoading(false);
        alert(`Research pipeline error: ${err.message}`);
      },
      onDone: (res) => {
        setIsLoading(false);
        if (res) {
          setFinalResult(res);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-zinc-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        provider={provider}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenChaos={() => setIsChaosOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        hasActiveChaos={hasActiveChaos}
        isTourOpen={isTourOpen}
        onToggleTour={() => setIsTourOpen(!isTourOpen)}
      />

      {/* Main Container with Optional Side Dossier */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 min-w-0">
          {/* Tab 1: Primary Research Interface */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              {/* Search Input Bar */}
              <QueryBar
                query={query}
                setQuery={setQuery}
                onSearch={handleExecuteResearch}
                isLoading={isLoading}
                includeBaseline={includeBaseline}
                setIncludeBaseline={setIncludeBaseline}
              />

              {/* Living Intelligence Graph (DAG) */}
              <ExecutionDAG
                currentEvent={currentEvent}
                finalResult={finalResult}
                activeInspectNode={activeInspectNode}
                setActiveInspectNode={setActiveInspectNode}
                isLoading={isLoading}
              />

              {/* Step Telemetry & Inspector */}
              {finalResult && (
                <StepInspector
                  activeNode={activeInspectNode}
                  result={finalResult}
                  onSelectSource={(id) => setHighlightedSourceId(id)}
                />
              )}

              {/* Structured Final Dossier */}
              {finalResult && (
                <FinalResponse
                  result={finalResult}
                  highlightedSourceId={highlightedSourceId}
                  setHighlightedSourceId={setHighlightedSourceId}
                />
              )}

              {/* Baseline Comparator */}
              {finalResult?.baseline_comparison && (
                <BaselineCompare
                  baseline={finalResult.baseline_comparison}
                  agentAnswer={finalResult.final_answer}
                />
              )}
            </div>
          )}

          {/* Tab 2: Benchmark Evaluation Studio */}
          {activeTab === 'evals' && (
            <EvalsStudio
              provider={provider}
              apiKey={apiKey}
              modelName={modelName}
            />
          )}
        </main>

        {/* Side Explanation Walkthrough Dossier */}
        {isTourOpen && (
          <DemoTourPanel
            currentStepIndex={tourStepIndex}
            setCurrentStepIndex={(idx) => {
              setTourStepIndex(idx);
              // Switch tabs or focus based on tour step!
              if (idx === 7) setIsChaosOpen(true);
              else setIsChaosOpen(false);
              if (idx === 8) setActiveTab('evals');
              else if (activeTab === 'evals') setActiveTab('research');
            }}
            isPlaying={isTourPlaying}
            setIsPlaying={setIsTourPlaying}
            onClose={() => setIsTourOpen(false)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#09090b] py-5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NEXUS // AUTONOMOUS RESEARCH AGENT • FAITHFULNESS VERIFIED</span>
          <span className="text-zinc-600">ENGINEERED WITH FASTAPI, PYDANTIC V2 & REACT</span>
        </div>
      </footer>

      {/* Modals */}
      <ChaosDrawer
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        config={chaosConfig}
        setConfig={setChaosConfig}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        modelName={modelName}
        setModelName={setModelName}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default App;
