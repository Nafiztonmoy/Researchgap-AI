from pathlib import Path

import pymupdf

from app.cleaners.text_cleaner import TextCleaner


class PDFParser:
    def __init__(self):
        self.text_cleaner = TextCleaner()

    def parse(self, file_path: str) -> dict:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"PDF not found: {file_path}"
            )

        document = pymupdf.open(file_path)

        pages = []

        for page_index in range(document.page_count):
            page = document.load_page(page_index)

            raw_text = page.get_text("text")

            text = self.text_cleaner.clean(
                raw_text
            )

            pages.append(
                {
                    "page_number": page_index + 1,
                    "text": text,
                    "character_count": len(text),
                }
            )

        full_text = "\n\n".join(
            page["text"]
            for page in pages
            if page["text"]
        )

        result = {
            "page_count": document.page_count,
            "pages": pages,
            "full_text": full_text,
            "character_count": len(full_text),
        }

        document.close()

        return result