import asyncio
import json
import os
from backend.models.schemas import ResearchRequest, ChaosInjectionConfig
from backend.agent.orchestrator import ResearchOrchestrator
from backend.evals.benchmark_dataset import BENCHMARK_SUITE

os.makedirs("sample_outputs", exist_ok=True)


async def generate():
    cases = [
        ("sample_1_vector_databases", BENCHMARK_SUITE[0], None),
        ("sample_2_indian_hr_tech_saas", BENCHMARK_SUITE[1], None),
        ("sample_3_customer_support_multiagent", BENCHMARK_SUITE[2], None),
        ("sample_4_prompt_injection_edge_case", BENCHMARK_SUITE[4], ChaosInjectionConfig(simulate_prompt_injection=True))
    ]
    for prefix, tc, chaos in cases:
        print(f"Generating {prefix}...")
        req = ResearchRequest(
            query=tc.query,
            provider="mock",
            chaos_config=chaos,
            include_baseline_comparison=True
        )
        res = await ResearchOrchestrator(req).run()

        # Save JSON
        with open(f"sample_outputs/{prefix}.json", "w", encoding="utf-8") as f:
            f.write(json.dumps(res.model_dump(), indent=2))

        # Save Markdown Report
        ans = res.final_answer
        md_lines = [
            f"# Research Report: {ans.user_question}",
            "",
            "## Executive Summary",
            ans.short_answer,
            "",
            "## Key Findings"
        ]
        for kf in ans.key_findings:
            md_lines.append(f"### {kf.id}. {kf.title} (Confidence: {kf.confidence})")
            md_lines.append(kf.finding)
            md_lines.append("")

        md_lines.append("## Sources Used")
        for s in ans.sources_used:
            md_lines.append(f"- **{s.citation_tag} [{s.title}]({s.url})** (Domain: `{s.domain}`, Relevance: `{s.relevance_score}`)")
            md_lines.append(f"> *\"{s.key_excerpt}\"*")
            md_lines.append("")

        md_lines.append("## Confidence Assessment")
        md_lines.append(f"- **Level**: `{ans.confidence_level}` ({round(ans.confidence_score * 100)}%)")
        md_lines.append(f"- **Rationale**: {ans.confidence_rationale}")
        md_lines.append("")
        md_lines.append("## Limitations & Assumptions")
        for lim in ans.limitations_or_assumptions:
            md_lines.append(f"- {lim}")
        md_lines.append("")
        md_lines.append("## Suggested Next Steps")
        for ns in ans.suggested_next_steps:
            md_lines.append(f"- {ns}")
        md_lines.append("")

        if res.baseline_comparison:
            md_lines.append("---")
            md_lines.append("## Non-Agentic Baseline Comparison")
            md_lines.append("### Direct LLM Answer (Ungrounded)")
            md_lines.append(f"> {res.baseline_comparison.direct_llm_answer}")
            md_lines.append("")
            md_lines.append("### Hallucination Differences Identified")
            for diff in res.baseline_comparison.hallucination_differences:
                md_lines.append(f"- {diff}")
            md_lines.append("")
            md_lines.append(f"- **Freshness Advantage**: {res.baseline_comparison.freshness_advantage}")
            md_lines.append(f"- **Grounding Advantage**: {res.baseline_comparison.grounding_advantage}")

        with open(f"sample_outputs/{prefix}.md", "w", encoding="utf-8") as f:
            f.write("\n".join(md_lines))

    print("All sample outputs generated successfully!")


if __name__ == "__main__":
    asyncio.run(generate())
