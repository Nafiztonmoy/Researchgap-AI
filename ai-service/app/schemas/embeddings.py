from pydantic import BaseModel, Field


class EmbeddingRequest(BaseModel):
    texts: list[str] = Field(
        min_length=1,
        max_length=100,
    )


class EmbeddingItem(BaseModel):
    index: int
    vector: list[float]
    model: str
    dimensions: int


class EmbeddingResponse(BaseModel):
    model: str
    dimensions: int
    count: int
    embeddings: list[EmbeddingItem]