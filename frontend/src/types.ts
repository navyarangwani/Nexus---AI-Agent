export type ProviderType = 'mock' | 'gemini' | 'openai' | 'groq' | 'ollama';

export interface PlanStep {
  step_id: number;
  title: string;
  rationale: string;
  tool_name: string;
  tool_query: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration_ms?: number;
  error_message?: string;
}

export interface ResearchPlan {
  query_intent: string;
  clarified_objective: string;
  reasoning: string;
  steps: PlanStep[];
}

export interface RawSourceItem {
  title: string;
  url: string;
  content: string;
  source_type: string;
  score?: number;
}

export interface ToolResult {
  tool_name: string;
  step_id: number;
  status: 'success' | 'timeout' | 'error' | 'repaired';
  latency_ms: number;
  items: RawSourceItem[];
  raw_payload_size_bytes: number;
  error_details?: string;
  retry_count: number;
  circuit_breaker_triggered: boolean;
}

export interface FilteredSource {
  source_id: number;
  citation_tag: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevance_score: number;
  kept: boolean;
  discard_reason?: string;
  potential_injection_detected: boolean;
}

export interface ClaimVerification {
  claim_id: number;
  claim_text: string;
  cited_source_ids: number[];
  is_grounded: boolean;
  grounding_confidence: number;
  verification_notes: string;
}

export interface JudgeVerificationResult {
  faithfulness_score: number;
  hallucination_risk: 'None' | 'Low' | 'Medium' | 'High';
  verified_claims_count: number;
  unverified_claims_count: number;
  claims_matrix: ClaimVerification[];
  judgment_summary: string;
}

export interface KeyFinding {
  id: number;
  title: string;
  finding: string;
  citations: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

export interface SourceReference {
  source_id: number;
  citation_tag: string;
  title: string;
  url: string;
  domain: string;
  key_excerpt: string;
  relevance_score: number;
}

export interface StructuredFinalAnswer {
  user_question: string;
  short_answer: string;
  key_findings: KeyFinding[];
  sources_used: SourceReference[];
  confidence_level: 'High' | 'Medium' | 'Low';
  confidence_score: number;
  confidence_rationale: string;
  limitations_or_assumptions: string[];
  suggested_next_steps: string[];
}

export interface BaselineComparison {
  direct_llm_answer: string;
  hallucination_differences: string[];
  freshness_advantage: string;
  grounding_advantage: string;
}

export interface ExecutionMetrics {
  total_latency_ms: number;
  planning_latency_ms: number;
  tool_execution_latency_ms: number;
  filtering_latency_ms: number;
  synthesis_latency_ms: number;
  judge_latency_ms: number;
  total_sources_gathered: number;
  filtered_sources_kept: number;
  tokens_prompt: number;
  tokens_completion: number;
  estimated_cost_usd: number;
}

export interface ChaosInjectionConfig {
  simulate_tool_timeout: boolean;
  simulate_malformed_tool_output: boolean;
  simulate_prompt_injection: boolean;
  simulate_empty_results: boolean;
  simulate_rate_limit: boolean;
}

export interface CompleteResearchResponse {
  query: string;
  plan: ResearchPlan;
  tool_results: ToolResult[];
  all_sources: FilteredSource[];
  final_answer: StructuredFinalAnswer;
  judge_result: JudgeVerificationResult;
  baseline_comparison?: BaselineComparison;
  metrics: ExecutionMetrics;
}

export interface StreamEvent {
  event_type:
    | 'status'
    | 'plan_start'
    | 'plan_ready'
    | 'tool_start'
    | 'tool_progress'
    | 'tool_complete'
    | 'filter_complete'
    | 'judge_complete'
    | 'synthesis_ready'
    | 'baseline_ready'
    | 'complete'
    | 'error';
  step_index: number;
  message: string;
  data?: any;
  timestamp_ms?: number;
}

export interface EvalMetricResult {
  test_id: string;
  category: string;
  query: string;
  passed: boolean;
  faithfulness_score: number;
  grounding_rate: number;
  sources_kept: number;
  total_latency_ms: number;
  what_worked_well: string;
  what_did_not_work: string;
  metric_details: Record<string, any>;
}

export interface BenchmarkSummary {
  total_tests: number;
  passed_tests: number;
  pass_rate_percent: number;
  average_faithfulness_score: number;
  average_latency_ms: number;
  results: EvalMetricResult[];
}
