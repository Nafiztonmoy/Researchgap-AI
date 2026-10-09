import json
from app.comparison.schemas import (
    ComparisonContext,
    ProjectComparisonResponse,
)
from app.llm.base import LLMProvider


class ProjectComparisonService:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def compare(self, context: ComparisonContext) -> ProjectComparisonResponse:
        system_prompt = (
            "You are a principal academic meta-analyst. Your task is to perform a rigorous "
            "comparative synthesis across a collection of research papers in a specific domain. "
            "Examine differences in problem formulations, methodological paradigms, dataset scales, "
            "and findings. Highlight scientific tensions, trade-offs, and shared unsolved limitations."
        )

        papers_payload = []
        for p in context.papers:
            papers_payload.append({
                "paper_id": p.paper_id,
                "title": p.title,
                "authors": p.authors,
                "year": p.publication_year,
                "venue": p.venue,
                "research_problem": p.research_problem,
                "methodology": p.methodology,
                "datasets": p.datasets,
                "key_findings": p.key_findings,
                "author_stated_limitations": p.author_stated_limitations,
                "ai_inferred_limitations": p.ai_inferred_limitations,
            })

        user_prompt = f"""
Project Title: {context.project_title}
Research Question: {context.research_question or 'Unspecified'}
Domain: {context.research_domain or 'General Academic'}

Papers to Compare:
{json.dumps(papers_payload, indent=2)}
""".strip()

        paper_ids_list = [p.paper_id for p in context.papers]
        ids_str = ", ".join(f'"{pid}"' for pid in paper_ids_list)

        instruction = f"""
Return ONLY one valid JSON object.

Required top-level keys exactly:
- project_title (string)
- literature_synthesis (string: 2-3 detailed paragraphs analyzing the state of the literature)
- methodology_landscape (string: detailed comparison of approaches and techniques)
- dataset_landscape (string: evaluation data, benchmarks, and domain coverage)
- matrix_rows (list of MatrixRow objects)
- tensions_and_contradictions (list of ContradictionOrTension objects)
- shared_limitations (list of SharedLimitation objects)

Format for MatrixRow:
{{
  "dimension": "Core Problem | Methodological Approach | Datasets & Scale | Key Breakthroughs | Acknowledged Limitations | Inferred Blindspots",
  "values": {{
     {', '.join(f'"{pid}": "concise summary for this paper"' for pid in paper_ids_list)}
  }}
}}

Include at least 5 distinct dimensions in matrix_rows. Every matrix row MUST have keys for all paper IDs: [{ids_str}].

Format for ContradictionOrTension:
{{
  "topic": "...",
  "paper_a_id": "...",
  "paper_a_title": "...",
  "paper_a_claim": "...",
  "paper_b_id": "...",
  "paper_b_title": "...",
  "paper_b_claim": "...",
  "analysis": "..."
}}

Format for SharedLimitation:
{{
  "theme": "...",
  "description": "...",
  "affected_paper_ids": ["..."],
  "gap_potential": "high | medium | low"
}}

Do not output markdown code fences or conversational text.
""".strip()

        return self.provider.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=ProjectComparisonResponse,
            instruction=instruction,
        )
