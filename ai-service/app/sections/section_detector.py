import re


class SectionDetector:
    SECTION_ALIASES = {
        "abstract": "Abstract",
        "introduction": "Introduction",
        "background": "Background",
        "background & summary": "Background & Summary",
        "background and summary": "Background & Summary",
        "related work": "Related Work",
        "related works": "Related Work",
        "literature review": "Literature Review",
        "materials and methods": "Materials and Methods",
        "materials & methods": "Materials and Methods",
        "methods": "Methods",
        "method": "Methods",
        "methodology": "Methodology",
        "experimental setup": "Experimental Setup",
        "experimental settings": "Experimental Setup",
        "dataset": "Dataset",
        "data": "Data",
        "data collection": "Data Collection",
        "implementation": "Implementation",
        "experiments": "Experiments",
        "results": "Results",
        "results and discussion": "Results and Discussion",
        "results & discussion": "Results and Discussion",
        "discussion": "Discussion",
        "limitations": "Limitations",
        "limitation": "Limitations",
        "limitations and future work": "Limitations and Future Work",
        "limitations & future work": "Limitations and Future Work",
        "future work": "Future Work",
        "conclusion": "Conclusion",
        "conclusions": "Conclusion",
        "conclusion and future work": "Conclusion and Future Work",
        "conclusion & future work": "Conclusion and Future Work",
        "references": "References",
        "acknowledgements": "Acknowledgements",
        "acknowledgments": "Acknowledgements",
    }

    def normalize_heading(self, line: str) -> str:
        heading = line.strip()

        heading = re.sub(
            r"^\s*(?:section\s+)?\d+(?:\.\d+)*[\.\):\-]?\s*",
            "",
            heading,
            flags=re.IGNORECASE,
        )

        heading = re.sub(
            r"\s+",
            " ",
            heading,
        )

        return heading.strip().lower()

    def detect_heading(self, line: str) -> str | None:
        line = line.strip()

        if not line:
            return None

        if len(line) > 100:
            return None

        normalized = self.normalize_heading(line)

        return self.SECTION_ALIASES.get(normalized)

    def split_page(
        self,
        text: str,
        inherited_section: str | None = None,
    ) -> tuple[list[dict], str | None]:
        lines = text.splitlines()

        segments: list[dict] = []

        current_section = inherited_section
        buffer: list[str] = []

        def flush_buffer() -> None:
            nonlocal buffer

            content = "\n".join(buffer).strip()

            if content:
                segments.append(
                    {
                        "section_title": current_section,
                        "text": content,
                    }
                )

            buffer = []

        for line in lines:
            heading = self.detect_heading(line)

            if heading:
                flush_buffer()

                current_section = heading

                # Keep the heading in the extracted evidence text.
                buffer.append(line.strip())

                continue

            buffer.append(line)

        flush_buffer()

        return segments, current_section