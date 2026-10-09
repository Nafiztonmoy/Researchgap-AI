import re


class TextCleaner:
    def clean(self, text: str) -> str:
        if not text:
            return ""

        cleaned = text

        # Fix words split across line/page extraction:
        # "vi-\n sion" -> "vision"
        # "vi- sion"   -> "vision"
        cleaned = re.sub(
            r"(?<=[A-Za-z])-\s+(?=[a-z])",
            "",
            cleaned,
        )

        # Normalize excessive horizontal whitespace.
        cleaned = re.sub(
            r"[ \t]+",
            " ",
            cleaned,
        )

        # Normalize spaces around newlines.
        cleaned = re.sub(
            r" *\n *",
            "\n",
            cleaned,
        )

        # Avoid huge empty gaps.
        cleaned = re.sub(
            r"\n{3,}",
            "\n\n",
            cleaned,
        )

        return cleaned.strip()