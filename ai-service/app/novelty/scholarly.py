import logging
import re
import xml.etree.ElementTree as ET
from typing import Any
import httpx

logger = logging.getLogger(__name__)


def sanitize_query(query: str, max_words: int = 8) -> str:
    cleaned = re.sub(r"[^\w\s-]", " ", query)
    words = [w.strip() for w in cleaned.split() if len(w.strip()) > 2]
    # Filter common stop words
    stop_words = {
        "the", "and", "for", "with", "from", "that", "this", "which",
        "their", "there", "into", "over", "under", "about", "using",
        "study", "paper", "research", "proposed", "novel", "approach"
    }
    meaningful = [w for w in words if w.lower() not in stop_words]
    if not meaningful:
        meaningful = words[:max_words]
    return " ".join(meaningful[:max_words])


class ScholarlySearchClient:
    def __init__(self, timeout: float = 8.0):
        self.timeout = timeout

    def search_semantic_scholar(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        clean_q = sanitize_query(query)
        if not clean_q:
            return []

        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": clean_q,
            "limit": limit,
            "fields": "title,authors,year,venue,citationCount,abstract,url",
        }
        headers = {
            "User-Agent": "ResearchGapAI/1.0 (academic research tool)",
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    papers = []
                    for item in data.get("data", []):
                        authors = [a.get("name") for a in item.get("authors", []) if a.get("name")]
                        title = (item.get("title") or "").strip()
                        if not title:
                            continue
                        papers.append({
                            "title": title,
                            "authors": authors[:5],
                            "year": item.get("year"),
                            "venue": item.get("venue") or "Scholarly Publication",
                            "citation_count": item.get("citationCount") or 0,
                            "abstract": (item.get("abstract") or "").strip()[:800],
                            "url": item.get("url") or f"https://www.semanticscholar.org/paper/{item.get('paperId', '')}",
                            "source": "Semantic Scholar",
                        })
                    return papers
                else:
                    logger.warning("Semantic Scholar API returned status %s: %s", resp.status_code, resp.text[:200])
        except Exception as e:
            logger.warning("Semantic Scholar search failed: %s", e)

        return []

    def search_arxiv(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        clean_q = sanitize_query(query)
        if not clean_q:
            return []

        url = "http://export.arxiv.org/api/query"
        params = {
            "search_query": f"all:{clean_q}",
            "start": 0,
            "max_results": limit,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params=params)
                if resp.status_code == 200:
                    root = ET.fromstring(resp.content)
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    papers = []
                    for entry in root.findall("atom:entry", ns):
                        title_el = entry.find("atom:title", ns)
                        summary_el = entry.find("atom:summary", ns)
                        id_el = entry.find("atom:id", ns)
                        published_el = entry.find("atom:published", ns)
                        author_els = entry.findall("atom:author/atom:name", ns)

                        title = (title_el.text or "").strip().replace("\n", " ") if title_el is not None else ""
                        if not title:
                            continue

                        year = None
                        if published_el is not None and published_el.text:
                            year_match = re.match(r"^(\d{4})", published_el.text)
                            if year_match:
                                year = int(year_match.group(1))

                        authors = [a.text.strip() for a in author_els if a.text]
                        url_val = id_el.text.strip() if id_el is not None and id_el.text else None
                        abstract = (summary_el.text or "").strip().replace("\n", " ")[:800] if summary_el is not None else ""

                        papers.append({
                            "title": title,
                            "authors": authors[:5],
                            "year": year,
                            "venue": "arXiv preprint",
                            "citation_count": 0,
                            "abstract": abstract,
                            "url": url_val,
                            "source": "arXiv",
                        })
                    return papers
        except Exception as e:
            logger.warning("arXiv search failed: %s", e)

        return []

    def search_literature(self, query: str, limit: int = 6) -> list[dict[str, Any]]:
        # Try Semantic Scholar first
        results = self.search_semantic_scholar(query, limit=limit)
        if len(results) >= 2:
            return results

        # Try arXiv as supplemental or fallback
        arxiv_results = self.search_arxiv(query, limit=limit)
        seen_titles = {r["title"].lower() for r in results}
        for item in arxiv_results:
            if item["title"].lower() not in seen_titles:
                results.append(item)
                seen_titles.add(item["title"].lower())
            if len(results) >= limit:
                break

        return results
