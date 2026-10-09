from fastapi import APIRouter, HTTPException

from app.embeddings.bge_provider import BgeEmbeddingProvider
from app.embeddings.service import EmbeddingService
from app.schemas.embeddings import (
    EmbeddingItem,
    EmbeddingRequest,
    EmbeddingResponse,
)

router = APIRouter(
    prefix="/v1/embeddings",
    tags=["embeddings"],
)

embedding_service = EmbeddingService(
    BgeEmbeddingProvider()
)


@router.post(
    "/batch",
    response_model=EmbeddingResponse,
)
async def embed_batch(
    request: EmbeddingRequest,
) -> EmbeddingResponse:
    try:
        results = embedding_service.embed_chunks(
            request.texts
        )

        if not results:
            raise HTTPException(
                status_code=422,
                detail="No non-empty texts were provided.",
            )

        embeddings = [
            EmbeddingItem(
                index=index,
                vector=result.vector,
                model=result.model,
                dimensions=result.dimensions,
            )
            for index, result in enumerate(results)
        ]

        return EmbeddingResponse(
            model=results[0].model,
            dimensions=results[0].dimensions,
            count=len(results),
            embeddings=embeddings,
        )

    except HTTPException:
        raise

    except ValueError as exception:
        raise HTTPException(
            status_code=422,
            detail=str(exception),
        )

    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(exception)}",
        )