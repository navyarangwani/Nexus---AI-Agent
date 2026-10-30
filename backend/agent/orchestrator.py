import time
import asyncio
from typing import AsyncGenerator, List, Optional
from backend.models.schemas import (
    ResearchRequest,
    CompleteResearchResponse,
    ToolCall,
    ExecutionMetrics
)
from backend.models.events import StreamEvent
from backend.agent.llm_gateway import LLMGateway
from backend.agent.planner import Planner
from backend.agent.filter import InformationFilter
from backend.agent.synthesizer import Synthesizer
from backend.agent.judge import HallucinationJudge
from backend.agent.baseline import BaselineComparator
from backend.tools.registry import tool_registry


class ResearchOrchestrator:
    """
    Production Research Agent Orchestrator.
    Manages the end-to-end lifecycle, streaming telemetry, fault recovery,
    and verification across all sub-components.
    """
    def __init__(self, request: ResearchRequest):
        self.request = request
        self.llm_gateway = LLMGateway(
            provider=request.provider,
            api_key=request.api_key,
            model_name=request.model_name
        )
        self.planner = Planner(self.llm_gateway)
        self.filter = InformationFilter(min_relevance_threshold=0.35, max_sources_to_keep=6)
        self.synthesizer = Synthesizer(self.llm_gateway)
        self.judge = HallucinationJudge(faithfulness_threshold=75.0)
        self.baseline_comp = BaselineComparator(self.llm_gateway)

    async def stream_pipeline(self) -> AsyncGenerator[StreamEvent, None]:
        start_overall = time.perf_counter()
        query = self.request.query.strip()

        # Step 0: Initial status
        yield StreamEvent(
            event_type="status",
            step_index=0,
            message="Initializing autonomous research agent...",
            data={"query": query, "provider": self.request.provider}
        )

        # Step 1: Planning
        yield StreamEvent(
            event_type="plan_start",
            step_index=1,
            message="Analyzing research query intent and constructing multi-step execution plan..."
        )
        t_plan_start = time.perf_counter()
        plan = await self.planner.create_plan(query)
        t_plan_end = time.perf_counter()
        planning_latency = (t_plan_end - t_plan_start) * 1000

        yield StreamEvent(
            event_type="plan_ready",
            step_index=1,
            message=f"Plan generated with {len(plan.steps)} investigation steps.",
            data={"plan": plan.model_dump(), "latency_ms": round(planning_latency, 1)}
        )

        # Step 2: Tool Execution
        yield StreamEvent(
            event_type="tool_start",
            step_index=2,
            message=f"Executing {len(plan.steps)} tool calls concurrently with failure circuit breakers..."
        )
        t_tools_start = time.perf_counter()

        tool_calls = [
            ToolCall(
                tool_name=step.tool_name,
                arguments={"query": step.tool_query},
                step_id=step.step_id
            )
            for step in plan.steps
        ]

        # Execute via central registry with chaos injection configuration
        tool_results = await tool_registry.execute_batch(
            tool_calls,
            chaos_config=self.request.chaos_config
        )
        t_tools_end = time.perf_counter()
        tool_latency = (t_tools_end - t_tools_start) * 1000

        # Update step statuses in plan
        for step in plan.steps:
            matching = next((r for r in tool_results if r.step_id == step.step_id), None)
            if matching:
                step.status = "completed" if matching.status in ["success", "repaired"] else "failed"
                step.duration_ms = matching.latency_ms
                step.error_message = matching.error_details

        total_gathered_items = sum(len(r.items) for r in tool_results)
        yield StreamEvent(
            event_type="tool_complete",
            step_index=2,
            message=f"Gathered {total_gathered_items} raw intelligence items across {len(tool_results)} tools.",
            data={
                "tool_results": [r.model_dump() for r in tool_results],
                "latency_ms": round(tool_latency, 1)
            }
        )

        # Step 3: Information Filtering
        yield StreamEvent(
            event_type="status",
            step_index=3,
            message="Filtering noisy snippets, calculating relevance scores, and screening for prompt injection..."
        )
        t_filter_start = time.perf_counter()
        all_sources = self.filter.filter_and_rank(query, tool_results)
        t_filter_end = time.perf_counter()
        filter_latency = (t_filter_end - t_filter_start) * 1000

        kept_count = sum(1 for s in all_sources if s.kept)
        discarded_count = len(all_sources) - kept_count

        yield StreamEvent(
            event_type="filter_complete",
            step_index=3,
            message=f"Filtered {len(all_sources)} sources: {kept_count} verified & retained, {discarded_count} discarded as weak/redundant/unsafe.",
            data={
                "sources": [s.model_dump() for s in all_sources],
                "kept_count": kept_count,
                "discarded_count": discarded_count,
                "latency_ms": round(filter_latency, 1)
            }
        )

        # Step 4: Structured Answer Synthesis
        yield StreamEvent(
            event_type="status",
            step_index=4,
            message="Synthesizing structured final response with explicit citation anchors..."
        )
        t_synth_start = time.perf_counter()
        final_answer = await self.synthesizer.synthesize(query, all_sources)
        t_synth_end = time.perf_counter()
        synth_latency = (t_synth_end - t_synth_start) * 1000

        yield StreamEvent(
            event_type="synthesis_ready",
            step_index=4,
            message="Structured response synthesized with verified citations.",
            data={"final_answer": final_answer.model_dump(), "latency_ms": round(synth_latency, 1)}
        )

        # Step 5: Hallucination & Grounding Judge
        yield StreamEvent(
            event_type="status",
            step_index=5,
            message="Running autonomous Judge pass: verifying claim attribution and calculating faithfulness score..."
        )
        t_judge_start = time.perf_counter()
        judge_result = self.judge.evaluate_grounding(final_answer, all_sources)
        t_judge_end = time.perf_counter()
        judge_latency = (t_judge_end - t_judge_start) * 1000

        yield StreamEvent(
            event_type="judge_complete",
            step_index=5,
            message=f"Judge verification complete. Faithfulness: {judge_result.faithfulness_score}%, Hallucination Risk: {judge_result.hallucination_risk}.",
            data={"judge_result": judge_result.model_dump(), "latency_ms": round(judge_latency, 1)}
        )

        # Step 6: Non-Agentic Baseline Comparison (if requested)
        baseline = None
        if self.request.include_baseline_comparison:
            yield StreamEvent(
                event_type="status",
                step_index=6,
                message="Generating zero-shot direct LLM baseline for comparative analysis..."
            )
            baseline = await self.baseline_comp.generate_baseline(query)
            yield StreamEvent(
                event_type="baseline_ready",
                step_index=6,
                message="Direct baseline comparison ready.",
                data={"baseline": baseline.model_dump()}
            )

        # Final Wrap-Up & Telemetry
        total_latency = (time.perf_counter() - start_overall) * 1000
        # Estimate token usage
        est_prompt_tokens = len(query.split()) * 4 + sum(len(s.snippet.split()) for s in all_sources if s.kept) * 2
        est_completion_tokens = len(final_answer.short_answer.split()) * 3 + sum(len(kf.finding.split()) for kf in final_answer.key_findings) * 2
        est_cost = (est_prompt_tokens * 0.00000015) + (est_completion_tokens * 0.0000006)

        metrics = ExecutionMetrics(
            total_latency_ms=round(total_latency, 1),
            planning_latency_ms=round(planning_latency, 1),
            tool_execution_latency_ms=round(tool_latency, 1),
            filtering_latency_ms=round(filter_latency, 1),
            synthesis_latency_ms=round(synth_latency, 1),
            judge_latency_ms=round(judge_latency, 1),
            total_sources_gathered=total_gathered_items,
            filtered_sources_kept=kept_count,
            tokens_prompt=est_prompt_tokens,
            tokens_completion=est_completion_tokens,
            estimated_cost_usd=round(est_cost, 6)
        )

        complete_response = CompleteResearchResponse(
            query=query,
            plan=plan,
            tool_results=tool_results,
            all_sources=all_sources,
            final_answer=final_answer,
            judge_result=judge_result,
            baseline_comparison=baseline,
            metrics=metrics
        )

        yield StreamEvent(
            event_type="complete",
            step_index=7,
            message=f"Research complete in {round(total_latency/1000, 2)}s with {final_answer.confidence_level} confidence ({round(final_answer.confidence_score*100)}%).",
            data={"result": complete_response.model_dump()}
        )

    async def run(self) -> CompleteResearchResponse:
        """Non-streaming runner for batch execution or evals."""
        last_result = None
        async for event in self.stream_pipeline():
            if event.event_type == "complete" and event.data:
                last_result = CompleteResearchResponse(**event.data["result"])
        if not last_result:
            raise RuntimeError("Pipeline failed to complete execution.")
        return last_result
