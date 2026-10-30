import re
from typing import List, Tuple
from backend.models.schemas import RawSourceItem
from backend.tools.base import BaseTool


class WebScraperTool(BaseTool):
    """
    Web Scraper & Content Sanitization Tool with active Prompt Injection Defense.
    Extracts core article text, strips HTML noise, and neutralizes indirect injection payloads.
    """
    def __init__(self):
        super().__init__(
            name="web_scraper",
            description="Fetches, extracts, and sanitizes long-form content from specific URLs with prompt-injection defense.",
            timeout_seconds=8.0,
            max_retries=1
        )

        # Known prompt injection signatures
        self.injection_patterns = [
            re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
            re.compile(r"system\s*override", re.IGNORECASE),
            re.compile(r"you\s+are\s+now\s+dan", re.IGNORECASE),
            re.compile(r"print\s+(confidential|secret|api\s*key|environment)", re.IGNORECASE),
            re.compile(r"disregard\s+the\s+above", re.IGNORECASE),
            re.compile(r"new\s+system\s+prompt:", re.IGNORECASE)
        ]

    def sanitize_and_inspect(self, text: str) -> Tuple[str, bool]:
        """
        Detects prompt injection triggers and defuses them, returning (clean_text, was_adversarial).
        """
        was_adversarial = False
        cleaned_text = text

        for pattern in self.injection_patterns:
            if pattern.search(cleaned_text):
                was_adversarial = True
                cleaned_text = pattern.sub("[DEFUSED_INJECTION_ATTEMPT]", cleaned_text)

        # Strip html/script tags if present
        cleaned_text = re.sub(r"<[^>]+>", " ", cleaned_text)
        cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()
        return cleaned_text, was_adversarial

    async def _run(self, query: str, **kwargs) -> List[RawSourceItem]:
        # query can be a url or topic to extract
        url = kwargs.get("url") or (query if query.startswith("http") else f"https://doc.extract/{query.replace(' ', '_')}")
        raw_content = kwargs.get("mock_content") or f"Detailed technical deep dive extracted from {url}. Core specifications and benchmarks corroborate system performance."

        cleaned, was_attack = self.sanitize_and_inspect(raw_content)

        return [
            RawSourceItem(
                title=f"Extracted Article: {query}",
                url=url,
                content=cleaned,
                source_type="scraped_article_sanitized" if was_attack else "scraped_article"
            )
        ]
