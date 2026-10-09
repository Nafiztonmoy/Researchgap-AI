from fastapi import APIRouter, HTTPException

from app.comparison.schemas import (
    ComparisonContext,
    ProjectComparisonResponse,
)
from app.comparison.service import ProjectComparisonService
from app.llm.groq_provider import GroqLLMProvider


router = APIRouter(
    prefix="/v1/comparison",
    tags=["comparison"],
)

service = ProjectComparisonService(
    GroqLLMProvider()
)


@router.post(
    "/project",
    response_model=ProjectComparisonResponse,
)
def compare_project_papers(
    context: ComparisonContext,
) -> ProjectComparisonResponse:
    if len(context.papers) < 2:
        raise HTTPException(
            status_code=422,
            detail="Comparison requires at least 2 papers.",
        )

    try:
        return service.compare(context)
    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Cross-paper comparison failed: {exception}",
        )
