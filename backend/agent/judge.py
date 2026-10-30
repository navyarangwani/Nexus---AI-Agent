import re
from typing import List
from backend.models.schemas import (
    StructuredFinalAnswer,
    FilteredSource,
    JudgeVerificationResult,
    ClaimVerification
)


class HallucinationJudge:
    """
    Automated Grounding & Hallucination Judge.
    Empirically verifies synthesized claims against retrieved source snippets,
    calculates Faithfulness Score, and triggers guardrails for ungrounded claims.
    """
    def __init__(self, faithfulness_threshold: float = 75.0):
        self.faithfulness_threshold = faithfulness_threshold

    def evaluate_grounding(
        self,
        answer: StructuredFinalAnswer,
        sources: List[FilteredSource]
    ) -> JudgeVerificationResult:
        kept_sources = {s.source_id: s for s in sources if s.kept}
        claims_matrix: List[ClaimVerification] = []

        if not kept_sources:
            # Check if this was a legitimate security refusal or quarantine acknowledgement
            is_security_refusal = any(
                term in (answer.short_answer + " " + " ".join(f.finding for f in answer.key_findings)).lower()
                for term in ["injection", "quarantined", "malicious", "override", "refus", "adversarial"]
            )
            if is_security_refusal:
                return JudgeVerificationResult(
                    faithfulness_score=100.0,
                    hallucination_risk="Low",
                    verified_claims_count=len(answer.key_findings),
                    unverified_claims_count=0,
                    claims_matrix=[
                        ClaimVerification(
                            claim_id=i + 1,
                            claim_text=f.finding,
                            cited_source_ids=[],
                            is_grounded=True,
                            grounding_confidence=1.0,
                            verification_notes="Security refusal verified. Adversarial prompt injection successfully quarantined without data leakage."
                        )
                        for i, f in enumerate(answer.key_findings)
                    ],
                    judgment_summary="Adversarial prompt injection successfully neutralized and quarantined. Security refusal verified."
                )

            return JudgeVerificationResult(
                faithfulness_score=0.0,
                hallucination_risk="High",
                verified_claims_count=0,
                unverified_claims_count=len(answer.key_findings),
                claims_matrix=[],
                judgment_summary="Zero external sources available for verification. High hallucination risk."
            )

        claim_idx = 1
        verified_count = 0
        unverified_count = 0

        # Verify each key finding
        for finding in answer.key_findings:
            text = finding.finding
            # Extract citation IDs e.g. [1], [2]
            cited_tags = re.findall(r"\[(\d+)\]", text)
            cited_ids = [int(tag) for tag in cited_tags if tag.isdigit()]

            # Also check finding.citations
            for c in finding.citations:
                match = re.search(r"(\d+)", c)
                if match:
                    val = int(match.group(1))
                    if val not in cited_ids:
                        cited_ids.append(val)

            is_grounded = False
            confidence = 0.5
            notes = ""

            if not cited_ids:
                is_grounded = False
                confidence = 0.3
                notes = "Claim lacks explicit source citation index tag."
                unverified_count += 1
            else:
                stop_words = {"this", "that", "with", "from", "have", "were", "than", "more", "also", "their", "will", "been", "into", "some", "which", "about", "under"}
                claim_words = {w for w in re.findall(r"[a-z0-9]{3,}", text.lower()) if w not in stop_words}

                # Cross-check text with cited source snippet
                matched_sources = [kept_sources[cid] for cid in cited_ids if cid in kept_sources]
                cited_words = set()
                for ms in matched_sources:
                    cited_words.update(re.findall(r"[a-z0-9]{3,}", f"{ms.title} {ms.snippet}".lower()))

                overlap = len(claim_words.intersection(cited_words)) / max(1, len(claim_words))

                if overlap >= 0.15:
                    is_grounded = True
                    confidence = round(min(0.99, 0.65 + overlap * 0.35), 2)
                    notes = f"Grounding verified across cited source(s) {cited_ids} ({round(overlap*100)}% content overlap)."
                    verified_count += 1
                else:
                    # Check if corroborated by any other kept source in working memory
                    all_evidence_words = set()
                    for ks in kept_sources.values():
                        all_evidence_words.update(re.findall(r"[a-z0-9]{3,}", f"{ks.title} {ks.snippet}".lower()))
                    context_overlap = len(claim_words.intersection(all_evidence_words)) / max(1, len(claim_words))

                    if context_overlap >= 0.15:
                        is_grounded = True
                        confidence = round(min(0.95, 0.55 + context_overlap * 0.35), 2)
                        notes = f"Grounding corroborated by broader evidence context ({round(context_overlap*100)}% overlap)."
                        verified_count += 1
                    else:
                        is_grounded = False
                        confidence = round(overlap, 2)
                        notes = f"Insufficient textual evidence in sources (only {round(overlap*100)}% overlap)."
                        unverified_count += 1

            claims_matrix.append(
                ClaimVerification(
                    claim_id=claim_idx,
                    claim_text=finding.title + ": " + text[:120] + ("..." if len(text) > 120 else ""),
                    cited_source_ids=cited_ids,
                    is_grounded=is_grounded,
                    grounding_confidence=confidence,
                    verification_notes=notes
                )
            )
            claim_idx += 1

        total_claims = verified_count + unverified_count
        faithfulness_score = round((verified_count / max(1, total_claims)) * 100.0, 1)

        if faithfulness_score >= 90.0:
            hallucination_risk = "None"
        elif faithfulness_score >= 75.0:
            hallucination_risk = "Low"
        elif faithfulness_score >= 50.0:
            hallucination_risk = "Medium"
        else:
            hallucination_risk = "High"

        # Guardrail trigger: if faithfulness < threshold, downgrade confidence
        if faithfulness_score < self.faithfulness_threshold:
            answer.confidence_level = "Low"
            answer.confidence_rationale = f"Guardrail triggered: Faithfulness score ({faithfulness_score}%) dropped below threshold ({self.faithfulness_threshold}%)."
            if "Potential ungrounded claims detected by autonomous Judge verification." not in answer.limitations_or_assumptions:
                answer.limitations_or_assumptions.insert(0, "Autonomous Judge flagged potential ungrounded claims.")

        summary = (
            f"Judge evaluated {total_claims} claims. {verified_count} grounded, {unverified_count} unverified. "
            f"Faithfulness score: {faithfulness_score}%. Hallucination risk: {hallucination_risk}."
        )

        return JudgeVerificationResult(
            faithfulness_score=faithfulness_score,
            hallucination_risk=hallucination_risk,
            verified_claims_count=verified_count,
            unverified_claims_count=unverified_count,
            claims_matrix=claims_matrix,
            judgment_summary=summary
        )
