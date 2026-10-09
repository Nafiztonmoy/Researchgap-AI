from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )


class GapPaperEvidence(StrictSchema):
    paper_id: str
    paper_title: str
    evidence_summary: str


class ResearchGapCandidate(StrictSchema):
    title: str
    category: Literal["methodological", "empirical", "theoretical", "application"]
    description: str
    rationale: str
    evidence_sources: list[GapPaperEvidence] = Field(default_factory=list)
    potential_impact: Literal["high", "medium", "exploratory"]
    actionability_score: int = Field(ge=1, le=10)
    suggested_directions: list[str] = Field(default_factory=list)


class GapDiscoveryContext(StrictSchema):
    project_id: str
    project_title: str
    research_domain: str | None = None
    research_question: str | None = None
    target_population: str | None = None
    preferred_methodology: str | None = None
    literature_synthesis: str | None = None
    shared_limitations: list[dict] = Field(default_factory=list)
    tensions_and_contradictions: list[dict] = Field(default_factory=list)
    papers: list[dict] = Field(default_factory=list)


class GapDiscoveryResponse(StrictSchema):
    project_id: str
    domain_landscape_summary: str
    gaps: list[ResearchGapCandidate] = Field(default_factory=list)
