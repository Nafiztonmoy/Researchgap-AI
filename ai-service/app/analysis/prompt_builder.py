import json

from app.analysis.context import (
    PaperAnalysisContext,
)


class SinglePaperPromptBuilder:
    def build(
        self,
        context: PaperAnalysisContext,
    ) -> tuple[str, str]:
        system_prompt = self._system_prompt()

        user_prompt = self._user_prompt(
            context
        )

        return system_prompt, user_prompt

    def _system_prompt(self) -> str:
        return """
You are an academic research analysis system.

Your task is to analyze exactly one research paper using
only the evidence supplied by the application.

STRICT RULES:

1. Do not use outside knowledge.

2. Do not invent facts, results, datasets, limitations,
   contributions, or future work.

3. Every substantive analytical claim must cite one or
   more evidence IDs supplied in the input.

4. Evidence IDs beginning with "L" represent
   author-stated limitation or future-work evidence.

5. Evidence IDs beginning with "I" represent contextual
   evidence that may support cautious AI inference.

6. AUTHOR-STATED LIMITATIONS:
   - May only be created when supported by L evidence.
   - Never rewrite an AI inference as if the authors
     explicitly stated it.

7. 7. AI-INFERRED LIMITATIONS:
   - Must be clearly marked as ai_inferred.
   - Must explain the reasoning.
   - Must cite at least one I-prefixed inference
     evidence ID.
   - May additionally cite L-prefixed evidence when
     relevant.
   - Must use cautious language.
   - Do not claim certainty where evidence is indirect.
   
8. FUTURE WORK:
   - "author_suggested" requires L evidence showing the
     authors proposed or acknowledged that direction.
   - "ai_suggested" must remain a proposal derived from
     supplied evidence and must not be presented as an
     author statement.

9. Do not claim that an idea is globally novel,
   unprecedented, or absent from the literature.
   External literature verification has not yet been
   performed.

10. If the evidence is insufficient for a requested
    category, return an empty list rather than guessing.

11. Evidence IDs must exactly match IDs supplied in the
    input. Never create new evidence IDs.

12. Keep research problem, methodology, findings,
    contributions, limitations, and future work
    conceptually distinct.

Return only data matching the required structured
response schema.
""".strip()

    def _user_prompt(
        self,
        context: PaperAnalysisContext,
    ) -> str:
        payload = {
            "paper": {
                "paper_id": context.paper_id,
                "title": context.title,
                "authors": context.authors,
                "publication_year":
                    context.publication_year,
                "venue": context.venue,
            },
            "author_stated_evidence": [
                evidence.model_dump()
                for evidence
                in context.explicit_evidence
            ],
            "inference_source_evidence": [
                evidence.model_dump()
                for evidence
                in context.inference_evidence
            ],
        }

        evidence_json = json.dumps(
            payload,
            ensure_ascii=False,
            indent=2,
        )

        return f"""
Analyze the following paper evidence.

The paper metadata is contextual information only.
All analytical claims must still be grounded in the
provided evidence IDs.

EVIDENCE PAYLOAD:

{evidence_json}

Produce a structured single-paper analysis containing:

- research problem
- objectives
- methodology
- datasets or data sources
- key findings
- contributions
- author-stated limitations
- AI-inferred limitations
- future work

Remember:

Author-stated limitation claims must use L-prefixed
evidence.

AI-inferred limitation claims must remain explicitly
inferred and must include reasoning.

Do not make any global novelty claim.
""".strip()