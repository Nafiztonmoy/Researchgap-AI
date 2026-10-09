from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )


class ExternalPaperCitation(StrictSchema):
    title: str
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    venue: str | None = None
    citation_count: int | None = 0
    abstract: str | None = None
    url: str | None = None
    relevance_explanation: str
    overlap_level: Literal["high", "moderate", "low", "minimal"]


class NoveltyVerificationContext(StrictSchema):
    gap_id: str
    gap_title: str
    gap_category: str
    gap_description: str
    gap_rationale: str
    project_domain: str | None = None
    external_papers: list[dict] = Field(default_factory=list)


class NoveltyVerificationResponse(StrictSchema):
    gap_id: str
    novelty_score: int = Field(ge=0, le=100)
    novelty_verdict: Literal["Highly Novel", "Moderately Novel", "High Literature Saturation"]
    synthesis: str
    overlapping_papers: list[ExternalPaperCitation] = Field(default_factory=list)
    distinguishing_angles: list[str] = Field(default_factory=list)
    potential_pitfalls: list[str] = Field(default_factory=list)
