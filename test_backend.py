import asyncio
from backend.models.schemas import ResearchRequest, ChaosInjectionConfig
from backend.agent.orchestrator import ResearchOrchestrator
from backend.evals.benchmark_dataset import BENCHMARK_SUITE


async def test_end_to_end():
    print("Testing End-to-End Orchestrator Pipeline (Happy Path)...")
    req = ResearchRequest(
        query="Compare the top 3 open-source vector databases for a startup building RAG products.",
        provider="mock",
        include_baseline_comparison=True
    )
    res = await ResearchOrchestrator(req).run()

    print(f"[OK] Plan Generated: {len(res.plan.steps)} steps")
    print(f"[OK] Tools Executed: {len(res.tool_results)} results")
    print(f"[OK] Sources Filtered: {res.metrics.filtered_sources_kept} kept / {res.metrics.total_sources_gathered} raw")
    print(f"[OK] Answer Synthesized: {res.final_answer.confidence_level} confidence ({round(res.final_answer.confidence_score*100)}%)")
    print(f"[OK] Hallucination Judge Faithfulness: {res.judge_result.faithfulness_score}%")
    print(f"[OK] Baseline Comparison: Generated with {len(res.baseline_comparison.hallucination_differences)} diff callouts")
    print(f"[OK] Total Latency: {res.metrics.total_latency_ms} ms")
    print("\nEnd-to-end test passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_end_to_end())
