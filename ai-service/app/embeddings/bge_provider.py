from sentence_transformers import SentenceTransformer

from app.embeddings.base import (
    EmbeddingProvider,
    EmbeddingResult,
)


class BgeEmbeddingProvider(EmbeddingProvider):
    MODEL_NAME = "BAAI/bge-small-en-v1.5"

    def __init__(self):
        self.model = SentenceTransformer(
            self.MODEL_NAME,
            device="cpu",
        )

    def embed_text(
        self,
        text: str,
    ) -> EmbeddingResult:
        vector = self.model.encode(
            text,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )

        values = vector.tolist()

        return EmbeddingResult(
            vector=values,
            model=self.MODEL_NAME,
            dimensions=len(values),
        )

    def embed_texts(
        self,
        texts: list[str],
    ) -> list[EmbeddingResult]:
        if not texts:
            return []

        vectors = self.model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=32,
        )

        results = []

        for vector in vectors:
            values = vector.tolist()

            results.append(
                EmbeddingResult(
                    vector=values,
                    model=self.MODEL_NAME,
                    dimensions=len(values),
                )
            )

        return results