from fastapi import APIRouter, HTTPException

from app.analysis.context import PaperAnalysisContext
from app.analysis.schemas import SinglePaperAnalysis
from app.analysis.service import SinglePaperAnalyzer
from app.analysis.validator import (
    AnalysisEvidenceValidationError,
)
from app.llm.groq_provider import GroqLLMProvider


router = APIRouter(
    prefix="/v1/analysis",
    tags=["analysis"],
)


analyzer = SinglePaperAnalyzer(
    GroqLLMProvider()
)


@router.post(
    "/single-paper",
    response_model=SinglePaperAnalysis,
)
def analyze_single_paper(
    context: PaperAnalysisContext,
) -> SinglePaperAnalysis:
    try:
        return analyzer.analyze(context)

    except AnalysisEvidenceValidationError as exception:
        raise HTTPException(
            status_code=422,
            detail=str(exception),
        )

    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Analysis generation failed: "
                f"{exception}"
            ),
        )