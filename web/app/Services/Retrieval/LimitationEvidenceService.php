<?php

namespace App\Services\Retrieval;

use App\Models\Paper;

class LimitationEvidenceService
{
    public function __construct(
        private readonly EvidenceRetrievalService $retrieval,
        private readonly EvidenceCitationService $citations,
    ) {}

    public function forPaper(
        Paper $paper,
    ): array {
        $semanticExplicitCandidates = $this->retrieval->forPaper(
            $paper,
            'What limitations, weaknesses, constraints, scope restrictions, future work, and future expansion do the authors explicitly acknowledge?',
            16
        );

        $semanticExplicit = array_values(
            array_filter(
                $semanticExplicitCandidates,
                fn (array $item): bool => $this->isExplicitAuthorStatement($item)
            )
        );

        $semanticExplicit = array_map(
            static function (array $item): array {
                $item['evidence_method'] = 'semantic_retrieval';

                return $item;
            },
            $semanticExplicit
        );

        /*
         * Explicit author statements must not rely only on
         * vector-search recall. Scan every chunk as well.
         */
        $deterministicExplicit =
            $this->scanExplicitAuthorStatements($paper);

        $explicitEvidence = $this->deduplicateByChunk(
            array_merge(
                $semanticExplicit,
                $deterministicExplicit
            )
        );

        usort(
            $explicitEvidence,
            static fn (array $a, array $b): int => [
                $a['page_start'],
                $a['chunk_index'],
            ]
                <=>
                [
                    $b['page_start'],
                    $b['chunk_index'],
                ]
        );

        $inferenceCandidates = $this->retrieval->forPaper(
            $paper,
            'What methodological constraints, dataset biases, evaluation weaknesses, scope restrictions, unresolved issues, or reliability concerns are present?',
            16
        );

        $inferenceEvidence = array_values(
            array_filter(
                $inferenceCandidates,
                fn (array $item): bool => ! $this->isExplicitAuthorStatement($item)
            )
        );

        $inferenceEvidence = array_map(
            static function (array $item): array {
                $item['evidence_method'] = 'semantic_retrieval';

                return $item;
            },
            $inferenceEvidence
        );

        return [
            'explicit_author_statements' => $this->citations->build(
                $explicitEvidence,
                'L'
            ),

            'inference_sources' => $this->citations->build(
                $inferenceEvidence,
                'I'
            ),
        ];
    }

    private function scanExplicitAuthorStatements(
        Paper $paper,
    ): array {
        $evidence = [];

        $chunks = $paper->chunks()
            ->orderBy('chunk_index')
            ->get();

        foreach ($chunks as $chunk) {
            $item = [
                'paper_id' => $paper->id,
                'paper_title' => $paper->title,
                'chunk_id' => $chunk->id,
                'chunk_index' => $chunk->chunk_index,
                'page_start' => $chunk->page_start,
                'page_end' => $chunk->page_end,
                'section' => $chunk->section_title,
                'excerpt' => $chunk->text,
                'similarity' => null,
                'evidence_method' => 'explicit_text_scan',
            ];

            if ($this->isExplicitAuthorStatement($item)) {
                $evidence[] = $item;
            }
        }

        return $evidence;
    }

    private function deduplicateByChunk(
        array $items,
    ): array {
        $unique = [];

        foreach ($items as $item) {
            $chunkId = $item['chunk_id'];

            if (! isset($unique[$chunkId])) {
                $unique[$chunkId] = $item;

                continue;
            }

            /*
             * Prefer semantic result if it has a similarity
             * score and the existing deterministic result does not.
             */
            if (
                ($unique[$chunkId]['similarity'] ?? null) === null
                && ($item['similarity'] ?? null) !== null
            ) {
                $unique[$chunkId] = $item;
            }
        }

        return array_values($unique);
    }

    private function isExplicitAuthorStatement(
        array $item,
    ): bool {
        $section = mb_strtolower(
            trim(
                (string) ($item['section'] ?? '')
            )
        );

        if (
            str_contains($section, 'limitation')
            || str_contains($section, 'future work')
        ) {
            return true;
        }

        $excerpt = mb_strtolower(
            trim(
                (string) ($item['excerpt'] ?? '')
            )
        );

        $explicitPhrases = [
            'explicit acknowledgement',
            'explicitly acknowledge',
            'explicitly acknowledged',
            'acknowledged as a limitation',
            'acknowledge this limitation',
            'limitations of the present work',
            'remains future work',
            'remain future work',
            'future work remains',
            'target for future expansion',
            'future expansion',
            'natural next step',
        ];

        foreach ($explicitPhrases as $phrase) {
            if (str_contains($excerpt, $phrase)) {
                return true;
            }
        }

        return false;
    }
}
