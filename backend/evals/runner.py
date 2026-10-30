import asyncio
from typing import List, Dict, Any
from backend.models.schemas import ResearchRequest, ChaosInjectionConfig
from backend.agent.orchestrator import ResearchOrchestrator
from backend.evals.benchmark_dataset import BENCHMARK_SUITE, BenchmarkTestCase
from backend.evals.evaluator import BenchmarkEvaluator, EvalMetricResult


class BenchmarkRunner:
    @staticmethod
    async def run_benchmark(
        provider: str = "mock",
        api_key: str = "",
        model_name: str = ""
    ) -> Dict[str, Any]:
        results: List[EvalMetricResult] = []

        for test in BENCHMARK_SUITE:
            chaos_cfg = None
            if test.simulate_chaos:
                chaos_cfg = ChaosInjectionConfig(
                    simulate_prompt_injection=test.adversarial
                )

            req = ResearchRequest(
                query=test.query,
                provider=provider,  # type: ignore
                api_key=api_key,
                model_name=model_name,
                include_baseline_comparison=True,
                chaos_config=chaos_cfg
            )

            orchestrator = ResearchOrchestrator(req)
            response = await orchestrator.run()
            eval_result = BenchmarkEvaluator.evaluate_test_run(test, response)
            results.append(eval_result)

        passed_count = sum(1 for r in results if r.passed)
        avg_faithfulness = sum(r.faithfulness_score for r in results) / max(1, len(results))
        avg_latency = sum(r.total_latency_ms for r in results) / max(1, len(results))

        summary = {
            "total_tests": len(results),
            "passed_tests": passed_count,
            "pass_rate_percent": round((passed_count / len(results)) * 100, 1),
            "average_faithfulness_score": round(avg_faithfulness, 1),
            "average_latency_ms": round(avg_latency, 1),
            "results": [r.model_dump() for r in results]
        }
        return summary


if __name__ == "__main__":
    async def main():
        print("Running Production AI Research Agent Benchmark Suite...")
        summary = await BenchmarkRunner.run_benchmark()
        print("\n=== BENCHMARK SUMMARY ===")
        print(f"Passed: {summary['passed_tests']} / {summary['total_tests']} ({summary['pass_rate_percent']}%)")
        print(f"Avg Faithfulness: {summary['average_faithfulness_score']}%")
        print(f"Avg Latency: {summary['average_latency_ms']} ms\n")
        for res in summary["results"]:
            status_symbol = "PASS" if res["passed"] else "FAIL"
            print(f"[{status_symbol}] {res['test_id']}: {res['category']}")
            print(f"       Worked: {res['what_worked_well']}")
            print(f"       Gaps:   {res['what_did_not_work']}\n")

    asyncio.run(main())
