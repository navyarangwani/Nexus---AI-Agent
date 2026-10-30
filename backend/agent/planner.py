import json
import time
from backend.models.schemas import ResearchPlan, PlanStep
from backend.agent.llm_gateway import LLMGateway


class Planner:
    def __init__(self, llm_gateway: LLMGateway):
        self.llm = llm_gateway

    async def create_plan(self, query: str) -> ResearchPlan:
        start_time = time.perf_counter()
        system_prompt = (
            "You are an expert AI Research Architect. Your job is to analyze a research query, "
            "clarify its core objective, and create a structured 2-step to 3-step investigation plan. "
            "Available tools: 'web_search' (industry news, startups, benchmarks), 'tech_docs' (architecture specs, "
            "engineering tradeoffs, internals), 'web_scraper' (long-form page extraction). "
            "You MUST output valid JSON matching this schema:\n"
            "{\n"
            '  "query_intent": "...",\n'
            '  "clarified_objective": "...",\n'
            '  "reasoning": "...",\n'
            '  "steps": [\n'
            '    {"step_id": 1, "title": "...", "rationale": "...", "tool_name": "web_search", "tool_query": "..."},\n'
            '    {"step_id": 2, "title": "...", "rationale": "...", "tool_name": "tech_docs", "tool_query": "..."}\n'
            "  ]\n"
            "}"
        )
        user_prompt = f"Create an orchestration research plan for this user question:\n'{query}'"

        try:
            raw_response = await self.llm.generate_text(system_prompt, user_prompt, json_mode=True)
            # Clean markdown code blocks if present
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            plan = ResearchPlan(**parsed)

            # Ensure at least 2 steps exist
            if len(plan.steps) < 2:
                plan.steps.append(
                    PlanStep(
                        step_id=len(plan.steps) + 1,
                        title="Corroborate findings with technical architecture specs",
                        rationale="Verify trade-offs and performance characteristics.",
                        tool_name="tech_docs",
                        tool_query=f"{query} architectural tradeoffs"
                    )
                )
            return plan

        except Exception as e:
            # Fallback deterministic plan generation if LLM JSON fails
            return ResearchPlan(
                query_intent=f"Investigate core dimensions of: {query}",
                clarified_objective="Gather authoritative industry sources and evaluate engineering trade-offs.",
                reasoning="Decomposed research into initial landscape discovery followed by technical deep-dive.",
                steps=[
                    PlanStep(
                        step_id=1,
                        title="Search industry landscape and empirical benchmarks",
                        rationale="Retrieve primary domain sources, player comparisons, and metrics.",
                        tool_name="web_search",
                        tool_query=query
                    ),
                    PlanStep(
                        step_id=2,
                        title="Analyze architectural specifications and trade-offs",
                        rationale="Verify engineering constraints, operational costs, and failure modes.",
                        tool_name="tech_docs",
                        tool_query=f"{query} technical architecture specifications"
                    )
                ]
            )
