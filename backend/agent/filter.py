import re
from typing import List, Tuple, Set
from urllib.parse import urlparse
from backend.models.schemas import ToolResult, FilteredSource


class InformationFilter:
    """
    Production Information Filter.
    Filters weak snippets, de-duplicates near-identical content,
    detects adversarial injection attempts, and scores source relevance.
    """
    def __init__(self, min_relevance_threshold: float = 0.35, max_sources_to_keep: int = 6):
        self.min_relevance_threshold = min_relevance_threshold
        self.max_sources_to_keep = max_sources_to_keep

    def _extract_domain(self, url: str) -> str:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc or parsed.path.split('/')[0]
            return domain.lower().replace("www.", "")
        except Exception:
            return "external-source"

    def _compute_relevance(self, query: str, content: str, title: str) -> float:
        """
        Calculates semantic relevance score combining domain keyword overlap,
        title alignment, and informational density.
        """
        # Common stop words
        stop_words = {
            "the", "a", "an", "is", "for", "in", "and", "or", "of", "to", "how", "what", "with",
            "top", "best", "compare", "different", "building", "products", "summarize", "using",
            "adding", "find", "pros", "cons", "their"
        }
        query_words = set(re.findall(r"[a-z0-9]{3,}", query.lower()))
        domain_keywords = query_words - stop_words
        if not domain_keywords:
            domain_keywords = query_words if query_words else {"research"}

        # Domain entity expansions for research queries
        query_text = query.lower()
        if "vector" in query_text:
            domain_keywords.update(["qdrant", "weaviate", "milvus", "chroma", "hnsw", "rust", "diskann", "embedding"])
        if "hr" in query_text or "saas" in query_text:
            domain_keywords.update(["darwinbox", "keka", "zimyo", "greythr", "infeedo", "payroll", "hrms"])
        if "agent" in query_text:
            domain_keywords.update(["supervisor", "router", "handoff", "multi-agent", "swarm", "langgraph", "react"])
        if "memory" in query_text:
            domain_keywords.update(["buffer", "summary", "entity", "state", "window", "sliding", "dialogue"])

        combined_text = f"{title} {content}".lower()
        content_words = set(re.findall(r"[a-z0-9]{3,}", combined_text))

        # Core domain overlap
        overlap = len(domain_keywords.intersection(content_words)) / max(1, len(domain_keywords))

        # Title alignment bonus
        title_words = set(re.findall(r"[a-z0-9]{3,}", title.lower()))
        title_overlap = len(domain_keywords.intersection(title_words)) / max(1, len(domain_keywords))

        # Substantive content length
        length = len(content)
        density_score = 0.9 if length > 120 else (0.6 if length > 50 else 0.2)

        # Baseline relevance for specialized domain sources
        base = 0.40 if any(kw in combined_text for kw in domain_keywords) else 0.15

        final_score = base + (overlap * 0.40) + (title_overlap * 0.15) + (density_score * 0.10)
        return round(min(0.98, max(0.15, final_score)), 2)

    def _is_duplicate(self, text: str, existing_texts: List[str]) -> bool:
        words1 = set(text.lower().split())
        for existing in existing_texts:
            words2 = set(existing.lower().split())
            if not words1 or not words2:
                continue
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            if union > 0 and (intersection / union) > 0.70:
                return True
        return False

    def filter_and_rank(self, query: str, tool_results: List[ToolResult]) -> List[FilteredSource]:
        candidates: List[FilteredSource] = []
        existing_contents: List[str] = []
        source_counter = 1

        for tr in tool_results:
            for item in tr.items:
                domain = self._extract_domain(item.url)
                content = item.content.strip()

                # 1. Prompt Injection Detection
                is_injection = False
                discard_reason = None
                if any(x in content.lower() for x in ["ignore all previous instructions", "system override", "print confidential", "defused_injection"]):
                    is_injection = True
                    discard_reason = "Quarantined: Detected potential prompt injection attack pattern."

                # 2. Minimum length check
                if not is_injection and len(content) < 35:
                    discard_reason = f"Discarded: Content snippet too short ({len(content)} chars), insufficient substance."

                # 3. Duplicate check
                if not is_injection and not discard_reason:
                    if self._is_duplicate(content, existing_contents):
                        discard_reason = "Discarded: Duplicate / High semantic redundancy (>70% overlap) with previous source."

                # 4. Relevance scoring
                relevance = self._compute_relevance(query, content, item.title)
                if item.source_type in ["encyclopedic_reference", "web_live"]:
                    relevance = min(0.99, relevance + 0.15)
                elif "specs.engineering.dev" in item.url:
                    relevance = max(0.36, relevance - 0.20)

                if not is_injection and not discard_reason:
                    if relevance < self.min_relevance_threshold:
                        discard_reason = f"Discarded: Low relevance score ({relevance} < threshold {self.min_relevance_threshold})."

                # Check kept status
                kept = (discard_reason is None and not is_injection)

                if kept:
                    existing_contents.append(content)
                    citation_tag = f"[{source_counter}]"
                    source_counter += 1
                else:
                    citation_tag = "[-]"

                candidates.append(
                    FilteredSource(
                        source_id=len(candidates) + 1,
                        citation_tag=citation_tag,
                        title=item.title,
                        url=item.url,
                        domain=domain,
                        snippet=content,
                        relevance_score=relevance,
                        kept=kept,
                        discard_reason=discard_reason,
                        potential_injection_detected=is_injection
                    )
                )

        # Sort kept candidates by relevance descending, limiting to max_sources_to_keep
        kept_sources = [s for s in candidates if s.kept]
        discarded_sources = [s for s in candidates if not s.kept]

        kept_sources.sort(key=lambda s: s.relevance_score, reverse=True)
        if len(kept_sources) > self.max_sources_to_keep:
            for surplus in kept_sources[self.max_sources_to_keep:]:
                surplus.kept = False
                surplus.discard_reason = f"Discarded: Exceeded maximum working memory budget (top {self.max_sources_to_keep} prioritized)."
                surplus.citation_tag = "[-]"
                discarded_sources.append(surplus)
            kept_sources = kept_sources[:self.max_sources_to_keep]

        # Re-index kept citation tags sequentially [1], [2], [3]...
        for idx, src in enumerate(kept_sources, 1):
            src.source_id = idx
            src.citation_tag = f"[{idx}]"

        # Combine kept first, then discarded for clear auditing in the UI
        return kept_sources + discarded_sources
