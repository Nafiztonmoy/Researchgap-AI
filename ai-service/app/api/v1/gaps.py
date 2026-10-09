from fastapi import APIRouter, HTTPException

from app.gaps.schemas import (
    GapDiscoveryContext,
    GapDiscoveryResponse,
)
from app.gaps.service import ResearchGapDiscoveryService
from app.llm.groq_provider import GroqLLMProvider


router = APIRouter(
    prefix="/v1/gaps",
    tags=["gaps"],
)

service = ResearchGapDiscoveryService(
    GroqLLMProvider()
)


@router.post(
    "/discover",
    response_model=GapDiscoveryResponse,
)
def discover_research_gaps(
    context: GapDiscoveryContext,
) -> GapDiscoveryResponse:
    if not context.papers and not context.shared_limitations:
        raise HTTPException(
            status_code=422,
            detail="Research gap discovery requires analyzed papers or shared limitations.",
        )

    try:
        return service.discover(context)
    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Research gap discovery failed: {exception}",
        )
