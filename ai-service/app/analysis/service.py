from app.analysis.context import PaperAnalysisContext
from app.analysis.prompt_builder import SinglePaperPromptBuilder
from app.analysis.schemas import SinglePaperAnalysis
from app.analysis.validator import AnalysisEvidenceValidator
from app.llm.base import LLMProvider


class SinglePaperAnalyzer:
    def __init__(
        self,
        provider: LLMProvider,
    ):
        self.provider = provider
        self.prompt_builder = SinglePaperPromptBuilder()
        self.validator = AnalysisEvidenceValidator()

    def analyze(
        self,
        context: PaperAnalysisContext,
    ) -> SinglePaperAnalysis:
        system_prompt, user_prompt = (
            self.prompt_builder.build(context)
        )

        analysis = self.provider.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=SinglePaperAnalysis,
        )

        self.validator.validate(
            analysis,
            context,
        )

        return analysis