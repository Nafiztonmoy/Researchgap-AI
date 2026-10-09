from fastapi import APIRouter, HTTPException

from app.llm.groq_provider import GroqLLMProvider
from app.novelty.schemas import (
    NoveltyVerificationContext,
    NoveltyVerificationResponse,
)
from app.novelty.service import ResearchGapNoveltyService

router = APIRouter(
    prefix="/v1/novelty",
    tags=["novelty"],
)

service = ResearchGapNoveltyService(
    GroqLLMProvider()
)


@router.post(
    "/verify",
    response_model=NoveltyVerificationResponse,
)
def verify_gap_novelty(
    context: NoveltyVerificationContext,
) -> NoveltyVerificationResponse:
    if not context.gap_title or not context.gap_description:
        raise HTTPException(
            status_code=422,
            detail="Novelty verification requires at least a gap title and description.",
        )

    try:
        return service.verify(context)
    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Novelty verification failed: {exception}",
        )
