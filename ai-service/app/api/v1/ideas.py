from fastapi import APIRouter, HTTPException

from app.ideas.schemas import (
    ResearchIdeaGenerationContext,
    ResearchIdeaProposal,
)
from app.ideas.service import ResearchIdeaGeneratorService
from app.llm.groq_provider import GroqLLMProvider

router = APIRouter(
    prefix="/v1/ideas",
    tags=["ideas"],
)

service = ResearchIdeaGeneratorService(
    GroqLLMProvider()
)


@router.post(
    "/generate",
    response_model=ResearchIdeaProposal,
)
def generate_research_idea(
    context: ResearchIdeaGenerationContext,
) -> ResearchIdeaProposal:
    if not context.gap_title or not context.gap_description:
        raise HTTPException(
            status_code=422,
            detail="Research idea generation requires a target gap title and description.",
        )

    try:
        return service.generate(context)
    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Research idea blueprint generation failed: {exception}",
        )
