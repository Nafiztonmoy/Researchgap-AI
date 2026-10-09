<?php

namespace App\Services\Retrieval;

class EvidenceCitationService
{
    public function build(
        array $evidence,
        string $prefix = 'E',
    ): array {
        $prefix = strtoupper(
            trim($prefix)
        );

        if ($prefix === '') {
            $prefix = 'E';
        }

        $citations = [];

        foreach (
            array_values($evidence) as $index => $item
        ) {
            $citations[] = [
                'citation_id' => $prefix.($index + 1),

                'paper' => [
                    'id' => $item['paper_id'],
                    'title' => $item['paper_title'],
                ],

                'location' => [
                    'page_start' => $item['page_start'],

                    'page_end' => $item['page_end'],

                    'page_label' => $this->pageLabel(
                        $item['page_start'],
                        $item['page_end'],
                    ),

                    'section' => $item['section'],

                    'chunk_index' => $item['chunk_index'],
                ],

                'excerpt' => $item['excerpt'],

                'retrieval' => [
                    'similarity' => $item['similarity'] ?? null,
                    'method' => $item['evidence_method'] ?? 'semantic_retrieval',
                ],
            ];
        }

        return $citations;
    }

    private function pageLabel(
        int $pageStart,
        int $pageEnd,
    ): string {
        if ($pageStart === $pageEnd) {
            return 'p. '.$pageStart;
        }

        return 'pp. '.$pageStart.'-'.$pageEnd;
    }
}
