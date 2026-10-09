import json
from app.llm.base import LLMProvider
from app.novelty.schemas import (
    NoveltyVerificationContext,
    NoveltyVerificationResponse,
)
from app.novelty.scholarly import ScholarlySearchClient


class ResearchGapNoveltyService:
    def __init__(self, provider: LLMProvider, search_client: ScholarlySearchClient | None = None):
        self.provider = provider
        self.search_client = search_client or ScholarlySearchClient()

    def verify(self, context: NoveltyVerificationContext) -> NoveltyVerificationResponse:
        external_papers = context.external_papers

        if not external_papers:
            query = f"{context.gap_title} {context.project_domain or ''}".strip()
            external_papers = self.search_client.search_literature(query, limit=5)

        system_prompt = (
            "You are a Senior Peer Review Chair and Research Novelty Assessment Specialist for top-tier academic conferences. "
            "Your objective is to rigorously assess the novelty, originality, and literature saturation of a proposed research gap "
            "against recent external publications, preprints, and existing academic state of the art. "
            "Provide an evidence-based Novelty Score (0-100), classify the novelty verdict ('Highly Novel', 'Moderately Novel', or 'High Literature Saturation'), "
            "analyze literature overlap, and recommend tactical distinguishing angles so the researcher's future paper stands out."
        )

        user_prompt = f"""
Research Gap to Evaluate:
- ID: {context.gap_id}
- Title: {context.gap_title}
- Category: {context.gap_category}
- Domain: {context.project_domain or 'General Academic / Computer Science'}
- Description: {context.gap_description}
- Scientific Rationale: {context.gap_rationale}

External Literature Retrieved:
{json.dumps(external_papers, indent=2) if external_papers else "No external papers retrieved directly via API. Evaluate based on state-of-the-art knowledge in this research domain."}
""".strip()

        instruction = f"""
Return ONLY one valid JSON object.

Required top-level keys exactly:
- gap_id (string: "{context.gap_id}")
- novelty_score (integer between 0 and 100: 80-100 for Highly Novel, 50-79 for Moderately Novel, 0-49 for High Literature Saturation)
- novelty_verdict (string, must be strictly one of: "Highly Novel", "Moderately Novel", "High Literature Saturation")
- synthesis (string: 2-3 paragraphs synthesizing how this research gap compares to existing published literature)
- overlapping_papers (list of objects with keys: "title", "authors", "year", "venue", "citation_count", "abstract", "url", "relevance_explanation", "overlap_level" where overlap_level is "high", "moderate", "low", or "minimal")
- distinguishing_angles (list of strings: 2-4 concrete novel angles or unique methodologies that make this work differentiated from existing literature)
- potential_pitfalls (list of strings: 2-4 critical academic caveats or validation pitfalls to avoid)

If external papers were provided in the prompt, reflect them accurately in overlapping_papers with appropriate overlap_level.
Do not output markdown code fences or conversational text.
""".strip()

        return self.provider.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=NoveltyVerificationResponse,
            instruction=instruction,
        )
