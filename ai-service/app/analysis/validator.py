from app.analysis.context import PaperAnalysisContext
from app.analysis.schemas import (
    SinglePaperAnalysis,
    SupportedClaim,
)


class AnalysisEvidenceValidationError(ValueError):
    pass


class AnalysisEvidenceValidator:
    def validate(
        self,
        analysis: SinglePaperAnalysis,
        context: PaperAnalysisContext,
    ) -> None:
        explicit_ids = {
            evidence.citation_id
            for evidence in context.explicit_evidence
        }

        inference_ids = {
            evidence.citation_id
            for evidence in context.inference_evidence
        }

        self._validate_context_ids(
            explicit_ids,
            inference_ids,
        )

        all_ids = explicit_ids | inference_ids

        self._validate_supported_claim(
            analysis.research_problem,
            all_ids,
            "research_problem",
        )

        self._validate_claim_list(
            analysis.objectives,
            all_ids,
            "objectives",
        )

        self._validate_claim_list(
            analysis.methodology,
            all_ids,
            "methodology",
        )

        self._validate_claim_list(
            analysis.datasets_or_data_sources,
            all_ids,
            "datasets_or_data_sources",
        )

        self._validate_claim_list(
            analysis.key_findings,
            all_ids,
            "key_findings",
        )

        self._validate_claim_list(
            analysis.contributions,
            all_ids,
            "contributions",
        )

        for index, limitation in enumerate(
            analysis.author_stated_limitations
        ):
            self._validate_ids(
                limitation.evidence_ids,
                explicit_ids,
                f"author_stated_limitations[{index}]",
            )

        for index, limitation in enumerate(
            analysis.ai_inferred_limitations
        ):
            self._validate_inferred_ids(
                limitation.evidence_ids,
                explicit_ids,
                inference_ids,
                f"ai_inferred_limitations[{index}]",
            )

        for index, item in enumerate(
            analysis.future_work
        ):
            if item.origin == "author_suggested":
                allowed_ids = explicit_ids
            else:
                allowed_ids = all_ids

            self._validate_ids(
                item.evidence_ids,
                allowed_ids,
                f"future_work[{index}]",
            )

    def _validate_context_ids(
        self,
        explicit_ids: set[str],
        inference_ids: set[str],
    ) -> None:
        overlap = explicit_ids & inference_ids

        if overlap:
            raise AnalysisEvidenceValidationError(
                "Evidence IDs appear in both explicit "
                "and inference buckets: "
                + ", ".join(sorted(overlap))
            )

        invalid_explicit = {
            citation_id
            for citation_id in explicit_ids
            if not citation_id.startswith("L")
        }

        if invalid_explicit:
            raise AnalysisEvidenceValidationError(
                "Explicit evidence IDs must start with L: "
                + ", ".join(sorted(invalid_explicit))
            )

        invalid_inference = {
            citation_id
            for citation_id in inference_ids
            if not citation_id.startswith("I")
        }

        if invalid_inference:
            raise AnalysisEvidenceValidationError(
                "Inference evidence IDs must start with I: "
                + ", ".join(sorted(invalid_inference))
            )

    def _validate_claim_list(
        self,
        claims: list[SupportedClaim],
        allowed_ids: set[str],
        field_name: str,
    ) -> None:
        for index, claim in enumerate(claims):
            self._validate_supported_claim(
                claim,
                allowed_ids,
                f"{field_name}[{index}]",
            )

    def _validate_supported_claim(
        self,
        claim: SupportedClaim,
        allowed_ids: set[str],
        field_name: str,
    ) -> None:
        self._validate_ids(
            claim.evidence_ids,
            allowed_ids,
            field_name,
        )

    def _validate_inferred_ids(
        self,
        evidence_ids: list[str],
        explicit_ids: set[str],
        inference_ids: set[str],
        field_name: str,
    ) -> None:
        if not evidence_ids:
            raise AnalysisEvidenceValidationError(
                f"{field_name} must contain at least "
                "one evidence ID."
            )

        allowed_ids = explicit_ids | inference_ids

        unknown_ids = [
            citation_id
            for citation_id in evidence_ids
            if citation_id not in allowed_ids
        ]

        if unknown_ids:
            raise AnalysisEvidenceValidationError(
                f"{field_name} contains invalid "
                "evidence IDs: "
                + ", ".join(unknown_ids)
            )

    def _validate_ids(
        self,
        evidence_ids: list[str],
        allowed_ids: set[str],
        field_name: str,
    ) -> None:
        if not evidence_ids:
            raise AnalysisEvidenceValidationError(
                f"{field_name} must contain at least "
                "one evidence ID."
            )

        unknown_ids = [
            citation_id
            for citation_id in evidence_ids
            if citation_id not in allowed_ids
        ]

        if unknown_ids:
            raise AnalysisEvidenceValidationError(
                f"{field_name} contains invalid "
                "evidence IDs: "
                + ", ".join(unknown_ids)
            )