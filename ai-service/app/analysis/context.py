from typing import Literal

from pydantic import BaseModel, Field


class AnalysisEvidence(BaseModel):
    citation_id: str = Field(
        min_length=2,
    )

    page: str

    section: str | None = None

    excerpt: str = Field(
        min_length=1,
    )

    evidence_type: Literal[
        "author_stated",
        "inference_source",
    ]


class PaperAnalysisContext(BaseModel):
    paper_id: str

    title: str

    authors: list[str] = Field(
        default_factory=list,
    )

    publication_year: int | None = None

    venue: str | None = None

    explicit_evidence: list[
        AnalysisEvidence
    ] = Field(
        default_factory=list,
    )

    inference_evidence: list[
        AnalysisEvidence
    ] = Field(
        default_factory=list,
    )