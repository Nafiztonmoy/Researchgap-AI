from app.sections.section_detector import SectionDetector


class PaperChunker:
    def __init__(
        self,
        max_chars: int = 3500,
        overlap_chars: int = 400,
    ):
        if overlap_chars >= max_chars:
            raise ValueError(
                "overlap_chars must be smaller than max_chars"
            )

        self.max_chars = max_chars
        self.overlap_chars = overlap_chars
        self.section_detector = SectionDetector()

    def chunk_pages(self, pages: list[dict]) -> list[dict]:
        chunks: list[dict] = []
        chunk_index = 0

        current_section: str | None = None

        for page in pages:
            page_number = int(page["page_number"])
            text = (page.get("text") or "").strip()

            if not text:
                continue

            segments, current_section = (
                self.section_detector.split_page(
                    text,
                    inherited_section=current_section,
                )
            )

            for segment in segments:
                section_title = segment["section_title"]
                segment_text = segment["text"]

                segment_chunks = self._split_text(
                    segment_text
                )

                for chunk_text in segment_chunks:
                    chunks.append(
                        {
                            "chunk_index": chunk_index,
                            "page_start": page_number,
                            "page_end": page_number,
                            "section_title": section_title,
                            "text": chunk_text,
                            "character_count": len(
                                chunk_text
                            ),
                        }
                    )

                    chunk_index += 1

        return chunks

    def _split_text(self, text: str) -> list[str]:
        text = text.strip()

        if not text:
            return []

        if len(text) <= self.max_chars:
            return [text]

        chunks: list[str] = []

        start = 0
        text_length = len(text)

        while start < text_length:
            target_end = min(
                start + self.max_chars,
                text_length,
            )

            end = target_end

            if target_end < text_length:
                search_start = start + int(
                    self.max_chars * 0.6
                )

                candidates = [
                    text.rfind(
                        "\n\n",
                        search_start,
                        target_end,
                    ),
                    text.rfind(
                        "\n",
                        search_start,
                        target_end,
                    ),
                    text.rfind(
                        ". ",
                        search_start,
                        target_end,
                    ),
                    text.rfind(
                        " ",
                        search_start,
                        target_end,
                    ),
                ]

                best_break = max(candidates)

                if best_break > start:
                    end = best_break + 1

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            if end >= text_length:
                break

            start = max(
                end - self.overlap_chars,
                start + 1,
            )

        return chunks