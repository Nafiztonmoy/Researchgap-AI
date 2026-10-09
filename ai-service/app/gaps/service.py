import json
from app.gaps.schemas import (
    GapDiscoveryContext,
    GapDiscoveryResponse,
)
from app.llm.base import LLMProvider


class ResearchGapDiscoveryService:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def discover(self, context: GapDiscoveryContext) -> GapDiscoveryResponse:
        system_prompt = (
            "You are a Distinguished Research Fellow and Academic Gap Identification Strategist. "
            "Your task is to analyze literature evidence, comparative synthesis, and identified limitations "
            "to extract high-value, actionable, and strictly evidence-backed research gaps. "
            "Each gap must belong strictly to one academic category: 'methodological', 'empirical', 'theoretical', or 'application'. "
            "Ensure that every gap candidate cites concrete paper evidence (author limitations, AI-inferred limitations, "
            "or literature contradictions) and includes concrete research directions."
        )

        user_prompt = f"""
Project Title: {context.project_title}
Research Question: {context.research_question or 'Unspecified'}
Domain: {context.research_domain or 'General Academic'}
Target Population: {context.target_population or 'Not specified'}
Preferred Methodology: {context.preferred_methodology or 'Open'}

Literature Synthesis:
{context.literature_synthesis or 'No prior cross-paper synthesis provided.'}

Shared Limitations Identified:
{json.dumps(context.shared_limitations, indent=2)}

Literature Tensions & Contradictions:
{json.dumps(context.tensions_and_contradictions, indent=2)}

Papers Analyzed:
{json.dumps(context.papers, indent=2)}
""".strip()

        instruction = f"""
Return ONLY one valid JSON object.

Required top-level keys exactly:
- project_id (string: "{context.project_id}")
- domain_landscape_summary (string: 1-2 paragraphs contextualizing the research frontier and the open gaps)
- gaps (list of ResearchGapCandidate objects)

Format for each ResearchGapCandidate:
{{
  "title": "Precise scholarly title for the gap",
  "category": "methodological | empirical | theoretical | application",
  "description": "Comprehensive explanation of what is missing, incomplete, or flawed in the current literature.",
  "rationale": "Scientific justification explaining why resolving this gap would advance the state of the art.",
  "evidence_sources": [
    {{
      "paper_id": "exact paper_id from the papers list",
      "paper_title": "exact title of the paper",
      "evidence_summary": "specific limitation or finding in this paper that reveals this gap"
    }}
  ],
  "potential_impact": "high | medium | exploratory",
  "actionability_score": 8, // integer from 1 to 10
  "suggested_directions": [
    "Specific methodological or experimental approach to address this gap 1",
    "Specific approach 2"
  ]
}}

Generate at least 3-6 distinct, high-quality, and diverse research gap candidates spanning different categories.
Ensure paper_id values in evidence_sources strictly match the provided paper_id values.
Do not output markdown code fences or conversational text.
""".strip()

        return self.provider.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=GapDiscoveryResponse,
            instruction=instruction,
        )
