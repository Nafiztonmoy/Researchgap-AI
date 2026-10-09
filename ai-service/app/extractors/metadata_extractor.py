import re


class MetadataExtractor:
    DOI_PATTERN = re.compile(
        r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b",
        re.IGNORECASE,
    )

    STOP_HEADINGS = {
        "background",
        "background & summary",
        "background and summary",
        "introduction",
        "keywords",
        "key words",
        "methods",
        "methodology",
        "materials and methods",
    }

    KEYWORD_HEADINGS = {
        "keywords",
        "key words",
        "index terms",
    }

    AFFILIATION_MARKERS = (
        "department of",
        "university",
        "institute",
        "school of",
        "faculty of",
        "college of",
        "laboratory",
        "centre for",
        "center for",
    )

    def _is_cover_page(self, text: str) -> bool:
        lower = text.lower()
        cover_markers = (
            "eprints@",
            "whiterose.ac.uk",
            "deposited via",
            "research online url",
            "downloaded from",
            "institutional repository",
            "university repository",
            "proceedings paper:",
            "accepted version",
        )
        return any(marker in lower for marker in cover_markers)

    def extract(self, pages: list[dict]) -> dict:
        if not pages:
            return {
                "title": None,
                "authors": [],
                "abstract": None,
                "publication_year": None,
                "venue": None,
                "doi": None,
                "keywords": [],
            }

        start_idx = 0
        if len(pages) > 1 and self._is_cover_page(pages[0].get("text") or ""):
            start_idx = 1

        first_page_text = (
            pages[start_idx].get("text") or ""
        ).strip()

        first_two_pages_text = "\n".join(
            (page.get("text") or "")
            for page in pages[start_idx:start_idx + 2]
        )

        title_lines = self._extract_title_lines(
            first_page_text
        )

        title = (
            " ".join(title_lines)
            if title_lines
            else None
        )

        return {
            "title": title,
            "authors": self._extract_authors(
                first_page_text,
                len(title_lines),
            ),
            "abstract": self._extract_abstract(
                first_page_text
            ),
            "publication_year": self._extract_year(
                first_two_pages_text
            ),
            "venue": self._extract_venue(
                first_two_pages_text
            ),
            "doi": self._extract_doi(
                first_two_pages_text
            ),
            "keywords": self._extract_keywords(
                first_two_pages_text
            ),
        }

    def _extract_title_lines(
        self,
        text: str,
    ) -> list[str]:
        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        if not lines:
            return []

        title_lines: list[str] = []

        for line in lines[:10]:
            lower = line.lower()

            # Skip header boilerplate, URLs, emails
            if (
                "@" in line
                or "http://" in lower
                or "https://" in lower
                or "doi:" in lower
                or "url:" in lower
                or "isbn:" in lower
                or "issn:" in lower
                or "proceedings paper:" in lower
                or "accepted version" in lower
            ):
                continue

            if (
                "department of" in lower
                or "university of" in lower
                or lower == "abstract"
                or lower.startswith("abstract")
                or "corresponding author" in lower
            ):
                break

            if (
                re.search(
                    r"\b[a-zA-Z]+\d(?:,|\s|$)",
                    line,
                )
                and len(title_lines) >= 1
            ):
                break

            title_lines.append(line)

            if len(title_lines) >= 4:
                break

        return title_lines

    def _extract_authors(
        self,
        text: str,
        title_line_count: int,
    ) -> list[str]:
        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        if not lines:
            return []

        author_lines: list[str] = []

        for line in lines[
            title_line_count:title_line_count + 8
        ]:
            lower = line.lower()

            if lower == "abstract":
                break

            if any(
                marker in lower
                for marker in self.AFFILIATION_MARKERS
            ):
                break

            if (
                "@" in line
                or "corresponding author" in lower
            ):
                break

            author_lines.append(line)

        if not author_lines:
            return []

        authors_text = " ".join(author_lines)

        authors_text = re.sub(
            r"(?<=[A-Za-z.)])\d+(?:,\d+)*",
            "",
            authors_text,
        )

        authors_text = (
            authors_text
            .replace("†", "")
            .replace("‡", "")
            .replace("*", "")
        )

        authors_text = re.sub(
            r"\s+\band\b\s+",
            ", ",
            authors_text,
            flags=re.IGNORECASE,
        )

        authors = []

        for author in authors_text.split(","):
            cleaned = re.sub(
                r"\s+",
                " ",
                author,
            ).strip(" ;")

            if not cleaned:
                continue

            lower = cleaned.lower()

            if any(
                marker in lower
                for marker in self.AFFILIATION_MARKERS
            ):
                continue

            authors.append(cleaned)

        return authors

    def _extract_abstract(
        self,
        text: str,
    ) -> str | None:
        lines = text.splitlines()

        abstract_started = False
        abstract_lines = []

        for line in lines:
            stripped = line.strip()

            if not stripped:
                continue

            normalized = stripped.lower()

            if not abstract_started:
                if normalized == "abstract":
                    abstract_started = True

                continue

            if normalized in self.STOP_HEADINGS:
                break

            abstract_lines.append(stripped)

        abstract = " ".join(
            abstract_lines
        ).strip()

        return abstract or None

    def _extract_year(
        self,
        text: str,
    ) -> int | None:
        years = re.findall(
            r"\b(?:19|20)\d{2}\b",
            text,
        )

        if not years:
            return None

        return int(years[-1])

    def _extract_venue(
        self,
        text: str,
    ) -> str | None:
        patterns = [
            r"accepted for publication in\s+([^\n.]+)",
            r"published in\s+([^\n.]+)",
        ]

        for pattern in patterns:
            match = re.search(
                pattern,
                text,
                flags=re.IGNORECASE,
            )

            if not match:
                continue

            venue = re.sub(
                r"\s+",
                " ",
                match.group(1),
            ).strip(" .;")

            return venue or None

        return None

    def _extract_keywords(
        self,
        text: str,
    ) -> list[str]:
        lines = text.splitlines()

        for index, line in enumerate(lines):
            stripped = line.strip()

            if not stripped:
                continue

            normalized = stripped.lower()

            inline_match = re.match(
                r"^(keywords|key words|index terms)\s*[:—-]\s*(.+)$",
                stripped,
                flags=re.IGNORECASE,
            )

            if inline_match:
                return self._split_keywords(
                    inline_match.group(2)
                )

            if normalized in self.KEYWORD_HEADINGS:
                keyword_lines = []

                for next_line in lines[index + 1:index + 4]:
                    next_line = next_line.strip()

                    if not next_line:
                        continue

                    lower = next_line.lower()

                    if lower in self.STOP_HEADINGS:
                        break

                    keyword_lines.append(next_line)

                return self._split_keywords(
                    " ".join(keyword_lines)
                )

        return []

    def _split_keywords(
        self,
        value: str,
    ) -> list[str]:
        parts = re.split(
            r"[,;•]+",
            value,
        )

        keywords = []

        for part in parts:
            keyword = re.sub(
                r"\s+",
                " ",
                part,
            ).strip(" .")

            if keyword:
                keywords.append(keyword)

        return keywords

    def _extract_doi(
        self,
        text: str,
    ) -> str | None:
        match = self.DOI_PATTERN.search(text)

        if not match:
            return None

        return match.group(0).rstrip(".,)")