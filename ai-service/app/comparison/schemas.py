from pydantic import BaseModel, ConfigDict, Field


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )


class PaperSummaryForComparison(StrictSchema):
    paper_id: str
    title: str
    authors: list[str] = Field(default_factory=list)
    publication_year: int | None = None
    venue: str | None = None
    research_problem: str
    methodology: list[str] = Field(default_factory=list)
    datasets: list[str] = Field(default_factory=list)
    key_findings: list[str] = Field(default_factory=list)
    author_stated_limitations: list[str] = Field(default_factory=list)
    ai_inferred_limitations: list[str] = Field(default_factory=list)


class ComparisonContext(StrictSchema):
    project_id: str
    project_title: str
    research_domain: str | None = None
    research_question: str | None = None
    papers: list[PaperSummaryForComparison]


class MatrixRow(StrictSchema):
    dimension: str
    values: dict[str, str]


class ContradictionOrTension(StrictSchema):
    topic: str
    paper_a_id: str
    paper_a_title: str
    paper_a_claim: str
    paper_b_id: str
    paper_b_title: str
    paper_b_claim: str
    analysis: str


class SharedLimitation(StrictSchema):
    theme: str
    description: str
    affected_paper_ids: list[str]
    gap_potential: str


class ProjectComparisonResponse(StrictSchema):
    project_title: str
    literature_synthesis: str
    methodology_landscape: str
    dataset_landscape: str
    matrix_rows: list[MatrixRow]
    tensions_and_contradictions: list[ContradictionOrTension]
    shared_limitations: list[SharedLimitation]
