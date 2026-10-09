import json
from app.ideas.schemas import (
    ResearchIdeaGenerationContext,
    ResearchIdeaProposal,
)
from app.llm.base import LLMProvider


class ResearchIdeaGeneratorService:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def generate(self, context: ResearchIdeaGenerationContext) -> ResearchIdeaProposal:
        system_prompt = (
            "You are a Distinguished Principal Investigator, NSF/ERC Grant Reviewer, and Academic Research Proposal Architect. "
            "Your mission is to transform an identified research gap into a comprehensive, highly rigorous, and publication-ready "
            "Research Proposal and Engineering/Scientific Blueprint. "
            "The blueprint must feature a testable and scientifically grounded primary hypothesis, formal hypothesized causal mechanisms, "
            "a structured multi-phase system architecture/methodology, concrete target benchmarks and datasets, baseline models to outperform, "
            "quantitative evaluation metrics with target thresholds, anticipated novel contributions, and honest risk mitigations."
        )

        user_prompt = f"""
Project Context:
- Project Title: {context.project_title}
- Research Question: {context.research_question or 'Unspecified'}
- Domain: {context.research_domain or 'Computer Science / Artificial Intelligence'}
- Preferred Methodology: {context.preferred_methodology or 'Open'}

Target Research Gap to Resolve:
- Gap ID: {context.gap_id}
- Title: {context.gap_title}
- Category: {context.gap_category}
- Description: {context.gap_description}
- Rationale: {context.gap_rationale}
- Suggested Directions: {json.dumps(context.gap_directions, indent=2)}

Anchoring Paper Evidence:
{json.dumps(context.paper_evidence, indent=2)}
""".strip()

        instruction = f"""
Return ONLY one valid JSON object.

Required top-level keys exactly:
- gap_id (string: "{context.gap_id}")
- title (string: Compelling, publication-ready paper/proposal title)
- executive_summary (string: 2-3 paragraph executive summary of the research initiative)
- primary_hypothesis (string: Formal, testable scientific hypothesis formulated as H1: If ... then ... because ...)
- hypothesized_mechanisms (list of strings: 2-4 formal mechanistic reasons explaining why this approach should succeed)
- system_architecture_overview (string: Technical description of the proposed framework, algorithmic components, and pipeline)
- methodology_phases (list of objects with keys: "phase", "title", "description", "key_techniques" [list of strings])
- target_datasets (list of objects with keys: "name", "description", "availability", "purpose")
- baseline_models (list of objects with keys: "model_name", "description", "expected_weakness")
- evaluation_metrics (list of objects with keys: "metric_name", "measurement_goal", "target_threshold")
- expected_scientific_contributions (list of strings: 3-5 distinct scholarly contributions)
- risks_and_mitigations (list of objects with keys: "risk", "severity" ["low"|"medium"|"high"], "mitigation_strategy")
- publication_target_venues (list of strings: 3-5 prestigious peer-reviewed conferences or journals suited for this work)

Ensure high academic caliber, realistic scientific rigor, and precise terminology.
Do not output markdown code fences or conversational text.
""".strip()

        return self.provider.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=ResearchIdeaProposal,
            instruction=instruction,
        )
