<?php

namespace App\Services\Analysis;

use App\Models\Paper;
use App\Services\Retrieval\EvidenceCitationService;
use App\Services\Retrieval\EvidenceRetrievalService;
use App\Services\Retrieval\LimitationEvidenceService;

class SinglePaperAnalysisContextBuilder
{
    private const MAX_EXPLICIT_CHARS = 800;

    private const MAX_INFERENCE_CHARS = 550;

    private const MAX_INFERENCE_ITEMS = 6;

    public function __construct(
        private readonly EvidenceRetrievalService $retrieval,
        private readonly EvidenceCitationService $citations,
        private readonly LimitationEvidenceService $limitations,
    ) {}

    public function build(Paper $paper): array
    {
        $limitationEvidence = $this->limitations
            ->forPaper($paper);

        $explicitCitations =
            $limitationEvidence[
                'explicit_author_statements'
            ];

        $generalEvidence = $this->retrieval->forPaper(
            $paper,
            'What are the research problem, objectives, methodology, dataset or data sources, experiments, evaluation results, key findings, contributions, weaknesses, and unresolved issues in this paper?',
            16
        );

        $explicitChunkIndexes = collect(
            $explicitCitations
        )
            ->pluck('location.chunk_index')
            ->all();

        $generalEvidence = array_values(
            array_filter(
                $generalEvidence,
                static fn (array $item): bool => ! in_array(
                    $item['chunk_index'],
                    $explicitChunkIndexes,
                    true
                )
            )
        );

        /*
         * Keep only the strongest evidence so the LLM
         * request stays comfortably below API token limits.
         */
        $generalEvidence = array_slice(
            $generalEvidence,
            0,
            self::MAX_INFERENCE_ITEMS
        );

        $inferenceCitations = $this->citations
            ->build(
                $generalEvidence,
                'I'
            );

        return [
            'paper_id' => $paper->id,

            'title' => $paper->title
                ?? $paper->original_filename,

            'authors' => $this->authors($paper),

            'publication_year' => $paper->publication_year,

            'venue' => $paper->venue,

            'explicit_evidence' => array_map(
                fn (array $citation): array => [
                    'citation_id' => $citation['citation_id'],

                    'page' => $citation['location']['page_label'],

                    'section' => $citation['location']['section'],

                    'excerpt' => $this->compactExcerpt(
                        $citation['excerpt'],
                        self::MAX_EXPLICIT_CHARS
                    ),

                    'evidence_type' => 'author_stated',
                ],
                $explicitCitations
            ),

            'inference_evidence' => array_map(
                fn (array $citation): array => [
                    'citation_id' => $citation['citation_id'],

                    'page' => $citation['location']['page_label'],

                    'section' => $citation['location']['section'],

                    'excerpt' => $this->compactExcerpt(
                        $citation['excerpt'],
                        self::MAX_INFERENCE_CHARS
                    ),

                    'evidence_type' => 'inference_source',
                ],
                $inferenceCitations
            ),
        ];
    }

    private function compactExcerpt(
        string $text,
        int $maxCharacters,
    ): string {
        $text = trim(
            preg_replace(
                '/\s+/u',
                ' ',
                $text
            ) ?? $text
        );

        if (
            mb_strlen($text)
            <= $maxCharacters
        ) {
            return $text;
        }

        return mb_substr(
            $text,
            0,
            $maxCharacters
        ).'…';
    }

    private function authors(Paper $paper): array
    {
        if (is_array($paper->authors)) {
            return $paper->authors;
        }

        if (! is_string($paper->authors)) {
            return [];
        }

        $decoded = json_decode(
            $paper->authors,
            true
        );

        return is_array($decoded)
            ? $decoded
            : [];
    }
}
