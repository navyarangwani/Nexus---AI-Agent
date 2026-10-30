from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class PlanStep(BaseModel):
    step_id: int
    title: str
    rationale: str
    tool_name: str
    tool_query: str
    status: Literal["pending", "running", "completed", "failed", "skipped"] = "pending"
    duration_ms: Optional[float] = None
    error_message: Optional[str] = None


class ResearchPlan(BaseModel):
    query_intent: str
    clarified_objective: str
    reasoning: str
    steps: List[PlanStep] = Field(default_factory=list)


class ToolCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    step_id: int


class RawSourceItem(BaseModel):
    title: str
    url: str
    content: str
    source_type: str = "web"
    score: Optional[float] = None


class ToolResult(BaseModel):
    tool_name: str
    step_id: int
    status: Literal["success", "timeout", "error", "repaired"]
    latency_ms: float
    items: List[RawSourceItem] = Field(default_factory=list)
    raw_payload_size_bytes: int = 0
    error_details: Optional[str] = None
    retry_count: int = 0
    circuit_breaker_triggered: bool = False


class FilteredSource(BaseModel):
    source_id: int
    citation_tag: str  # e.g. "[1]"
    title: str
    url: str
    domain: str
    snippet: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    kept: bool = True
    discard_reason: Optional[str] = None
    potential_injection_detected: bool = False


class ClaimVerification(BaseModel):
    claim_id: int
    claim_text: str
    cited_source_ids: List[int] = Field(default_factory=list)
    is_grounded: bool
    grounding_confidence: float = Field(ge=0.0, le=1.0)
    verification_notes: str


class JudgeVerificationResult(BaseModel):
    faithfulness_score: float = Field(ge=0.0, le=100.0)
    hallucination_risk: Literal["None", "Low", "Medium", "High"]
    verified_claims_count: int
    unverified_claims_count: int
    claims_matrix: List[ClaimVerification] = Field(default_factory=list)
    judgment_summary: str


class KeyFinding(BaseModel):
    id: int
    title: str
    finding: str
    citations: List[str] = Field(default_factory=list)  # e.g. ["[1]", "[3]"]
    confidence: Literal["High", "Medium", "Low"] = "High"


class SourceReference(BaseModel):
    source_id: int
    citation_tag: str
    title: str
    url: str
    domain: str
    key_excerpt: str
    relevance_score: float


class StructuredFinalAnswer(BaseModel):
    user_question: str
    short_answer: str
    key_findings: List[KeyFinding] = Field(default_factory=list)
    sources_used: List[SourceReference] = Field(default_factory=list)
    confidence_level: Literal["High", "Medium", "Low"]
    confidence_score: float = Field(ge=0.0, le=1.0)
    confidence_rationale: str
    limitations_or_assumptions: List[str] = Field(default_factory=list)
    suggested_next_steps: List[str] = Field(default_factory=list)


class BaselineComparison(BaseModel):
    direct_llm_answer: str
    hallucination_differences: List[str] = Field(default_factory=list)
    freshness_advantage: str
    grounding_advantage: str


class ExecutionMetrics(BaseModel):
    total_latency_ms: float
    planning_latency_ms: float
    tool_execution_latency_ms: float
    filtering_latency_ms: float
    synthesis_latency_ms: float
    judge_latency_ms: float
    total_sources_gathered: int
    filtered_sources_kept: int
    tokens_prompt: int = 0
    tokens_completion: int = 0
    estimated_cost_usd: float = 0.0


class ChaosInjectionConfig(BaseModel):
    simulate_tool_timeout: bool = False
    simulate_malformed_tool_output: bool = False
    simulate_prompt_injection: bool = False
    simulate_empty_results: bool = False
    simulate_rate_limit: bool = False


class ResearchRequest(BaseModel):
    query: str
    provider: Literal["mock", "gemini", "openai", "groq", "ollama"] = "mock"
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    include_baseline_comparison: bool = True
    chaos_config: Optional[ChaosInjectionConfig] = None


class CompleteResearchResponse(BaseModel):
    query: str
    plan: ResearchPlan
    tool_results: List[ToolResult]
    all_sources: List[FilteredSource]
    final_answer: StructuredFinalAnswer
    judge_result: JudgeVerificationResult
    baseline_comparison: Optional[BaselineComparison] = None
    metrics: ExecutionMetrics
