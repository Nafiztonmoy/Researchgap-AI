<?php

namespace App\Jobs;

use App\Enums\PaperStatus;
use App\Models\Paper;
use App\Services\Ai\AiServiceClient;
use App\Services\Analysis\SinglePaperAnalysisContextBuilder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class AnalyzePaperJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $paperId,
    ) {}

    public function handle(
        AiServiceClient $aiService,
        SinglePaperAnalysisContextBuilder $contextBuilder,
    ): void {
        $paper = Paper::query()
            ->with('chunks')
            ->findOrFail($this->paperId);

        if ($paper->chunks->isEmpty()) {
            throw new RuntimeException(
                'Cannot analyze paper because it has no chunks.'
            );
        }

        $paper->update([
            'processing_status' => PaperStatus::ANALYZING,
            'processing_error' => null,
        ]);

        try {
            $context = $contextBuilder->build($paper);
            $result = $aiService->analyzeSinglePaper($context);

            DB::transaction(function () use ($paper, $result): void {
                $paper->analysis()->updateOrCreate(
                    ['paper_id' => $paper->id],
                    [
                        'research_problem' => $result['research_problem'] ?? [],
                        'objectives' => $result['objectives'] ?? [],
                        'methodology' => $result['methodology'] ?? [],
                        'datasets_or_data_sources' => $result['datasets_or_data_sources'] ?? [],
                        'key_findings' => $result['key_findings'] ?? [],
                        'contributions' => $result['contributions'] ?? [],
                        'author_stated_limitations' => $result['author_stated_limitations'] ?? [],
                        'ai_inferred_limitations' => $result['ai_inferred_limitations'] ?? [],
                        'future_work' => $result['future_work'] ?? [],
                        'analysis_scope_note' => $result['analysis_scope_note'] ?? null,
                        'analyzed_at' => now(),
                    ]
                );

                $paper->update([
                    'processing_status' => PaperStatus::COMPLETED,
                    'processing_error' => null,
                ]);
            });
        } catch (Throwable $exception) {
            $paper->update([
                'processing_status' => PaperStatus::FAILED,
                'processing_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
