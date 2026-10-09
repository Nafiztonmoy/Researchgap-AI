from typing import Literal

from pydantic import BaseModel, ConfigDict


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )


class SupportedClaim(StrictSchema):
    claim: str
    evidence_ids: list[str]


class AuthorStatedLimitation(StrictSchema):
    limitation: str
    evidence_ids: list[str]
    source_type: Literal[
        "author_stated"
    ] = "author_stated"


class InferredLimitation(StrictSchema):
    limitation: str
    reasoning: str
    evidence_ids: list[str]

    confidence: Literal[
        "low",
        "medium",
        "high",
    ] = "medium"

    source_type: Literal[
        "ai_inferred"
    ] = "ai_inferred"


class FutureWorkItem(StrictSchema):
    proposal: str
    evidence_ids: list[str]

    origin: Literal[
        "author_suggested",
        "ai_suggested",
    ] = "author_suggested"


class SinglePaperAnalysis(StrictSchema):
    research_problem: SupportedClaim

    objectives: list[
        SupportedClaim
    ]

    methodology: list[
        SupportedClaim
    ]

    datasets_or_data_sources: list[
        SupportedClaim
    ]

    key_findings: list[
        SupportedClaim
    ]

    contributions: list[
        SupportedClaim
    ]

    author_stated_limitations: list[
        AuthorStatedLimitation
    ]

    ai_inferred_limitations: list[
        InferredLimitation
    ]

    future_work: list[
        FutureWorkItem
    ]

    analysis_scope_note: str = (
        "This analysis is grounded only in the provided paper evidence and does not establish global research novelty."
    )