<?php

namespace App\Services\Retrieval;

use App\Models\Paper;

class EvidenceRetrievalService
{
    public function __construct(
        private readonly SemanticRetrievalService $semanticRetrieval,
        private readonly EvidenceQualityFilter $qualityFilter,
    ) {}

    public function forPaper(
        Paper $paper,
        string $query,
        int $limit = 8,
    ): array {
        /*
         * Retrieve slightly more than needed so the quality
         * filter has room to remove noisy chunks.
         */
        $retrievalLimit = min(
            max($limit * 2, 10),
            20
        );

        $results = $this->semanticRetrieval->searchPaper(
            $paper,
            $query,
            $retrievalLimit
        );

        $evidence = array_map(
            static fn (array $result): array => [
                'paper_id' => $paper->id,
                'paper_title' => $paper->title,
                'chunk_id' => $result['chunk_id'],
                'chunk_index' => $result['chunk_index'],
                'page_start' => $result['page_start'],
                'page_end' => $result['page_end'],
                'section' => $result['section_title'],
                'excerpt' => $result['text'],
                'similarity' => $result['similarity'],
            ],
            $results
        );

        return $this->qualityFilter->apply(
            $evidence,
            $limit
        );
    }

    public function forProject(
        string $projectId,
        string $query,
        int $limit = 20,
    ): array {
        $retrievalLimit = min(
            max($limit * 2, 20),
            50
        );

        $results = $this->semanticRetrieval->searchProject(
            $projectId,
            $query,
            $retrievalLimit
        );

        $evidence = array_map(
            static fn (array $result): array => [
                'paper_id' => $result['paper_id'],
                'paper_title' => $result['paper_title'],
                'chunk_id' => $result['chunk_id'],
                'chunk_index' => $result['chunk_index'],
                'page_start' => $result['page_start'],
                'page_end' => $result['page_end'],
                'section' => $result['section_title'],
                'excerpt' => $result['text'],
                'similarity' => $result['similarity'],
            ],
            $results
        );

        return $this->qualityFilter->apply(
            $evidence,
            $limit
        );
    }
}
