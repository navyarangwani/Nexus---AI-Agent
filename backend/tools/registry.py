import asyncio
from typing import Dict, List, Optional
from backend.models.schemas import ToolResult, ToolCall, ChaosInjectionConfig
from backend.tools.base import BaseTool
from backend.tools.web_search import WebSearchTool
from backend.tools.tech_docs import TechDocsTool
from backend.tools.web_scraper import WebScraperTool


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        # Register standard suite
        self.register(WebSearchTool())
        self.register(TechDocsTool())
        self.register(WebScraperTool())

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "timeout_seconds": str(t.timeout_seconds),
                "is_circuit_open": str(t.is_circuit_open)
            }
            for t in self._tools.values()
        ]

    async def execute_tool_call(
        self,
        tool_call: ToolCall,
        chaos_config: Optional[ChaosInjectionConfig] = None
    ) -> ToolResult:
        tool = self.get_tool(tool_call.tool_name)
        if not tool:
            # Fall back to default search if an unrecognized tool name was requested
            tool = self._tools.get("web_search")

        args = dict(tool_call.arguments)
        query = args.pop("query", None) or args.pop("search_query", "")
        return await tool.execute(
            query=query,
            step_id=tool_call.step_id,
            chaos_config=chaos_config,
            **args
        )

    async def execute_batch(
        self,
        calls: List[ToolCall],
        chaos_config: Optional[ChaosInjectionConfig] = None
    ) -> List[ToolResult]:
        """Runs multiple tool calls concurrently with graceful error handling."""
        tasks = [self.execute_tool_call(call, chaos_config) for call in calls]
        return await asyncio.gather(*tasks)


tool_registry = ToolRegistry()
