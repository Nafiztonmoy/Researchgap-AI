from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class EmbeddingResult:
    vector: list[float]
    model: str
    dimensions: int


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> EmbeddingResult:
        raise NotImplementedError

    @abstractmethod
    def embed_texts(
        self,
        texts: list[str],
    ) -> list[EmbeddingResult]:
        raise NotImplementedError