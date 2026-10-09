from app.embeddings.base import (
    EmbeddingProvider,
    EmbeddingResult,
)


class EmbeddingService:
    def __init__(
        self,
        provider: EmbeddingProvider,
    ):
        self.provider = provider

    def embed_chunk(
        self,
        text: str,
    ) -> EmbeddingResult:
        cleaned_text = text.strip()

        if not cleaned_text:
            raise ValueError(
                "Cannot generate embedding for empty text."
            )

        result = self.provider.embed_text(
            cleaned_text
        )

        self._validate_result(result)

        return result

    def embed_chunks(
        self,
        texts: list[str],
    ) -> list[EmbeddingResult]:
        cleaned_texts = [
            text.strip()
            for text in texts
            if text.strip()
        ]

        if not cleaned_texts:
            return []

        results = self.provider.embed_texts(
            cleaned_texts
        )

        if len(results) != len(cleaned_texts):
            raise ValueError(
                "Embedding provider returned an unexpected number of vectors."
            )

        for result in results:
            self._validate_result(result)

        return results

    def _validate_result(
        self,
        result: EmbeddingResult,
    ) -> None:
        if not result.vector:
            raise ValueError(
                "Embedding vector cannot be empty."
            )

        if result.dimensions != len(result.vector):
            raise ValueError(
                "Embedding dimensions do not match vector length."
            )

        if not result.model.strip():
            raise ValueError(
                "Embedding model name cannot be empty."
            )