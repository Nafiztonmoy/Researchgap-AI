from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )


class BenchmarkOrDataset(StrictSchema):
    name: str
    description: str
    availability: str
    purpose: str


class BaselineModel(StrictSchema):
    model_name: str
    description: str
    expected_weakness: str


class EvaluationMetric(StrictSchema):
    metric_name: str
    measurement_goal: str
    target_threshold: str


class MethodologyPhase(StrictSchema):
    phase: str
    title: str
    description: str
    key_techniques: list[str] = Field(default_factory=list)


class RiskAndMitigation(StrictSchema):
    risk: str
    severity: Literal["low", "medium", "high"]
    mitigation_strategy: str


class ResearchIdeaGenerationContext(StrictSchema):
    project_id: str
    project_title: str
    research_domain: str | None = None
    research_question: str | None = None
    preferred_methodology: str | None = None
    gap_id: str
    gap_title: str
    gap_category: str
    gap_description: str
    gap_rationale: str
    gap_directions: list[str] = Field(default_factory=list)
    paper_evidence: list[dict] = Field(default_factory=list)


class ResearchIdeaProposal(StrictSchema):
    gap_id: str
    title: str
    executive_summary: str
    primary_hypothesis: str
    hypothesized_mechanisms: list[str] = Field(default_factory=list)
    system_architecture_overview: str
    methodology_phases: list[MethodologyPhase] = Field(default_factory=list)
    target_datasets: list[BenchmarkOrDataset] = Field(default_factory=list)
    baseline_models: list[BaselineModel] = Field(default_factory=list)
    evaluation_metrics: list[EvaluationMetric] = Field(default_factory=list)
    expected_scientific_contributions: list[str] = Field(default_factory=list)
    risks_and_mitigations: list[RiskAndMitigation] = Field(default_factory=list)
    publication_target_venues: list[str] = Field(default_factory=list)
