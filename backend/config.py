import os
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Production AI Research Agent Studio"
    version: str = "1.0.0"
    debug: bool = True

    # LLM Settings
    default_provider: str = os.getenv("RESEARCH_AGENT_PROVIDER", "mock")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")

    # Tool Execution Config
    tool_timeout_seconds: float = 8.0
    tool_max_retries: int = 2
    tool_circuit_breaker_threshold: int = 3
    tool_backoff_factor: float = 1.5

    # Relevance & Filtering Thresholds
    min_relevance_score: float = 0.55
    max_sources_to_keep: int = 6
    dedup_similarity_threshold: float = 0.85

    # Judge & Hallucination Guardrails
    min_faithfulness_threshold: float = 75.0  # Under 75% triggers low confidence alert
    require_citation_grounding: bool = True

    # Observability
    enable_detailed_traces: bool = True


settings = Settings()
