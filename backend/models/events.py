from typing import Any, Dict, Optional, Literal
from pydantic import BaseModel


class StreamEvent(BaseModel):
    event_type: Literal[
        "status",
        "plan_start",
        "plan_ready",
        "tool_start",
        "tool_progress",
        "tool_complete",
        "filter_complete",
        "judge_complete",
        "synthesis_ready",
        "baseline_ready",
        "complete",
        "error"
    ]
    step_index: int = 0
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp_ms: Optional[float] = None
