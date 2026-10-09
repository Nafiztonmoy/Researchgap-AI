<?php

namespace App\Jobs;

use App\Enums\PaperStatus;
use App\Models\Paper;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class EmbedPaperJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $paperId,
    ) {}

    public function handle(
        AiServiceClient $aiService,
    ): void {
        $paper = Paper::query()
            ->with([
                'chunks' => fn ($query) => $query
                    ->orderBy('chunk_index'),
            ])
            ->findOrFail($this->paperId);

        if ($paper->chunks->isEmpty()) {
            throw new RuntimeException(
                'Cannot embed paper because it has no chunks.'
            );
        }

        $paper->update([
            'processing_status' => PaperStatus::EMBEDDING,
            'processing_error' => null,
        ]);

        try {
            foreach ($paper->chunks->chunk(16) as $chunkBatch) {
                $chunks = $chunkBatch->values();

                $response = $aiService->embedTexts(
                    $chunks
                        ->pluck('text')
                        ->all()
                );

                $embeddings = $response['embeddings'] ?? [];

                if (count($embeddings) !== $chunks->count()) {
                    throw new RuntimeException(
                        'Embedding count does not match chunk count.'
                    );
                }

                DB::transaction(function () use (
                    $chunks,
                    $embeddings,
                ): void {
                    foreach ($chunks as $index => $chunk) {
                        $embedding = $embeddings[$index];

                        $vector = $embedding['vector'] ?? null;
                        $model = $embedding['model'] ?? null;
                        $dimensions = $embedding['dimensions'] ?? null;

                        if (
                            ! is_array($vector) ||
                            $vector === [] ||
                            ! is_string($model) ||
                            ! is_int($dimensions)
                        ) {
                            throw new RuntimeException(
                                'Invalid embedding response.'
                            );
                        }

                        if (count($vector) !== $dimensions) {
                            throw new RuntimeException(
                                'Embedding vector dimensions do not match.'
                            );
                        }

                        $vectorLiteral = '['
                            .implode(',', $vector)
                            .']';

                        DB::update(
                            <<<'SQL'
                            UPDATE paper_chunks
                            SET
                                embedding = CAST(? AS vector),
                                embedding_model = ?,
                                embedding_dimensions = ?,
                                embedded_at = ?
                            WHERE id = ?
                            SQL,
                            [
                                $vectorLiteral,
                                $model,
                                $dimensions,
                                now(),
                                $chunk->id,
                            ]
                        );
                    }
                });
            }

            $paper->update([
                'processing_status' => PaperStatus::EMBEDDED,
                'processing_error' => null,
            ]);

            AnalyzePaperJob::dispatch($paper->id);
        } catch (Throwable $exception) {
            $paper->update([
                'processing_status' => PaperStatus::FAILED,
                'processing_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
