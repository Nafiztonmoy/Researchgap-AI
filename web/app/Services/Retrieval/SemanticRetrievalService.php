<?php

namespace App\Services\Retrieval;

use App\Models\Paper;
use App\Services\Ai\AiServiceClient;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SemanticRetrievalService
{
    private const EMBEDDING_DIMENSIONS = 384;

    public function __construct(
        private readonly AiServiceClient $aiService,
    ) {}

    public function searchPaper(
        Paper $paper,
        string $query,
        int $limit = 8,
    ): array {
        $vectorLiteral = $this->embedQuery($query);

        $limit = max(1, min($limit, 20));

        $results = DB::select(
            <<<'SQL'
            SELECT
                id,
                paper_id,
                chunk_index,
                page_start,
                page_end,
                section_title,
                text,
                1 - (
                    embedding <=> CAST(? AS vector)
                ) AS similarity
            FROM paper_chunks
            WHERE paper_id = ?
              AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(? AS vector)
            LIMIT ?
            SQL,
            [
                $vectorLiteral,
                $paper->id,
                $vectorLiteral,
                $limit,
            ]
        );

        return array_map(
            static fn (object $row): array => [
                'chunk_id' => $row->id,
                'paper_id' => $row->paper_id,
                'chunk_index' => $row->chunk_index,
                'page_start' => $row->page_start,
                'page_end' => $row->page_end,
                'section_title' => $row->section_title,
                'text' => $row->text,
                'similarity' => round(
                    (float) $row->similarity,
                    4
                ),
            ],
            $results
        );
    }

    public function searchProject(
        string $projectId,
        string $query,
        int $limit = 20,
    ): array {
        $vectorLiteral = $this->embedQuery($query);

        $limit = max(1, min($limit, 50));

        $results = DB::select(
            <<<'SQL'
            SELECT
                pc.id,
                pc.paper_id,
                p.title AS paper_title,
                pc.chunk_index,
                pc.page_start,
                pc.page_end,
                pc.section_title,
                pc.text,
                1 - (
                    pc.embedding <=> CAST(? AS vector)
                ) AS similarity
            FROM paper_chunks pc
            INNER JOIN papers p
                ON p.id = pc.paper_id
            WHERE p.research_project_id = ?
              AND pc.embedding IS NOT NULL
            ORDER BY pc.embedding <=> CAST(? AS vector)
            LIMIT ?
            SQL,
            [
                $vectorLiteral,
                $projectId,
                $vectorLiteral,
                $limit,
            ]
        );

        return array_map(
            static fn (object $row): array => [
                'chunk_id' => $row->id,
                'paper_id' => $row->paper_id,
                'paper_title' => $row->paper_title,
                'chunk_index' => $row->chunk_index,
                'page_start' => $row->page_start,
                'page_end' => $row->page_end,
                'section_title' => $row->section_title,
                'text' => $row->text,
                'similarity' => round(
                    (float) $row->similarity,
                    4
                ),
            ],
            $results
        );
    }

    private function embedQuery(
        string $query,
    ): string {
        $query = trim($query);

        if ($query === '') {
            throw new RuntimeException(
                'Semantic search query cannot be empty.'
            );
        }

        $response = $this->aiService->embedTexts([
            $query,
        ]);

        $embedding = $response['embeddings'][0] ?? null;

        if (! is_array($embedding)) {
            throw new RuntimeException(
                'AI service did not return a query embedding.'
            );
        }

        $vector = $embedding['vector'] ?? null;
        $dimensions = $embedding['dimensions'] ?? null;

        if (
            ! is_array($vector)
            || count($vector) !== self::EMBEDDING_DIMENSIONS
            || $dimensions !== self::EMBEDDING_DIMENSIONS
        ) {
            throw new RuntimeException(
                'Query embedding must contain '
                .self::EMBEDDING_DIMENSIONS
                .' dimensions.'
            );
        }

        return '['.implode(',', $vector).']';
    }
}
