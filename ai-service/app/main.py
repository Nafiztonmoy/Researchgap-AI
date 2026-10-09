from fastapi import FastAPI

from app.api.v1.analysis import router as analysis_router
from app.api.v1.comparison import router as comparison_router
from app.api.v1.embeddings import router as embeddings_router
from app.api.v1.gaps import router as gaps_router
from app.api.v1.ideas import router as ideas_router
from app.api.v1.novelty import router as novelty_router
from app.api.v1.papers import router as papers_router


app = FastAPI(
    title="ResearchGap AI Service",
    version="0.1.0",
)

app.include_router(papers_router)
app.include_router(embeddings_router)
app.include_router(analysis_router)
app.include_router(comparison_router)
app.include_router(gaps_router)
app.include_router(novelty_router)
app.include_router(ideas_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "researchgap-ai",
    }