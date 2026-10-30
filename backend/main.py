import json
import os
import asyncio
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.models.schemas import ResearchRequest, CompleteResearchResponse
from backend.agent.orchestrator import ResearchOrchestrator
from backend.tools.registry import tool_registry
from backend.evals.benchmark_dataset import BENCHMARK_SUITE
from backend.evals.runner import BenchmarkRunner

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Production-grade AI Research Agent with live orchestration visualizer, citation grounding matrix, and evaluation studio."
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "tools_online": len(tool_registry.list_tools())
    }


@app.get("/api/tools")
async def get_tools():
    return {"tools": tool_registry.list_tools()}


@app.post("/api/research/run", response_model=CompleteResearchResponse)
async def run_research(request: ResearchRequest):
    try:
        orchestrator = ResearchOrchestrator(request)
        result = await orchestrator.run()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/research/stream")
async def stream_research(request: ResearchRequest):
    orchestrator = ResearchOrchestrator(request)

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in orchestrator.stream_pipeline():
                payload = json.dumps(event.model_dump())
                yield f"event: {event.event_type}\ndata: {payload}\n\n"
        except Exception as e:
            err_payload = json.dumps({"event_type": "error", "message": f"Execution error: {str(e)}"})
            yield f"event: error\ndata: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/evals/test-cases")
async def get_eval_test_cases():
    return {"test_cases": [t.model_dump() for t in BENCHMARK_SUITE]}


@app.post("/api/evals/run")
async def run_evals(request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    provider = body.get("provider", "mock")
    api_key = body.get("api_key", "")
    model_name = body.get("model_name", "")

    summary = await BenchmarkRunner.run_benchmark(
        provider=provider,
        api_key=api_key,
        model_name=model_name
    )
    return summary


# Mount frontend dist static files if built
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
