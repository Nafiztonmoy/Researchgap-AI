import os

from dotenv import load_dotenv
from groq import Groq
from pydantic import ValidationError

from app.llm.base import (
    LLMProvider,
    T,
)


load_dotenv()


class GroqLLMProvider(LLMProvider):
    MAX_ATTEMPTS = 3

    def __init__(self):
        api_key = os.getenv(
            "GROQ_API_KEY"
        )

        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not configured."
            )

        self.model = os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-20b",
        )

        self.client = Groq(
            api_key=api_key,
        )

    def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_model: type[T],
        instruction: str | None = None,
    ) -> T:
        correction = ""

        last_error: Exception | None = None

        for attempt in range(
            1,
            self.MAX_ATTEMPTS + 1,
        ):
            compact_instruction = instruction.strip() if instruction else """
Return ONLY one valid JSON object.

Required top-level keys exactly:
- research_problem
- objectives
- methodology
- datasets_or_data_sources
- key_findings
- contributions
- author_stated_limitations
- ai_inferred_limitations
- future_work
- analysis_scope_note

Set "analysis_scope_note" exactly to: "This analysis is grounded only in the provided paper evidence and does not establish global research novelty."

Claim objects:
{
  "claim": "...",
  "evidence_ids": ["I1"]
}

Author-stated limitation objects:
{
  "limitation": "...",
  "evidence_ids": ["L1"],
  "source_type": "author_stated"
}

AI-inferred limitation objects:
{
  "limitation": "...",
  "reasoning": "...",
  "evidence_ids": ["I1"],
  "confidence": "low|medium|high",
  "source_type": "ai_inferred"
}

Future-work objects:
{
  "proposal": "...",
  "evidence_ids": ["L1"],
  "origin": "author_suggested|ai_suggested"
}

Keep the response concise.

Maximum:
- 3 objectives
- 4 methodology items
- 3 dataset/data-source items
- 4 key findings
- 3 contributions
- 3 author-stated limitations
- 3 AI-inferred limitations
- 4 future-work items

Do not output markdown or code fences.
""".strip()

            final_user_prompt = (
                user_prompt
                + "\n\n"
                + compact_instruction
                + correction
            )

            response = (
                self.client
                .chat
                .completions
                .create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {
                            "role": "user",
                            "content": final_user_prompt,
                        },
                    ],
                    response_format={
                        "type": "json_object",
                    },
                    temperature=0,
                    reasoning_effort="low",
                    reasoning_format="hidden",
                    max_completion_tokens=4096,
                )
            )

            content = (
                response
                .choices[0]
                .message
                .content
            )

            if not content:
                last_error = RuntimeError(
                    "Groq returned an empty response."
                )

                correction = (
                    "\n\nPrevious attempt was empty. "
                    "Return the required JSON object."
                )

                continue

            try:
                return response_model.model_validate_json(
                    content
                )

            except ValidationError as exception:
                last_error = exception

                error_text = str(exception)

                if len(error_text) > 1200:
                    error_text = error_text[:1200]

                correction = (
                    "\n\nThe previous attempt failed "
                    "schema validation. Correct the JSON "
                    "according to these validation errors:\n"
                    + error_text
                )

        raise RuntimeError(
            "Groq failed to produce a valid "
            "structured response after "
            f"{self.MAX_ATTEMPTS} attempts. "
            f"Last error: {last_error}"
        )